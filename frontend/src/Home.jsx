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
      desc: "เทคโนโลยี AI ที่ทันสมัยสำหรับเกษตร",
      question: "AI ช่วยเกษตรกรได้อย่างไรบ้าง"
    }
  ]

  return (
    <div style={styles.container}>
      {/* Background decoration */}
      <div style={styles.bgDecorator1}></div>
      <div style={styles.bgDecorator2}></div>

      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>🌾</div>
          <h1 style={styles.title}>Circular Farming Assistant</h1>
          <p style={styles.subtitle}>AI ผู้ช่วยเกษตรกรรมยั่งยืน</p>
        </div>

        {/* Feature Cards */}
        <div style={styles.featuresGrid}>
          {questions.map((q, idx) => (
            <div 
              key={idx}
              style={styles.card}
              onClick={() => onStart(q.question)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)"
                e.currentTarget.style.boxShadow = "0 12px 20px rgba(22, 163, 74, 0.15)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(22, 163, 74, 0.08)"
              }}
            >
              <div style={styles.cardIcon}>{q.icon}</div>
              <h3>{q.title}</h3>
              <p>{q.desc}</p>
            </div>
          ))}
        </div>

        {/* Highlights */}
        <div style={styles.highlights}>
          <div style={styles.highlight}>
            <span style={styles.highlightIcon}>✨</span>
            <span>ตอบคำถามได้ 24/7</span>
          </div>
          <div style={styles.highlight}>
            <span style={styles.highlightIcon}>📚</span>
            <span>ฐานความรู้ครอบคลุม</span>
          </div>
          <div style={styles.highlight}>
            <span style={styles.highlightIcon}>🎯</span>
            <span>คำแนะนำตรงตามความต้องการ</span>
          </div>
        </div>

        {/* CTA Button */}
        <button 
          style={{
            ...styles.ctaButton,
            ...(isHovered ? styles.ctaButtonHover : {})
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => onStart("")}
        >
          <span style={styles.ctaText}>เริ่มสนทนา</span>
          <span style={styles.ctaArrow}>→</span>
        </button>

        {/* Footer */}
        <p style={styles.footer}>
          ช่วยคุณเพาะปลูกอย่างฉลาด เลือกโดยใจ 🌿
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: "100vh",
    width: "100%",
    background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdf4 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    fontFamily: "Inter, sans-serif"
  },

  bgDecorator1: {
    position: "absolute",
    top: "-50%",
    right: "-10%",
    width: "500px",
    height: "500px",
    background: "radial-gradient(circle, rgba(22, 163, 74, 0.08) 0%, transparent 70%)",
    borderRadius: "50%",
    pointerEvents: "none"
  },

  bgDecorator2: {
    position: "absolute",
    bottom: "-20%",
    left: "-10%",
    width: "400px",
    height: "400px",
    background: "radial-gradient(circle, rgba(22, 163, 74, 0.06) 0%, transparent 70%)",
    borderRadius: "50%",
    pointerEvents: "none"
  },

  content: {
    position: "relative",
    zIndex: 1,
    textAlign: "center",
    maxWidth: "900px",
    paddingX: 24,
    animation: "fadeIn 0.8s ease-in"
  },

  header: {
    marginBottom: 60
  },

  logo: {
    fontSize: 80,
    marginBottom: 20,
    display: "block",
    animation: "float 3s ease-in-out infinite"
  },

  title: {
    fontSize: 56,
    fontWeight: 700,
    color: "#14532d",
    marginBottom: 12,
    lineHeight: 1.2
  },

  subtitle: {
    fontSize: 20,
    color: "#6b7280",
    fontWeight: 400
  },

  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 20,
    marginBottom: 50,
    padding: "0 20px"
  },

  card: {
    background: "#fff",
    padding: 24,
    borderRadius: 16,
    border: "1px solid #d1fae5",
    boxShadow: "0 4px 6px rgba(22, 163, 74, 0.08)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    "&:hover": {
      transform: "translateY(-8px)",
      boxShadow: "0 12px 20px rgba(22, 163, 74, 0.15)"
    }
  },

  cardIcon: {
    fontSize: 48,
    marginBottom: 12,
    display: "block"
  },

  highlights: {
    display: "flex",
    justifyContent: "center",
    gap: 30,
    marginBottom: 50,
    flexWrap: "wrap",
    padding: "0 20px"
  },

  highlight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 16,
    color: "#14532d",
    fontWeight: 500
  },

  highlightIcon: {
    fontSize: 24
  },

  ctaButton: {
    background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
    color: "#fff",
    border: "none",
    padding: "16px 48px",
    borderRadius: 16,
    fontSize: 18,
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    boxShadow: "0 8px 20px rgba(22, 163, 74, 0.3)",
    transition: "all 0.3s ease",
    marginBottom: 40
  },

  ctaButtonHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 12px 30px rgba(22, 163, 74, 0.4)"
  },

  ctaText: {
    fontSize: 18
  },

  ctaArrow: {
    fontSize: 20,
    marginLeft: 4,
    transition: "transform 0.3s ease"
  },

  footer: {
    color: "#6b7280",
    fontSize: 16,
    marginTop: 20
  }
}
