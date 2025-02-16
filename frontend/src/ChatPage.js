import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import "./ChatPage.css";
import "font-awesome/css/font-awesome.min.css";

function ChatPage() {
  const [entry, setEntry] = useState("");
  const [entries, setEntries] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [perplexityResponse, setPerplexityResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = useState("");
  const [showConversationBox, setShowConversationBox] = useState(false); 
  const mediaRecorderRef = useRef(null);
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  useEffect(() => {
    if (!username) {
      navigate("/");
      return;
    }

    fetch(`http://localhost:5000/entries/${username}`)
      .then((response) => response.json())
      .then((data) => setEntries(data))
      .catch((error) => console.error("Error fetching entries:", error));
  }, [username, navigate]);

  const getPerplexityResponse = async (inputText) => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/perplexity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, input: inputText }),
      });

      if (response.ok) {
        const data = await response.json();
        setPerplexityResponse(data.choices[0].message.content);
      } else {
        console.error("Error getting Perplexity response");
      }
    } catch (error) {
      console.error("Error calling Perplexity API:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    setIsRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    let chunks = [];
    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/wav" });
      setAudioBlob(blob);

      const formData = new FormData();
      formData.append("audio", blob);
      formData.append("username", username);

      try {
        const response = await fetch("http://localhost:5000/transcribe", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        if (data.text) {
          setEntry(data.text);
          setEntries((prevEntries) => [...prevEntries, { entry: data.text }]);
          await fetch("http://localhost:5000/entries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, entry: data.text }),
          });
          await getPerplexityResponse(data.text);
        }
      } catch (error) {
        console.error("Error transcribing audio:", error);
      }
    };

    mediaRecorder.start();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setShowConversationBox(true); // Show the conversation box after stopping recording
  };

  const generateSpeech = async () => {
    const text = document.getElementById("ttsText").innerText.trim();

    if (!text) {
      alert("No text to read aloud.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/generate_speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Error generating speech");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error("Error:", error);
      alert("Error generating speech. Please try again.");
    }
  };

  const handleRedirectBack = () => {
    if (username) {
      navigate("/mainpage");
    } else {
      console.error("No username found in localStorage");
    }
  };

  return (
    <div style={{ height: "100vh", textAlign: "center" }}>
        <br />
      <br />
      <br />
      <br />
      <button
        className="btn-orange button-19"
        onClick={handleRedirectBack}
        style={{
          marginTop: "10px",
          padding: "8px",
          backgroundColor: "#f1745a",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          width: "10%",
          height: "50px",
        }}
      >
        Back
      </button>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <div className="button-container animate__heartBeat animate__repeat-2">
        <input
          type="checkbox"
          id="micButton"
          className="mic-checkbox"
          checked={isRecording}
          onChange={() => (isRecording ? stopRecording() : startRecording())}
        />
        <label htmlFor="micButton" className="mic-button">
          <div className="mic">
            <div className="mic-button-loader"></div>
            <div className="mic-base">Stop Recording</div>
          </div>
          <div className="button-message">
            <span>{isRecording ? "" : "Press to Talk"}</span>
          </div>
        </label>
      </div>

      {/* The conversation box is hidden by default */}
      {showConversationBox && (
        <div className="conversation-box">
          <div className="user-chat-box">
            <h3>Your message:</h3>
            <div>{entries.length > 0 && entries[entries.length - 1].entry}</div>
          </div>

          <div className="tts-box">
            <div className="tts-container">
              <h3><picture>
  <source 
    srcSet="https://fonts.gstatic.com/s/e/notoemoji/latest/1f340/512.webp" 
    type="image/webp" 
  />
  <img 
    src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f340/512.gif" 
    alt="🍀" 
    width="50" 
    height="50" 
  />
</picture> WellNest Response:</h3>
              <div id="ttsText">
                {perplexityResponse || "Click microphone to speak..."}
              </div>
              <br />
            </div>
            <br />
            <button className="generate-btn" onClick={generateSpeech}
            style={{
                padding: "10px 20px",
                // backgroundColor: "#f1745a",
                // color: "#fff",
                // border: "none",
                // borderRadius: "5px",
                // cursor: "pointer",
                // width: "10%",
                // height: "50px",
              }}>
              Read Aloud
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatPage;
