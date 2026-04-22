import { useState } from "react"
import Home from "./Home"
import Chatbot from "./Chatbot"

export default function App() {
  const [currentPage, setCurrentPage] = useState("home")

  return currentPage === "home" ? (
    <Home onStart={() => setCurrentPage("chat")} />
  ) : (
    <Chatbot onBackHome={() => setCurrentPage("home")} />
  )
}