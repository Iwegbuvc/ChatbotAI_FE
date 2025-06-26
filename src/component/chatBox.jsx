import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane } from "react-icons/fa";
import "../style/chatBox.css"; 

// Main functional component
const ChatBox = () => {
  // State to track what the user is currently typing
  const [userMessage, setUserMessage] = useState("");

  // State to show loading indicator while waiting for API response.......
  const [loading, setLoading] = useState(false);

  // State to store chat messages. Pulls from localStorage if available.
  const [messages, setMessages] = useState(() => {
    const stored = localStorage.getItem("chatMessages");
    return stored ? JSON.parse(stored) : [];
  });

  // Ref to the bottom of the chat, for auto-scroll
  const bottomRef = useRef(null);

  // Save messages to localStorage whenever messages state changes
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  // Automatically scroll to bottom when new message is added
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handles message sending
  const handleSubmit = async () => {
    // Prevent empty messages
    if (!userMessage.trim()) return;
    setLoading(true); // Show loader

    try {
      // Send POST request to your backend API
      const res = await fetch("https://chatbotai-backend.onrender.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage }), // Send user's message
      });

      // Parse response
      const data = await res.json();
      const aiReply = data.reply || "No response received."; // Default reply fallback

      // Update message history with both user and AI response
      setMessages(prev => [
        ...prev,
        { role: "user", text: userMessage },
        { role: "ai", text: aiReply },
      ]);

      setUserMessage(""); // Clear input
    } catch (err) {
      console.error("Fetch error:", err);

      // Show error message in chat
      setMessages(prev => [
        ...prev,
        { role: "user", text: userMessage },
        { role: "ai", text: "Error fetching response from AI." },
      ]);
    }

    setLoading(false); // Hide loader
  };

  // Clears the entire chat and localStorage
  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem("chatMessages");
  };

  return (
    <div className="query-container">
      <h2>Elysian Circle</h2>

      {/* Display all messages */}
      <div className="response-box">
        {messages.map((msg, index) => (
          <p key={index} className={msg.role === "user" ? "user-msg" : "ai-msg"}>
            <strong>{msg.role === "user" ? "You" : "AI"}:</strong> {msg.text}
          </p>
        ))}

        {/* Show loading indicator when waiting for response */}
        {loading && <div className="loader">Loading...</div>}

        {/* Show error message if the last response contains an error */}
        {messages.length > 0 && messages[messages.length - 1].text.includes("Error") && (
          <div className="error-message">{messages[messages.length - 1].text}</div>
        )}

        {/* Invisible div used to auto-scroll to bottom */}
        <div ref={bottomRef} />
      </div>

      {/* Input area and send button */}
      <div className="input-wrapper">
        <textarea
          className="input-field"
          rows="4"
          placeholder="Type your question..."
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)} // Update input state
          onKeyDown={(e) => {
            // Allow pressing Enter (without Shift) to send message
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <button
          className="send-icon-btn"
          onClick={handleSubmit}
          disabled={loading || !userMessage.trim()} // Disable if loading or input is empty
          aria-label="Send"
        >
          <FaPaperPlane />
        </button>
      </div>

      {/* Clear chat button */}
      <button className="clear-btn" onClick={handleClearChat}>
        Clear Chat History
      </button>
    </div>
  );
};

export default ChatBox;
