import React from "react";

function ChatMessage({ message }) {
  return (
    <div
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-xs sm:max-w-md lg:max-w-lg p-3 rounded-lg shadow-md ${
          message.role === "user"
            ? "bg-blue-500 text-white rounded-br-none"
            : "bg-gray-300 text-gray-800 rounded-bl-none"
        }`}
      >
        <p className="text-sm">{message.text}</p>
      </div>
    </div>
  );
}

export default ChatMessage;
