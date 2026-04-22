import { useState, useRef, useEffect } from "react"
import axios from "axios"
import ReactMarkdown from "react-markdown"

const API_URL = "http://localhost:8000/api/chat"

export default function Chatbot({ onBackHome }) {
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            <div>
              <b>🌾 Circular Farming Assistant</b>
              <div style={{ fontSize: 12, color: "#666" }}>
                ออนไลน์ • พร้อมช่วยเหลือ
              </div>
            </div>
            {onBackHome && (
              <button 
                onClick={onBackHome}
                style={styles.backButton}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(22, 163, 74, 0.1)"
                  e.target.style.transform = "scale(1.1)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent"
                  e.target.style.transform = "scale(1)"
                }}
              >
                ← กลับหน้าแรก
              </button>
            )}
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

{/* Info Panel */}
      <div style={styles.infoPanel}>
        <div style={styles.infoPanelContent}>
          <h3 style={styles.infoPanelTitle}>💡 เคล็ดลับการเกษตร</h3>
          
          <div style={styles.tipCard}>
            <div style={styles.tipIcon}>🌿</div>
            <div style={styles.tipText}>
              <strong>ปลูกพืช</strong>
              <p>วางแผนการปลูกพืชอย่างสมเหตุสมผล</p>
            </div>
          </div>

          <div style={styles.tipCard}>
            <div style={styles.tipIcon}>🌱</div>
            <div style={styles.tipText}>
              <strong>ดินสุขภาพดี</strong>
              <p>รักษาคุณภาพดินด้วยปุ๋ยเหมาะสม</p>
            </div>
          </div>

          <div style={styles.tipCard}>
            <div style={styles.tipIcon}>♻️</div>
            <div style={styles.tipText}>
              <strong>เกษตรหมุนเวียน</strong>
              <p>สนับสนุนการเกษตรยั่งยืน</p>
            </div>
          </div>
        </div>
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
    background: "#fff",
    overflow: "hidden"
  },

  sidebar: {
    width: 220,
    background: "linear-gradient(135deg, #14532d 0%, #1a6b3a 100%)",
    color: "#fff",
    padding: 24,
    display: "flex",
    flexDirection: "column",
    boxShadow: "2px 0 8px rgba(0, 0, 0, 0.1)"
  },

  menu: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginTop: 24
  },

  menuItem: {
    padding: "12px 14px",
    borderRadius: 10,
    cursor: "pointer",
    background: "rgba(255,255,255,0.08)",
    transition: "all 0.3s ease",
    fontSize: 14,
    fontWeight: 500,
    border: "1px solid rgba(255,255,255,0.1)",
    "&:hover": {
      background: "rgba(255,255,255,0.15)"
    }
  },

  footer: {
    marginTop: "auto",
    fontSize: 12,
    opacity: 0.8,
    paddingTop: 20,
    borderTop: "1px solid rgba(255,255,255,0.1)"
  },

  chat: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: "#f8fafb"
  },

  header: {
    padding: "20px 24px",
    borderBottom: "1px solid #e5e7eb",
    background: "#fff",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
  },

  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    background: "#f8fafb"
  },

  bubble: {
    maxWidth: "65%",
    padding: "12px 16px",
    borderRadius: 16,
    fontSize: 14,
    lineHeight: 1.6,
    wordWrap: "break-word"
  },

  user: {
    background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
    color: "#fff",
    boxShadow: "0 2px 8px rgba(22, 163, 74, 0.2)"
  },

  bot: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
  },

  inputBox: {
    display: "flex",
    padding: 16,
    gap: 12,
    background: "#fff",
    borderTop: "1px solid #e5e7eb",
    boxShadow: "0 -1px 3px rgba(0, 0, 0, 0.05)"
  },

  textarea: {
    flex: 1,
    resize: "none",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    padding: "12px 14px",
    fontFamily: "Inter, sans-serif",
    fontSize: 14,
    transition: "all 0.3s ease",
    outline: "none",
    "&:focus": {
      borderColor: "#16a34a",
      boxShadow: "0 0 0 3px rgba(22, 163, 74, 0.1)"
    }
  },

  button: {
    background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
    transition: "all 0.3s ease",
    boxShadow: "0 2px 8px rgba(22, 163, 74, 0.2)",
    "&:hover": {
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)"
    }
  },

  backButton: {
    background: "transparent",
    color: "#16a34a",
    border: "1px solid #d1fae5",
    padding: "8px 16px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 13,
    transition: "all 0.3s ease"
  },

  sources: {
    width: 280,
    background: "#fff",
    padding: 20,
    overflowY: "auto",
    borderLeft: "1px solid #e5e7eb",
    boxShadow: "-2px 0 8px rgba(0, 0, 0, 0.05)"
  },

  card: {
    background: "#f8fafb",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 12,
    border: "1px solid #e5e7eb",
    transition: "all 0.3s ease"
  },

  infoPanel: {
    width: 300,
    background: "linear-gradient(135deg, #f0fdf4 0%, #f1fdf8 100%)",
    padding: 24,
    overflowY: "auto",
    borderLeft: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column"
  },

  infoPanelContent: {
    display: "flex",
    flexDirection: "column",
    gap: 16
  },

  infoPanelTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#14532d",
    marginBottom: 12,
    margin: 0
  },

  tipCard: {
    background: "#fff",
    padding: 14,
    borderRadius: 12,
    border: "1px solid #d1fae5",
    display: "flex",
    gap: 12,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 1px 3px rgba(22, 163, 74, 0.08)",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(22, 163, 74, 0.15)"
    }
  },

  tipIcon: {
    fontSize: 24,
    minWidth: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  tipText: {
    textAlign: "left",
    fontSize: 13,
    color: "#374151"
  }
}