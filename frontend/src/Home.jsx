import { useState } from "react"

export default function Home({ onStart }) {
  const [isHovered, setIsHovered] = useState(false)

  const questions = [
    {
      icon: "🌱",
      title: "ความรู้การปลูก",
      desc: "เรียนรู้เทคนิคการปลูกพืชที่ยั่งยืน",
      question: "ช่วยอธิบายเทคนิคการปลูกพืชที่ยั่งยืนให้ฉันหน่อยได้ไหม"
    },
    {
      icon: "🌍",
      title: "ดินเหมาะสม",
      desc: "รับคำแนะนำเกี่ยวกับการดูแลดิน",
      question: "ดินสุขภาพดีต้องมีคุณสมบัติอะไรบ้าง"
    },
    {
      icon: "♻️",
      title: "เกษตรหมุนเวียน",
      desc: "สนับสนุนการเกษตรที่เป็นมิตรกับสิ่งแวดล้อม",
      question: "เกษตรหมุนเวียนคืออะไร และมีประโยชน์อย่างไร"
    },
    {
      icon: "🚀",
      title: "AI อัจฉริยะ",
      desc: "เทคโนโลยี AI สำหรับเกษตร",
      question: "AI ช่วยเกษตรกรได้อย่างไรบ้าง"
    }
  ]

  return (
    <div style={styles.container}>
      <div style={styles.bg1}></div>
      <div style={styles.bg2}></div>

      <div style={styles.content}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>🌾</div>
          <h1 style={styles.title}>Circular Farming Assistant</h1>
          <p style={styles.subtitle}>AI ผู้ช่วยเกษตรกรรมยั่งยืน</p>
        </div>

        {/* Cards */}
        <div style={styles.grid}>
          {questions.map((q, i) => (
            <div
              key={i}
              style={styles.card}
              onClick={() => onStart(q.question)}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-6px)"
                e.currentTarget.style.boxShadow = "0 12px 20px rgba(22,163,74,0.15)"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(22,163,74,0.08)"
              }}
            >
              <div style={styles.icon}>{q.icon}</div>
              <h3>{q.title}</h3>
              <p>{q.desc}</p>
            </div>
          ))}
        </div>

        {/* Highlights */}
        <div style={styles.highlights}>
          <span>✨ ใช้งานได้ 24/7</span>
          <span>📚 ความรู้ครบ</span>
          <span>🎯 ตรงจุด</span>
        </div>

        {/* Button */}
        <button
          style={{
            ...styles.button,
            ...(isHovered ? styles.buttonHover : {})
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => onStart("")}
        >
          เริ่มสนทนา →
        </button>

        <p style={styles.footer}>🌿 เกษตรอัจฉริยะ เพื่ออนาคตที่ยั่งยืน</p>

      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: "100vh",
    width: "100%",
    paddingTop: 80, // 🔥 แก้ติดขอบบนตรงนี้
    background: "linear-gradient(135deg,#f0fdf4,#ecfdf5)",
    display: "flex",
    alignItems: "flex-start", // 🔥 สำคัญ
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    fontFamily: "Inter, sans-serif"
  },

  bg1: {
    position: "absolute",
    top: "-30%",
    right: "-10%",
    width: 400,
    height: 400,
    background: "rgba(22,163,74,0.08)",
    borderRadius: "50%"
  },

  bg2: {
    position: "absolute",
    bottom: "-20%",
    left: "-10%",
    width: 300,
    height: 300,
    background: "rgba(22,163,74,0.06)",
    borderRadius: "50%"
  },

  content: {
    maxWidth: 1000,
    width: "100%",
    textAlign: "center",
    padding: "0 20px"
  },

  header: {
    marginBottom: 50
  },

  logo: {
    fontSize: 70,
    marginBottom: 10
  },

  title: {
    fontSize: 48,
    fontWeight: 700,
    color: "#14532d"
  },

  subtitle: {
    fontSize: 18,
    color: "#6b7280"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
    gap: 20,
    marginBottom: 40
  },

  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 14,
    border: "1px solid #d1fae5",
    boxShadow: "0 4px 6px rgba(22,163,74,0.08)",
    cursor: "pointer",
    transition: "0.3s"
  },

  icon: {
    fontSize: 40,
    marginBottom: 10
  },

  highlights: {
    display: "flex",
    justifyContent: "center",
    gap: 20,
    marginBottom: 30,
    flexWrap: "wrap",
    color: "#14532d"
  },

  button: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    padding: "14px 40px",
    borderRadius: 12,
    fontSize: 16,
    cursor: "pointer",
    transition: "0.3s"
  },

  buttonHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 8px 20px rgba(22,163,74,0.3)"
  },

  footer: {
    marginTop: 20,
    color: "#6b7280"
  }
}