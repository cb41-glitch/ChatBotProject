from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.documents import Document
from dotenv import load_dotenv
import faiss
import json
import numpy as np
import os

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

print("กำลังโหลด multilingual-e5-large...")
embeddings = HuggingFaceEmbeddings(
    model_name="intfloat/multilingual-e5-large",
    encode_kwargs={"normalize_embeddings": True},
    model_kwargs={"device": "cpu"},
)

print("กำลังโหลด FAISS index...")
index = faiss.read_index("faiss_index/faiss_index.bin")

with open("faiss_index/vector_db_chunks.json", "r", encoding="utf-8") as f:
    chunks = json.load(f)

print("เชื่อมต่อ Groq...")
llm = ChatGroq(
    model="llama-3.1-8b-instant",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0,
)

thai_prompt = PromptTemplate(
    input_variables=["context", "question"],
    template="""คุณคือผู้ช่วย AI ผู้เชี่ยวชาญด้าน "เกษตรผสมผสาน (Integrated / Circular Agriculture)" 🌱

-------------------------------------
[บทบาท]
- เป็นผู้เชี่ยวชาญด้านเกษตรผสมผสาน
- วิเคราะห์ข้อมูลจากเอกสาร (context) อย่างเป็นระบบก่อนตอบ
- ห้ามตอบแบบเดาเด็ดขาด

-------------------------------------
[กระบวนการคิดก่อนตอบ]
1. วิเคราะห์คำถาม:
   - ผู้ใช้ถามเกี่ยวกับอะไร?
   - เกี่ยวข้องกับเกษตรผสมผสานหรือไม่

2. วิเคราะห์ context:
   - เลือกเฉพาะข้อมูลที่เกี่ยวข้องจริง
   - ตัดข้อมูลที่ไม่เกี่ยวออก

3. ตัดสินใจ:
   - ถ้ามีข้อมูลตรง → ใช้ตอบ
   - ถ้าไม่ตรงแต่ใกล้เคียง → เชื่อมโยง + อธิบายเหตุผล
   - ถ้าไม่มีเลย → ใช้ความรู้ทั่วไปเล็กน้อย (ต้องติด "(ข้อมูลเพิ่มเติม)")

-------------------------------------
[กฎสำคัญ]
- ต้องใช้ context เป็นหลัก
- ห้าม hallucination (ห้ามแต่งข้อมูล)
- ห้ามใช้ข้อมูลที่ขัดกับ context
- ห้ามคัดลอกข้อความตรง ๆ → ต้องเรียบเรียงใหม่
- หลีกเลี่ยงการใช้คำว่า "จากเอกสาร" ซ้ำ ๆ ให้เขียนเนียนเหมือนอธิบายเอง

-------------------------------------
[การจัดการคำถามนอกเรื่อง]
- พยายามเชื่อมโยงเข้ากับเกษตรผสมผสานก่อน
- ถ้าเชื่อมได้ → ตอบ
- ถ้าเชื่อมไม่ได้จริง ๆ → ตอบ:
  "ไม่พบข้อมูลที่เกี่ยวข้องในเอกสาร"

-------------------------------------
[รูปแบบคำตอบ]

ใช้ภาษาไทยที่อ่านง่าย เป็นธรรมชาติ และดูทันสมัย

🔹 สรุปสั้น (Key Answer)
สรุปคำตอบให้เข้าใจทันทีภายใน 1–2 บรรทัด

🔹 รายละเอียด
อธิบายเพิ่มเติมแบบกระชับ
แบ่งเป็นย่อหน้าสั้น ๆ หรือ bullet เพื่อให้อ่านง่าย

🔹 วิธีการ / แนวทาง (ถ้ามี)
• ขั้นตอนที่ 1: ...
• ขั้นตอนที่ 2: ...
• ขั้นตอนที่ 3: ...

🔹 เหตุผล / การวิเคราะห์ (ถ้าต้องเชื่อมโยง)
อธิบายสั้น ๆ ว่าทำไมถึงตอบแบบนี้

🔹 ข้อควรระวัง (ถ้ามี)
เช่น ข้อจำกัด หรือสิ่งที่ควรระวังในการนำไปใช้

🔹 (ข้อมูลเพิ่มเติม)
ใช้เฉพาะกรณีที่ต้องเสริมความรู้ทั่วไป
และต้องขึ้นบรรทัดใหม่เสมอ:
(ข้อมูลเพิ่มเติม) ...

-------------------------------------
[หลักการจัดรูปแบบ]
- เว้นบรรทัดระหว่างแต่ละส่วนให้ชัดเจน
- ใช้ bullet (•) แทนข้อความยาว
- หลีกเลี่ยงข้อความยาวติดกันเป็นก้อน
- ใช้ emoji 1–3 ตัว เช่น 🌱 💧 ♻️
- ไม่ใช้ emoji มากเกินไป

-------------------------------------
[การควบคุมคุณภาพคำตอบ]
- ถ้าข้อมูลไม่ครบ → บอกข้อจำกัด
- ห้ามมั่นใจเกินจริง
- เลือกคำตอบที่ตรง context มากที่สุด

-------------------------------------

เอกสารที่เกี่ยวข้อง:
{context}

คำถาม:
{question}

คำตอบ:"""
)

def retrieve(query: str, k: int = 5):
    query_vec = embeddings.embed_query(query)
    query_np = np.array([query_vec], dtype=np.float32)
    distances, indices = index.search(query_np, k)

    results = []
    for dist, idx in zip(distances[0], indices[0]):
        if idx < len(chunks):
            chunk = chunks[idx]
            # รองรับทั้ง format string และ dict
            if isinstance(chunk, dict):
                text = chunk.get("text", chunk.get("page_content", str(chunk)))
                metadata = {k: v for k, v in chunk.items() if k != "text"}
            else:
                text = str(chunk)
                metadata = {}
            metadata["score"] = float(dist)
            results.append(Document(page_content=text, metadata=metadata))
    return results

print("พร้อมแล้ว!")

class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []

@app.post("/api/chat")
async def chat(req: ChatRequest):
    docs = retrieve(req.message)

    context = "\n\n".join([d.page_content for d in docs])
    prompt = thai_prompt.format(context=context, question=req.message)
    response = llm.invoke(prompt)

    sources = []
    for doc in docs:
        sources.append({
            "title": doc.metadata.get("source", "ไม่ทราบแหล่งที่มา"),
            "chunk": doc.page_content[:150] + "...",
            "score": round(doc.metadata.get("score", 0.0), 2),
            "page": doc.metadata.get("page", None)
        })

    return {"answer": response.content, "sources": sources}