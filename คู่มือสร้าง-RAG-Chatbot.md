# คู่มือสร้าง RAG Chatbot แบบละเอียด (ภาษาไทย)
### Stack: FastAPI + FAISS + Groq (llama-3.1-8b) + React + GitHub

---

## ภาพรวมทั้งหมด

```
[ไฟล์ข้อมูล .zip FAISS]
        ↓
[Backend Python/FastAPI]  ←→  [Groq API (llama-3.1-8b)]
        ↕
[Frontend React]
        ↕
[GitHub Repository]  ←→  [PC]  /  [Macbook]
```

**ทำครั้งเดียวบนเครื่องแรก → push GitHub → pull บนเครื่องที่สอง**

---

## ช่วงที่ 1 — ติดตั้งโปรแกรมที่จำเป็น (ทำทุกเครื่อง)

### 1.1 ติดตั้ง Python

- ไปที่ https://python.org/downloads
- โหลดเวอร์ชันล่าสุด (3.11 ขึ้นไป)
- ตอนติดตั้ง **ติ๊ก "Add Python to PATH"** (สำคัญมาก!)

ทดสอบ:
```bash
python --version
# ควรขึ้น: Python 3.11.x
```

### 1.2 ติดตั้ง Node.js

- ไปที่ https://nodejs.org
- โหลด **LTS version**
- ติดตั้งตามปกติ

ทดสอบ:
```bash
node --version
# ควรขึ้น: v20.x.x
```

### 1.3 ติดตั้ง Git

- ไปที่ https://git-scm.com/downloads
- โหลดตามระบบปฏิบัติการ (Windows / Mac)
- ติดตั้งตามปกติ

ทดสอบ:
```bash
git --version
# ควรขึ้น: git version 2.x.x
```

### 1.4 ตั้งค่า Git (ทำครั้งเดียวต่อเครื่อง)

```bash
git config --global user.name "ชื่อของคุณ"
git config --global user.email "อีเมลที่ใช้สมัคร GitHub"
```

---

## ช่วงที่ 2 — สร้างโปรเจกต์และโค้ด (ทำบนเครื่องแรกเท่านั้น)

### 2.1 สร้างโฟลเดอร์โปรเจกต์

เปิด Terminal แล้วรันทีละบรรทัด:

```bash
mkdir my-chatbot
cd my-chatbot
mkdir backend
mkdir frontend
```

โครงสร้างที่จะได้:
```
my-chatbot/
├── backend/
└── frontend/
```

### 2.2 แตกไฟล์ FAISS zip

นำไฟล์ zip ที่มีอยู่ไปวางใน `backend/` แล้วแตกไฟล์ออก ควรได้:

```
backend/
└── faiss_index/
    ├── index.faiss
    └── index.pkl
```

> ถ้าชื่อโฟลเดอร์ต่างออกไป ให้เปลี่ยนชื่อเป็น `faiss_index`

### 2.3 ตั้งค่า Backend

**เข้าโฟลเดอร์ backend และสร้าง virtual environment:**

```bash
cd backend
python -m venv venv
```

**เปิดใช้งาน virtual environment:**

```bash
# Windows:
venv\Scripts\activate

# Mac/Linux:
source venv/bin/activate
```

หลังรันสำเร็จจะเห็น `(venv)` ขึ้นหน้า Terminal:
```
(venv) C:\my-chatbot\backend>
```

> ⚠️ ทุกครั้งที่เปิด Terminal ใหม่ ต้องรัน activate ก่อนเสมอ

**ติดตั้ง packages:**

```bash
pip install fastapi uvicorn faiss-cpu langchain langchain-groq langchain-huggingface langchain-community sentence-transformers python-dotenv
```

> อาจใช้เวลา 3-5 นาที รอได้เลยครับ

**บันทึก packages ลงไฟล์:**

```bash
pip freeze > requirements.txt
```

### 2.4 สร้างไฟล์ .env

สร้างไฟล์ชื่อ `.env` ใน `backend/` (ไม่มีนามสกุล):

```
GROQ_API_KEY=gsk_xxxxxxxxxxxx
```

> API Key ได้จาก https://console.groq.com → "API Keys" → "Create API Key"

### 2.5 สร้างไฟล์ .env.example

สร้างไฟล์ชื่อ `.env.example` ใน `backend/` (ไฟล์นี้จะอัพขึ้น GitHub เพื่อเตือนว่าต้องใส่ key อะไร):

