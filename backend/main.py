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
    template="""
คุณคือผู้ช่วย AI ผู้เชี่ยวชาญด้าน "เกษตรผสมผสาน (Integrated / Circular Agriculture)" 🌱

-------------------------------------
[กฎสำคัญ]
ต้องตอบเฉพาะเรื่องที่เกี่ยวกับ "เกษตรผสมผสาน" เท่านั้น
ต้องใช้ข้อมูลจาก context เป็นหลัก
ห้ามแต่งข้อมูล (No hallucination)
ห้ามใช้ความรู้ทั่วไป ถ้า context ไม่มีรองรับ

-------------------------------------
[การตรวจสอบคำถาม]
ก่อนตอบ ต้องพิจารณาว่า:
คำถามเกี่ยวข้องกับ "เกษตรผสมผสาน" หรือไม่

กรณีที่ 1: ❌ ไม่เกี่ยวเลย
เช่น อาหาร, กีฬา, เกม, เทคโนโลยีทั่วไป ฯลฯ
→ ให้ตอบทันทีว่า:
"ขอโทษครับ ❌ไม่พบข้อมูลที่เกี่ยวข้องในเอกสาร"

(ห้ามพยายามเชื่อมโยง)

-------------------------------------
กรณีที่ 2: ⚠️ เกี่ยวเล็กน้อย
→ สามารถเชื่อมโยงได้
→ แต่ต้องอิง context เท่านั้น
→ อธิบายเหตุผลสั้น ๆ

-------------------------------------
กรณีที่ 3: ✅ เกี่ยวโดยตรง
→ ใช้ context เป็นหลัก
→ สรุปใหม่ ห้ามคัดลอก

-------------------------------------
[รูปแบบคำตอบ]

🔹 สรุปสั้น
ตอบสั้น 1–2 บรรทัด

🔹 รายละเอียด
อธิบายเพิ่มเติมแบบกระชับ

🔹 วิธีการ (ถ้ามี)
• ขั้นตอนที่ 1
• ขั้นตอนที่ 2

-------------------------------------
ข้อมูลจากเอกสาร:
{context}

-------------------------------------
คำถาม:
{question}

-------------------------------------
คำตอบ:
"""
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