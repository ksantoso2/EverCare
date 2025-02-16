import React from "react";
import { useNavigate } from "react-router-dom";

function MainPage() {
  const navigate = useNavigate();

  // Retrieve username from localStorage
  const username = localStorage.getItem("username");

  const handleRedirect = () => {
    if (username) {
      navigate("/chat"); 
    } else {
      console.error("No username found in localStorage");
    }
  };

  const handleRedirectRecords = () => {
    if (username) {
      navigate("/myrecords"); 
    } else {
      console.error("No username found in localStorage");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        xDirection: "column",
        justifyContent: "center", // Horizontally center the content
        alignItems: "center", // Vertically center the content
        height: "100vh", // Full height of the viewport
        textAlign: "center", // Center the text inside each element
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          xDirection: "column",
          justifyContent: "center", // Horizontally center the content
          alignItems: "center", // Vertically center the content
          // height: "100vh", // Full height of the viewport
          // textAlign: "center", // Center the text inside each element
        }}
      >
        <div style={{ textAlign: "left" }}>
          <h1>Hi, </h1>
          <h1>{username}!</h1>
          <h3>How are you feeling today?</h3>
        </div>

        <div style={{ width: "100%" }}>
          <div>
            <button
              className="btn-orange"
              onClick={handleRedirectRecords}
              style={{
                marginTop: "10px",
                padding: "8px",
                backgroundColor: "#f1745a",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                width: "100%",
                height: "70px",
              }}
            >
              View my records
            </button>
          </div>
          <div>
            <button
              className="btn-green"
              onClick={handleRedirect}
              style={{
                marginTop: "10px",
                padding: "8px",
                background: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                width: "100%",
                height: "70px",
              }}
            >
              Speak with WellNest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;
