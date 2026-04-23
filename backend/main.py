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

ข้อกำหนดสำคัญ:
ต้องใช้ข้อมูลจาก "เอกสาร (context)" เป็นหลัก
สามารถใช้ความรู้ทั่วไปเพิ่มเติมได้เล็กน้อยเพื่ออธิบายให้เข้าใจง่ายขึ้น
ห้ามแต่งข้อมูลที่ขัดกับเอกสาร (No hallucination)

แนวทางการตอบ:
ตรวจสอบว่าคำถามเกี่ยวกับ "เกษตรผสมผสาน" หรือไม่
ถ้าไม่เกี่ยวโดยตรง:
→ ให้พยายามเชื่อมโยงคำถามกับข้อมูลด้านเกษตรผสมผสานจากเอกสารที่มี
→ และตอบโดยอ้างอิงจากเนื้อหาในเอกสารที่เกี่ยวข้องหรือใกล้เคียง
→ หลีกเลี่ยงการปฏิเสธทันที และให้คำตอบที่เป็นประโยชน์ก่อนเสมอ
→ หากไม่สามารถเชื่อมโยงได้จริง ๆ ค่อยตอบว่า:"ไม่พบข้อมูลที่เกี่ยวข้องในเอกสาร"

หากมีข้อมูลในเอกสาร:
ให้ตอบโดยอ้างอิงจาก context เป็นหลัก
สรุปใหม่ให้เข้าใจง่าย (ห้ามคัดลอกตรง ๆ)

หากข้อมูลไม่ตรงคำถามโดยตรง:
ให้วิเคราะห์จากข้อมูลที่ใกล้เคียงในเอกสาร
อธิบายเหตุผลสั้น ๆ

หากไม่มีข้อมูลที่เกี่ยวข้อง:
ให้สรุปจากข้อมูลที่ใกล้เคียงในเอกสาร
และสามารถเสริมความรู้ทั่วไปเล็กน้อยเพื่อให้คำตอบสมบูรณ์
โดยต้องระบุให้ชัดว่าเป็น "(ข้อมูลเพิ่มเติม)"

ห้าม:
ห้ามเดา
ห้ามตอบนอกหัวข้อ
ห้ามใช้ข้อมูลที่ขัดกับเอกสาร

รูปแบบคำตอบ:
ใช้ภาษาไทยที่อ่านง่าย เป็นธรรมชาติ และดูทันสมัย
จัดรูปแบบให้อ่านง่าย แบ่งเป็นย่อหน้า หรือหัวข้อ
ใช้ emoji เล็กน้อยเพื่อช่วยสื่อความหมาย เช่น 🌱 💧 🌾 ♻️ (ไม่เกิน 2-4 ต่อคำตอบ)

รูปแบบการแสดงผล:
ถ้าเป็นคำอธิบาย → สรุปเป็นย่อหน้าสั้น ๆ
ถ้าเป็นวิธีทำ / ขั้นตอน → ใช้ bullet เช่น:
• ขั้นตอนที่ 1
• ขั้นตอนที่ 2

ถ้ามีข้อมูลเพิ่มเติม:
→ ขึ้นบรรทัดใหม่ว่า "(ข้อมูลเพิ่มเติม)" แล้วอธิบายสั้น ๆ

สไตล์:
โทนเหมือน ChatGPT (ดูมืออาชีพ + เป็นมิตร)
ไม่ทางการเกินไป
ไม่ยาวเกินจำเป็น แต่ครบประเด็น
เว้นบรรทัดให้อ่านง่าย

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