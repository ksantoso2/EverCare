import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyRecords.css";

function MyRecords() {
    const [healthRecords, setHealthRecords] = useState([]);
    const [loading, setLoading] = useState(true); // Add a loading state
    const navigate = useNavigate();

    // Fetch data from backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Replace 'username' with the actual username of the logged-in user
                const username = localStorage.getItem("username");
                const response = await fetch(`http://localhost:5000/entries/${username}`);
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const data = await response.json();

                // Group entries by date
                const groupedEntries = data.reduce((acc, entry) => {
                    if (!acc[entry.date]) {
                        acc[entry.date] = [];
                    }
                    acc[entry.date].push(entry);
                    return acc;
                }, {});

                // Convert grouped entries into array of { date, entries } objects
                const groupedEntriesArray = Object.keys(groupedEntries).map((date) => ({
                    date,
                    entries: groupedEntries[date],
                }));

                // Sort grouped entries by date, descending
                groupedEntriesArray.sort((a, b) => b.date.localeCompare(a.date));

                setHealthRecords(groupedEntriesArray);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    const handleRedirectBack = () => {
        // if (username) {
          navigate("/mainpage"); // Redirect to chat if username exists
        // } else {
        //   console.error("No username found in localStorage");
        // }
      };

    return (
        <div className="my-records-container">
            <button
        className="btn-orange"
        onClick={handleRedirectBack}
        style={{
          marginTop: "10px",
          padding: "8px",
          backgroundColor: "#f1745a",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          width: "30%",
          height: "50px",
        }}
      >
        Back
      </button>
            <h1>My Health Records</h1>
            <div className="record-list">
                {healthRecords.map((group, index) => (
                    <div key={index}>
                        <h3 className="date-header">{group.date}</h3>
                        {group.entries.map((entry, entryIndex) => (
                            <div key={entryIndex} className="record-item">
                                <p>
                                    <strong>Time:</strong> {entry.time}
                                </p>
                                {/* <p>
                                    <strong>Symptoms:</strong> {entry.symptoms}
                                </p> */}
                                <p>
                                    <strong>Notes:</strong> {entry.entry}
                                </p>
                                <button
                                    onClick={() => handleViewVitals(entry)}
                                    className="button button-vitals"
                                >
                                    Vitals
                                </button>
                                <button
                                    onClick={() => handleViewChat(entry)}
                                    className="button button-chat"
                                >
                                    View Chat
                                </button>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <button
                onClick={() => navigate("/")}
                className="button button-home"
            >
                Back to Home
            </button>
        </div>
    );
}

const handleViewVitals = (record) => {
    console.log("View Vitals for:", record);
    // Button to vitals
};

const handleViewChat = (record) => {
    console.log("View Chat for:", record);
    // Button to chat history
};

export default MyRecords;