```
GROQ_API_KEY=ใส่_groq_api_key_ของคุณ_ตรงนี้
```

### 2.6 สร้างไฟล์ main.py

สร้างไฟล์ `backend/main.py`:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain.chains import ConversationalRetrievalChain
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

print("กำลังโหลด multilingual-e5-large (อาจใช้เวลา 1-2 นาทีครั้งแรก)...")
embeddings = HuggingFaceEmbeddings(
    model_name="intfloat/multilingual-e5-large",
    encode_kwargs={"normalize_embeddings": True},
    query_instruction="query: "
)

print("กำลังโหลด FAISS index...")
db = FAISS.load_local(
    "faiss_index",
    embeddings,
    allow_dangerous_deserialization=True
)

retriever = db.as_retriever(search_kwargs={"k": 5})

print("เชื่อมต่อ Groq...")
llm = ChatGroq(
    model="llama-3.1-8b-instant",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0,
)

thai_prompt = PromptTemplate(
    input_variables=["context", "question"],
    template="""คุณคือผู้ช่วยที่ตอบคำถามโดยอ้างอิงจากเอกสารที่ให้มาเท่านั้น
ตอบเป็นภาษาไทยเสมอ และตอบให้กระชับ ชัดเจน
ถ้าไม่พบข้อมูลในเอกสาร ให้บอกว่า "ไม่พบข้อมูลในเอกสารที่มี"

เอกสารที่เกี่ยวข้อง:
{context}

คำถาม: {question}

คำตอบ:"""
)

chain = ConversationalRetrievalChain.from_llm(
    llm, retriever,
    return_source_documents=True,
    combine_docs_chain_kwargs={"prompt": thai_prompt}
)

print("พร้อมใช้งานแล้ว!")

class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []

@app.post("/api/chat")
async def chat(req: ChatRequest):
    chat_history = [(h["user"], h["bot"]) for h in req.history]

    result = chain.invoke({
        "question": req.message,
        "chat_history": chat_history
    })

    sources = []
    for doc in result["source_documents"]:
        sources.append({
            "title": doc.metadata.get("source", "ไม่ทราบแหล่งที่มา"),
            "chunk": doc.page_content[:150] + "...",
            "score": round(doc.metadata.get("score", 0.0), 2),
            "page": doc.metadata.get("page", None)
        })

    return {"answer": result["answer"], "sources": sources}
```

### 2.7 ทดสอบ Backend

```bash
cd backend
uvicorn main:app --reload --port 8000
```

ถ้าสำเร็จจะเห็น:
```
กำลังโหลด multilingual-e5-large...
กำลังโหลด FAISS index...
เชื่อมต่อ Groq...
พร้อมใช้งานแล้ว!
INFO: Uvicorn running on http://127.0.0.1:8000
```

เปิดเบราว์เซอร์ไปที่ `http://localhost:8000/docs` — ถ้าเห็นหน้า Swagger = ✅ Backend พร้อมแล้ว

### 2.8 ตั้งค่า Frontend

**เปิด Terminal ใหม่** (อย่าปิดหน้าที่รัน backend อยู่) แล้วรัน:

```bash
cd my-chatbot/frontend
npm create vite@latest . -- --template react
# ถามว่า "Ok to proceed?" พิมพ์ y แล้ว Enter

npm install
npm install axios react-markdown
```

### 2.9 สร้างไฟล์ Chatbot.jsx

สร้างไฟล์ `frontend/src/Chatbot.jsx`:

