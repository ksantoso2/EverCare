import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function ChatPage() {
  const [entry, setEntry] = useState("");
  const [entries, setEntries] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null); // For playback
  const mediaRecorderRef = useRef(null); // Ref to store MediaRecorder instance
  const audioPlayerRef = useRef(null); // Ref to audio element for playback
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  useEffect(() => {
    if (!username) {
      navigate("/"); // Redirect to home if no username found
      return;
    }

    // Fetch existing entries for the user
    fetch(`http://localhost:5000/entries/${username}`)
      .then((response) => response.json())
      .then((data) => setEntries(data))
      .catch((error) => console.error("Error fetching entries:", error));
  }, [username, navigate]);

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
        setEntry(""); // Clear input
      }
    } catch (error) {
      console.error("Error adding entry:", error);
    }
  };

  // Start recording voice
  const startRecording = async () => {
    setIsRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log("Microphone stream started");

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder; // Store MediaRecorder instance

    let chunks = [];

    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/wav" });
      setAudioBlob(blob); // Set the audio blob

      // Set audio for playback
      const audioUrl = URL.createObjectURL(blob);
      audioPlayerRef.current.src = audioUrl;
      audioPlayerRef.current.play();

      // Send audio blob to backend to transcribe using OpenAI
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
          setEntry(data.text); // Set transcription as the entry
        }
      } catch (error) {
        console.error("Error transcribing audio:", error);
      }
    };

    mediaRecorder.start();
  };

  // Stop recording voice
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop(); // Stop the media recorder
    }
    setIsRecording(false); // Set recording state to false
  };

  return (
    <div>
      <h1>Chat Page</h1>
      <h2>Welcome, {username}</h2>

      <form onSubmit={handleEntrySubmit}>
        <input
          type="text"
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="Enter entry..."
          required
        />
        <button type="submit">Submit Entry</button>
      </form>

      <div>
        {!isRecording ? (
          <button onClick={startRecording}>Start Recording</button>
        ) : (
          <button onClick={stopRecording}>Stop Recording</button>
        )}
      </div>

      <h3>Entries:</h3>
      <ul>
        {entries.map((ent, index) => (
          <li key={index}>{ent.entry}</li>
        ))}
      </ul>

      <div>
        <h3>Playback:</h3>
        <audio ref={audioPlayerRef} controls></audio>
      </div>
    </div>
  );
}

export default ChatPage;
