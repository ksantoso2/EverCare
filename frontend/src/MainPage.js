import React from "react";
import { useNavigate } from "react-router-dom";

function MainPage() {
  const navigate = useNavigate();

  // Retrieve username from localStorage
  const username = localStorage.getItem("username");

  const handleRedirect = () => {
    if (username) {
      navigate("/chat"); // Redirect to chat if username exists
    } else {
      console.error("No username found in localStorage");
    }
  };

  return (
    <div style={{ textAlign: "center", paddingTop: "5rem" }}>
      <h1>Hi, {username}!</h1>
      <h3>What would you like to do?</h3>

      {/* Button to navigate to /chat with current username from localStorage */}
      <div>
        <button
          onClick={handleRedirect}
          style={{
            marginTop: "10px",
            padding: "8px",
            backgroundColor: "#f1745a", // New background color
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Update my info
        </button>
        <button
          onClick={handleRedirect}
          style={{
            marginTop: "10px",
            padding: "8px",
            backgroundColor: "#f1745a",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          View my records
        </button>
      </div>
      <button
        onClick={handleRedirect}
        style={{
          marginTop: "10px",
          padding: "8px",
          background: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Speak with our AI expert
      </button>
    </div>
  );
}

export default MainPage;