```jsx
import { useState, useRef, useEffect } from "react"
import axios from "axios"
import ReactMarkdown from "react-markdown"

const API_URL = "http://localhost:8000/api/chat"

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "สวัสดีครับ! ถามอะไรก็ได้เลย ฉันจะค้นหาข้อมูลจากเอกสารให้" }
  ])
  const [history, setHistory] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [sources, setSources] = useState([])
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput("")
    setLoading(true)
    setMessages(prev => [...prev, { role: "user", text }])

    try {
      const { data } = await axios.post(API_URL, {
        message: text,
        history: history
      })
      setMessages(prev => [...prev, { role: "bot", text: data.answer }])
      setSources(data.sources || [])
      setHistory(prev => [...prev, { user: text, bot: data.answer }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "bot",
        text: "❌ เกิดข้อผิดพลาด กรุณาตรวจสอบว่า Backend รันอยู่ที่ port 8000"
      }])
    } finally {
      setLoading(false)
    }
  }

  const scoreColor = (s) => s >= 0.9 ? "#0F6E56" : s >= 0.8 ? "#185FA5" : "#888"

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif", background: "#f5f5f5" }}>

      {/* Chat area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fff" }}>

        <div style={{ padding: "14px 20px", borderBottom: "1px solid #eee", fontWeight: 500 }}>
          RAG Chatbot — llama-3.1-8b (Groq)
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "70%", padding: "10px 14px", borderRadius: 12,
                background: m.role === "user" ? "#E1F5EE" : "#f0f0f0",
                fontSize: 14, lineHeight: 1.7
              }}>
                <ReactMarkdown>{m.text}</ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ color: "#aaa", fontSize: 13, padding: "4px 8px" }}>
              กำลังค้นหาและตอบ...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div style={{ padding: "12px 16px", borderTop: "1px solid #eee", display: "flex", gap: 8 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() }
            }}
            placeholder="พิมพ์คำถาม... (Enter = ส่ง, Shift+Enter = ขึ้นบรรทัดใหม่)"
            rows={2}
            style={{
              flex: 1, resize: "none", padding: "8px 12px",
              borderRadius: 8, border: "1px solid #ddd", fontSize: 14
            }}
          />
          <button onClick={send} disabled={loading}
            style={{
              padding: "0 20px", borderRadius: 8,
              background: loading ? "#aaa" : "#1D9E75",
              color: "white", border: "none",
              cursor: loading ? "not-allowed" : "pointer", fontSize: 14
            }}>
            ส่ง
          </button>
        </div>
      </div>

      {/* Sources panel */}
      <div style={{ width: 280, borderLeft: "1px solid #eee", background: "#fafafa", overflowY: "auto" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #eee", fontWeight: 500, fontSize: 14 }}>
          Sources จาก Vector DB
        </div>
        <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {sources.length === 0
            ? <p style={{ color: "#bbb", fontSize: 13, textAlign: "center", marginTop: 32 }}>
                ยังไม่มี sources<br />ลองส่งคำถามก่อน
              </p>
            : sources.map((s, i) => (
              <div key={i} style={{
                background: "#fff", border: "1px solid #eee",
                borderRadius: 8, padding: "10px 12px"
              }}>
                <p style={{ margin: "0 0 4px", fontWeight: 500, fontSize: 13 }}>{s.title}</p>
                <p style={{ margin: "0 0 6px", fontSize: 12, color: "#666", fontStyle: "italic", lineHeight: 1.5 }}>
                  {s.chunk}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span style={{ color: scoreColor(s.score), fontWeight: 500 }}>similarity: {s.score}</span>
                  {s.page && <span style={{ color: "#aaa" }}>หน้า {s.page}</span>}
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
```

### 2.10 แก้ไฟล์ App.jsx

เปิด `frontend/src/App.jsx` แล้วแทนที่ทุกอย่างด้วย:

```jsx
import Chatbot from "./Chatbot"
export default function App() {
  return <Chatbot />
}
```

### 2.11 ทดสอบ Frontend

```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่ `http://localhost:5173` — ถ้าเห็นหน้า chat = ✅ พร้อมใช้งาน

---

## ช่วงที่ 3 — ตั้งค่า GitHub และ Push โค้ด (ทำบนเครื่องแรก)

### 3.1 สร้าง Repository บน GitHub

1. เข้า https://github.com → กด **New repository**
2. ตั้งชื่อ เช่น `my-chatbot`
3. เลือก **Private** (เพราะมี API key)
4. **อย่าติ๊ก** Add README, .gitignore, หรือ license
5. กด **Create repository**
6. **คัดลอก URL** ที่ขึ้นมา เช่น `https://github.com/ชื่อคุณ/my-chatbot.git`

### 3.2 สร้างไฟล์ .gitignore

สร้างไฟล์ `.gitignore` ใน `my-chatbot/` (โฟลเดอร์นอกสุด):

```
# API key — ห้ามอัพโหลดเด็ดขาด
.env

# Virtual environment — ติดตั้งใหม่ได้เสมอ
backend/venv/

# Node modules — ติดตั้งใหม่ได้เสมอ
frontend/node_modules/

# ไฟล์ระบบ
.DS_Store
__pycache__/
*.pyc
```

