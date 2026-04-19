import { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages or loading state changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);

  async function handleSubmit() {
    if (!question.trim()) return;

    const currentQuestion = question;
    setQuestion("");
    setLoading(true);
    setMessages((prev) => [
      ...prev,
      { role: "user_role", content: currentQuestion },
    ]);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
      const res = await fetch(`${backendUrl}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: currentQuestion }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "ai_role", content: data.message },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai_role",
            content: "Error: Could not get response from AI.",
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "ai_role", content: "Error: Network or server issues." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={statusDot}></div>
        <h1 style={titleStyle}>AI Assistant</h1>
      </header>

      <div style={chatContainerStyle} ref={scrollRef}>
        {messages.length === 0 && (
          <div style={welcomeMessage}>
            <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
              Hello! 👋
            </h2>
            <p style={{ fontSize: "1.1rem" }}>
              I'm your AI assistant. How can I help you today?
            </p>
          </div>
        )}

        {messages.map((item, idx) => (
          <div
            key={idx}
            style={{
              ...messageBubbleStyle,
              alignSelf: item.role === "user_role" ? "flex-end" : "flex-start",
              backgroundColor:
                item.role === "user_role"
                  ? "#3b82f6"
                  : "rgba(255, 255, 255, 0.08)",
              borderBottomRightRadius:
                item.role === "user_role" ? "4px" : "18px",
              borderBottomLeftRadius:
                item.role === "user_role" ? "18px" : "4px",
            }}
          >
            {item.content}
          </div>
        ))}

        {loading && (
          <div
            style={{
              ...messageBubbleStyle,
              alignSelf: "flex-start",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              display: "flex",
              gap: "5px",
              padding: "1rem",
            }}
          >
            <div className="typing-dot" style={dotStyle}></div>
            <div
              className="typing-dot"
              style={{ ...dotStyle, animationDelay: "0.2s" }}
            ></div>
            <div
              className="typing-dot"
              style={{ ...dotStyle, animationDelay: "0.4s" }}
            ></div>
          </div>
        )}
      </div>

      <div style={inputAreaStyle}>
        <div style={inputWrapperStyle}>
          <input
            style={inputStyle}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            value={question}
            placeholder="Type a message..."
            type="text"
          />
          <button
            style={{
              ...buttonStyle,
              opacity: !question.trim() || loading ? 0.5 : 1,
              cursor: !question.trim() || loading ? "not-allowed" : "pointer",
            }}
            onClick={handleSubmit}
            disabled={!question.trim() || loading}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        .typing-dot {
          animation: blink 1.4s infinite both;
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}

// --- Styles ---

const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  width: "100%",
  maxWidth: "1126px",
  margin: "0 auto",
  backgroundColor: "#0F0F0F",
  color: "#FFFFFF",
  fontFamily: "'Inter', system-ui, sans-serif",
  overflow: "hidden",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: "1.25rem 2rem",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  backgroundColor: "rgba(15, 15, 15, 0.8)",
  backdropFilter: "blur(12px)",
  zIndex: 10,
  flexShrink: 0,
};

const statusDot: React.CSSProperties = {
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  backgroundColor: "#10b981",
  marginRight: "12px",
  boxShadow: "0 0 12px rgba(16, 185, 129, 0.5)",
};

const titleStyle: React.CSSProperties = {
  fontSize: "1.1rem",
  fontWeight: 600,
  margin: 0,
  letterSpacing: "0.5px",
  color: "#f3f4f6",
};

const chatContainerStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  padding: "2rem",
  gap: "1.25rem",
  overflowY: "auto",
  minHeight: 0,
};

const welcomeMessage: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  opacity: 0.4,
  textAlign: "center",
  pointerEvents: "none",
};

const messageBubbleStyle: React.CSSProperties = {
  maxWidth: "75%",
  padding: "0.8rem 1.25rem",
  borderRadius: "18px",
  fontSize: "0.95rem",
  lineHeight: "1.6",
  wordBreak: "break-word",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
};

const dotStyle: React.CSSProperties = {
  width: "6px",
  height: "6px",
  backgroundColor: "white",
  borderRadius: "50%",
};

const inputAreaStyle: React.CSSProperties = {
  padding: "1.5rem 2rem",
  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
  backgroundColor: "#0F0F0F",
  flexShrink: 0,
};

const inputWrapperStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  maxWidth: "800px",
  margin: "0 auto",
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  borderRadius: "28px",
  padding: "6px 6px 6px 20px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  transition: "border-color 0.2s",
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  backgroundColor: "transparent",
  border: "none",
  color: "white",
  padding: "10px 0",
  fontSize: "1rem",
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: "#3b82f6",
  color: "white",
  border: "none",
  borderRadius: "50%",
  width: "42px",
  height: "42px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "transform 0.1s active, opacity 0.2s",
};

export default App;
