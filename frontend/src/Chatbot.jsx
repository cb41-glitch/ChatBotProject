import { useState, useRef, useEffect } from "react"
import axios from "axios"
import ReactMarkdown from "react-markdown"

const API_URL = "http://localhost:8000/api/chat"

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "🌱 สวัสดี! ฉันคือ AI เกษตรหมุนเวียน ถามได้เลยเกี่ยวกับดิน ปุ๋ย หรือการปลูกพืช" }
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
        history
      })

      setMessages(prev => [...prev, { role: "bot", text: data.answer }])
      setSources(data.sources || [])
      setHistory(prev => [...prev, { user: text, bot: data.answer }])
    } catch {
      setMessages(prev => [...prev, {
        role: "bot",
        text: "❌ ไม่สามารถเชื่อมต่อระบบได้"
      }])
    } finally {
      setLoading(false)
    }
  }

  const scoreColor = (s) =>
    s >= 0.9 ? "#16a34a" :
    s >= 0.8 ? "#2563eb" :
    "#999"

  return (
    <div style={styles.container}>

      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h2 style={{ marginBottom: 20 }}>🌿 Agri AI</h2>

        <div style={styles.menu}>
          <div style={styles.menuItem}>🌱 ระบบเกษตรหมุนเวียน</div>
          <div style={styles.menuItem}>💬 แชทกับ AI</div>
          <div style={styles.menuItem}>📊 วิเคราะห์ข้อมูล</div>
        </div>

        <div style={styles.footer}>
          <p>AI เพื่อเกษตรยั่งยืน</p>
        </div>
      </div>

      {/* Chat */}
      <div style={styles.chat}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <b>🌾 Circular Farming Assistant</b>
            <div style={{ fontSize: 12, color: "#666" }}>
              ออนไลน์ • พร้อมช่วยเหลือ
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={styles.messages}>
          {messages.map((m, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start"
            }}>
              <div style={{
                ...styles.bubble,
                ...(m.role === "user" ? styles.user : styles.bot)
              }}>
                <ReactMarkdown>{m.text}</ReactMarkdown>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ color: "#888", fontSize: 13 }}>
              🌿 AI กำลังวิเคราะห์...
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={styles.inputBox}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            placeholder="ถามเกี่ยวกับการปลูกพืช ปุ๋ย หรือดิน..."
            style={styles.textarea}
          />

          <button onClick={send} disabled={loading} style={styles.button}>
            ส่ง
          </button>
        </div>
      </div>

      {/* Sources */}
      <div style={styles.sources}>
        <h4>📄 แหล่งข้อมูล</h4>

        {sources.length === 0 ? (
          <p style={{ color: "#aaa" }}>ยังไม่มีข้อมูล</p>
        ) : sources.map((s, i) => (
          <div key={i} style={styles.card}>
            <b>{s.title}</b>
            <p style={{ fontSize: 12 }}>{s.chunk}</p>
            <span style={{ color: scoreColor(s.score) }}>
              score: {s.score}
            </span>
          </div>
        ))}
      </div>

    </div>
  )
}

/* ================= STYLE ================= */

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "Inter, sans-serif",
    background: "#eef7f0"
  },

  sidebar: {
    width: 220,
    background: "#14532d",
    color: "#fff",
    padding: 20,
    display: "flex",
    flexDirection: "column"
  },

  menu: {
    display: "flex",
    flexDirection: "column",
    gap: 10
  },

  menuItem: {
    padding: "10px 12px",
    borderRadius: 8,
    cursor: "pointer",
    background: "rgba(255,255,255,0.05)"
  },

  footer: {
    marginTop: "auto",
    fontSize: 12,
    opacity: 0.7
  },

  chat: {
    flex: 1,
    display: "flex",
    flexDirection: "column"
  },

  header: {
    padding: 16,
    borderBottom: "1px solid #ddd",
    background: "#fff"
  },

  messages: {
    flex: 1,
    overflowY: "auto",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 12
  },

  bubble: {
    maxWidth: "65%",
    padding: "12px 16px",
    borderRadius: 16,
    fontSize: 14,
    lineHeight: 1.6
  },

  user: {
    background: "#16a34a",
    color: "#fff"
  },

  bot: {
    background: "#fff",
    border: "1px solid #ddd"
  },

  inputBox: {
    display: "flex",
    padding: 12,
    gap: 10,
    background: "#fff",
    borderTop: "1px solid #ddd"
  },

  textarea: {
    flex: 1,
    resize: "none",
    borderRadius: 10,
    border: "1px solid #ccc",
    padding: 10
  },

  button: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    padding: "0 20px",
    borderRadius: 10,
    cursor: "pointer"
  },

  sources: {
    width: 260,
    background: "#f9fafb",
    padding: 16,
    overflowY: "auto",
    borderLeft: "1px solid #ddd"
  },

  card: {
    background: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 12
  }
}