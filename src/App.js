import React, { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth"; // Removed signInWithCustomToken as it's less common for initial setup
import './App.css'
// Import the new components
import ChatWindow from "./Gyan Components/ChatWindow";
import ChatInput from "./Gyan Components/ChatInput";

// Define your Firebase configuration using environment variables
// These values will be available globally through process.env in a Create React App setup
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  // measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID, // Optional if you don't use Analytics
};

// Helper function for exponential backoff (remains the same)
async function fetchWithExponentialBackoff(
  url,
  options,
  retries = 5,
  delay = 1000
) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        if (response.status === 429 || response.status >= 500) {
          throw new Error(`Server error or rate limit: ${response.status}`);
        }
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "API request failed");
      }
      return response;
    } catch (error) {
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      } else {
        throw error;
      }
    }
  }
}

function App() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [firebaseAuth, setFirebaseAuth] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        // Check if Firebase config values are actually present
        if (!firebaseConfig.apiKey) {
          console.error(
            "Firebase API Key is missing. Please check your .env file."
          );
          return; // Exit if config is incomplete
        }

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        setFirebaseAuth(auth);

        // Sign in anonymously (more common for simple setups)
        await signInAnonymously(auth);

        onAuthStateChanged(auth, (user) => {
          if (user) {
            setUserId(user.uid);
            console.log("Firebase User ID:", user.uid);
          } else {
            setUserId(null);
            console.log("No Firebase user is signed in.");
          }
        });
      } catch (error) {
        console.error("Error initializing Firebase or authenticating:", error);
      }
    };

    initializeFirebase();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (userInput.trim() === "") return;

    const newUserMessage = { role: "user", text: userInput.trim() };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setUserInput("");

    setLoading(true);

    try {
      const chatHistory = messages.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      }));
      chatHistory.push({
        role: "user",
        parts: [{ text: newUserMessage.text }],
      });

      const payload = {
        contents: chatHistory,
      };

      // Gemini API key should also be in .env if running locally
      const geminiApiKey = process.env.REACT_APP_GEMINI_API_KEY || ""; // Define this in your .env file as REACT_APP_GEMINI_API_KEY
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${geminiApiKey}`;

      const response = await fetchWithExponentialBackoff(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        const aiResponseText = result.candidates[0].content.parts[0].text;
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "model", text: aiResponseText },
        ]);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            role: "model",
            text: "Sorry, I couldn't get a response from Gyan. Please try again.",
          },
        ]);
        console.error("Unexpected API response structure:", result);
      }
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "model",
          text: "An error occurred while connecting to Gyan. Please check your network and try again.",
        },
      ]);
      console.error("Error sending message to AI:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-inter antialiased">
      <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4 shadow-lg rounded-b-lg">
        <h1 className="text-3xl font-bold text-center">Gyan AI Assistant</h1>
        {userId && (
          <p className="text-sm text-center mt-1 opacity-80">
            Your User ID:{" "}
            <span className="font-mono text-xs bg-white bg-opacity-20 px-2 py-1 rounded-md">
              {userId}
            </span>
          </p>
        )}
      </header>
      <ChatWindow
        messages={messages}
        loading={loading}
        messagesEndRef={messagesEndRef}
      />
      <ChatInput
        userInput={userInput}
        setUserInput={setUserInput}
        sendMessage={sendMessage}
        handleKeyPress={handleKeyPress}
        loading={loading}
      />
    </div>
  );
}

export default App;
