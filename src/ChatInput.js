import React from "react";

function ChatInput({
  userInput,
  setUserInput,
  sendMessage,
  handleKeyPress,
  loading,
}) {
  return (
    <div className="p-4 bg-white border-t border-gray-200 shadow-inner flex items-center space-x-3 rounded-t-lg">
      <input
        type="text"
        className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
        placeholder="Type your message..."
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={loading}
      />
      <button
        onClick={sendMessage}
        disabled={loading || userInput.trim() === ""}
        className={`px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
          loading || userInput.trim() === ""
            ? "bg-blue-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg"
        }`}
      >
        Send
      </button>
    </div>
  );
}

export default ChatInput;