> ถ้าไฟล์ FAISS ใหญ่เกิน 100MB ให้เพิ่มบรรทัดนี้ด้วย: `backend/faiss_index/`
> (ถ้าเล็กกว่า 100MB อัพได้เลย ไม่ต้องเพิ่ม)

### 3.3 Push ขึ้น GitHub

```bash
cd my-chatbot

git init
git add .
git commit -m "first commit: RAG chatbot Thai"
git branch -M main
git remote add origin https://github.com/ชื่อของคุณ/my-chatbot.git
git push -u origin main
```

> ระบบอาจถามล็อกอิน GitHub — ใส่ username และ password ได้เลย
> (ถ้าไม่ผ่าน ให้ใช้ Personal Access Token แทน password จาก GitHub Settings → Developer settings → Tokens)

---

## ช่วงที่ 4 — ตั้งค่าบนเครื่องที่สอง

### 4.1 Clone โปรเจกต์

```bash
git clone https://github.com/ชื่อของคุณ/my-chatbot.git
cd my-chatbot
```

### 4.2 ตั้งค่า Backend

```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# Mac:
source venv/bin/activate

pip install -r requirements.txt
```

**สร้างไฟล์ .env ใหม่** (ต้องทำในทุกเครื่อง เพราะไม่ได้อัพขึ้น GitHub):

```bash
# Windows: สร้างไฟล์ .env แล้วใส่ข้อความนี้
# Mac: รันคำสั่งนี้
cp .env.example .env
```

แล้วเปิดไฟล์ `.env` และใส่ GROQ_API_KEY จริงของคุณ

**รัน Backend:**

```bash
uvicorn main:app --reload --port 8000
```

### 4.3 ตั้งค่า Frontend

เปิด Terminal ใหม่:

```bash
cd my-chatbot/frontend
npm install
npm run dev
```

เปิด `http://localhost:5173` — พร้อมใช้งาน ✅

---

## การใช้งานประจำวัน

### เริ่มทำงานทุกวัน (ทุกเครื่อง)

```bash
# 1. ดึงโค้ดล่าสุดจาก GitHub ก่อนเสมอ
cd my-chatbot
git pull

# 2. รัน Backend (Terminal หน้าที่ 1)
cd backend
source venv/bin/activate   # Mac
# หรือ venv\Scripts\activate  # Windows
uvicorn main:app --reload --port 8000

# 3. รัน Frontend (Terminal หน้าที่ 2)
cd frontend
npm run dev
```

### เสร็จทำงาน — อัพโค้ดขึ้น GitHub

```bash
cd my-chatbot
git add .
git commit -m "อธิบายสั้นๆ ว่าแก้อะไร เช่น แก้ prompt ภาษาไทย"
git push
```

---

## แก้ปัญหาที่พบบ่อย

| Error ที่เห็น | สาเหตุ | วิธีแก้ |
|---|---|---|
| `(venv)` หายไป | ปิด Terminal แล้วเปิดใหม่ | รัน activate ใหม่ทุกครั้ง |
| `GROQ_API_KEY not found` | ไม่มีไฟล์ .env | สร้างไฟล์ .env และใส่ key |
| `Connection refused` | Backend ไม่ได้รัน | เปิด Terminal รัน uvicorn |
| `d == self.d (X != Y)` | embedding model ไม่ตรง | ตรวจสอบว่าใช้ multilingual-e5-large ตั้งแต่ตอนสร้าง index |
| `torch not found` | ขาด package | `pip install torch transformers` |
| GitHub ไม่รับ push | ไฟล์ใหญ่เกิน 100MB | เพิ่ม `backend/faiss_index/` ใน .gitignore |

---

## โครงสร้างไฟล์สุดท้าย

```
my-chatbot/
├── .gitignore                  ← บอก Git อย่าอัพไฟล์ไหน
├── backend/
│   ├── main.py                 ← โค้ด Backend หลัก
│   ├── requirements.txt        ← รายการ packages Python
│   ├── .env                    ← API key (ไม่อยู่บน GitHub)
│   ├── .env.example            ← ตัวอย่าง (อยู่บน GitHub)
│   └── faiss_index/
│       ├── index.faiss
│       └── index.pkl
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   └── Chatbot.jsx
    ├── package.json
    └── node_modules/           ← ไม่อยู่บน GitHub
```
