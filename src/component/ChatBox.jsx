import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane } from "react-icons/fa";
import "../style/chatBox.css";

const ChatBox = () => {
  const [userMessage, setUserMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(() => {
    const stored = localStorage.getItem("chatMessages");
    return stored ? JSON.parse(stored) : [];
  });

  const bottomRef = useRef(null); // scroll target

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    // Scroll to bottom when messages update
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = async () => {
    if (!userMessage.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8081/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage }),
      });

      const data = await res.json();
      const aiReply = data.reply || "No response received.";

      setMessages(prev => [
        ...prev,
        { role: "user", text: userMessage },
        { role: "ai", text: aiReply },
      ]);
      setUserMessage("");
    } catch (err) {
      console.error("Fetch error:", err);
      setMessages(prev => [
        ...prev,
        { role: "user", text: userMessage },
        { role: "ai", text: "Error fetching response from AI." },
      ]);
    }

    setLoading(false);
  };

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem("chatMessages");
  };

  return (
    <div className="query-container">
      <h2>Elysian Circle</h2>

      <div className="response-box">
        {messages.map((msg, index) => (
          <p key={index} className={msg.role === "user" ? "user-msg" : "ai-msg"}>
            <strong>{msg.role === "user" ? "You" : "AI"}:</strong> {msg.text}
          </p>
        ))}
        {loading && <div className="loader">Loading...</div>}
        {messages.length > 0 && messages[messages.length - 1].text.includes("Error") && (
          <div className="error-message">{messages[messages.length - 1].text}</div>
        )}
        <div ref={bottomRef} /> {/* Invisible anchor to scroll to */}
      </div>

      <div className="input-wrapper">
        <textarea
          className="input-field"
          rows="4"
          placeholder="Type your question..."
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <button
          className="send-icon-btn"
          onClick={handleSubmit}
          disabled={loading || !userMessage.trim()}
          aria-label="Send"
        >
          <FaPaperPlane />
        </button>
      </div>

      <button className="clear-btn" onClick={handleClearChat}>
        Clear Chat History
      </button>
    </div>
  );
};

export default ChatBox;
