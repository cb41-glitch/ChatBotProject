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