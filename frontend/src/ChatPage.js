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

  const handleEntrySubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, entry }),
      });

      if (response.ok) {
        setEntries([...entries, { entry }]);
        setEntry("");
        await getPerplexityResponse(entry);
      }
    } catch (error) {
      console.error("Error adding entry:", error);
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

      const audioUrl = URL.createObjectURL(blob);
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
          // Update entries immediately with the transcribed text
          const newEntry = { entry: data.text };
          setEntries(prevEntries => [...prevEntries, newEntry]);
          
          // Post to server
          await fetch("http://localhost:5000/entries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, entry: data.text }),
          });

          // Get Perplexity response for the new entry
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
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <div>
        <h1>Chat Page</h1>
        <h2>Welcome, {username}</h2>
      </div>

      <div>
        <div className="button-container">
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

        <h3>Your message:</h3>
        <div>
          {entries.length > 0 && entries[entries.length - 1].entry}
        </div>
        
        <h3>AI Response:</h3>
        <div>
          {isLoading ? (
            <p>Getting response...</p>
          ) : (
            perplexityResponse && <p>{perplexityResponse}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;