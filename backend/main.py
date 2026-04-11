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
    template="""คุณคือผู้ช่วยตอบคำถามโดยอ้างอิงจากเอกสารที่ให้มาเท่านั้น
ตอบเป็นภาษาไทย และตอบให้ตรงประเด็น กระชับ
ถ้าไม่มีข้อมูลในเอกสาร ให้ตอบว่า "ไม่มีข้อมูลในเอกสารที่มี"

เอกสารที่เกี่ยวข้อง:
{context}

คำถาม: {question}

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