import React from "react";
import ChatMessage from "./src/ChatMessage"; // Import the ChatMessage component

function ChatWindow({ messages, loading, messagesEndRef }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100">
      {messages.length === 0 && (
        <div className="flex justify-center items-center h-full text-gray-500 text-lg">
          Start a conversation with Gyan!
        </div>
      )}
      {messages.map((msg, index) => (
        <ChatMessage key={index} message={msg} />
      ))}
      {loading && (
        <div className="flex justify-start">
          <div className="max-w-xs sm:max-w-md lg:max-w-lg p-3 rounded-lg shadow-md bg-gray-200 text-gray-700 rounded-bl-none">
            <div className="flex items-center">
              <span className="animate-bounce mr-2 text-xl">.</span>
              <span className="animate-bounce delay-75 mr-2 text-xl">.</span>
              <span className="animate-bounce delay-150 text-xl">.</span>
              <span className="ml-2">Gyan is thinking...</span>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} /> {/* Scroll target */}
    </div>
  );
}

export default ChatWindow;
