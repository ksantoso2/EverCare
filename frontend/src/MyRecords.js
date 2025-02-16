import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyRecords.css";
import { FaShareAlt, FaPhoneAlt } from "react-icons/fa";
import Papa from "papaparse";

function MyRecords() {
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const username = localStorage.getItem("username");
        const response = await fetch(
          `http://localhost:5000/entries/${username}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();

        const groupedEntries = data.reduce((acc, entry) => {
          if (!acc[entry.date]) {
            acc[entry.date] = [];
          }
          acc[entry.date].push(entry);
          return acc;
        }, {});

        const groupedEntriesArray = Object.keys(groupedEntries).map((date) => ({
          date,
          entries: groupedEntries[date],
        }));

        groupedEntriesArray.sort((a, b) => b.date.localeCompare(a.date));

        setHealthRecords(groupedEntriesArray);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPopup && !event.target.closest('.popup-content')) {
        setShowPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPopup]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleRedirectBack = () => {
    navigate("/mainpage");
  };

  const handleShareWithCareProvider = (entry) => {
    setSelectedEntry(entry);
    setShowPopup(true);
  };

  const handleCallDoctor = (entry) => {
    console.log("Call Doctor for:", entry);
  };

  const handleExportCSV = () => {
    const data = healthRecords.flatMap((group) =>
      group.entries.map((entry) => ({
        Date: group.date,
        Time: entry.time,
        Notes: entry.entry,
      }))
    );

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "health_records.csv";
    link.click();
  };

  return (
    <div className="my-records-container">
      <h1>My Health Records</h1>
      <button
        className="btn-orange"
        onClick={handleRedirectBack}
        style={{
          marginTop: "10px",
          padding: "10px",
          backgroundColor: "#f1745a",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          width: "7%",
        }}
      >
        Back
      </button>
      <button
        onClick={handleExportCSV}
        className="btn-export"
        style={{
          padding: "10px 20px",
          backgroundColor: "#4CAF50",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginLeft: "20px",
        }}
      >
        Export as CSV
      </button>

      {/* Record List */}
      <div className="record-list">
        {healthRecords.map((group, index) => (
          <div key={index}>
            <h3 className="date-header">{group.date}</h3>
            {group.entries.map((entry, entryIndex) => (
              <div key={entryIndex} className="record-item">
                <p>
                  <strong>Time:</strong> {entry.time}
                </p>
                <p>
                  <strong>Notes:</strong> {entry.entry}
                </p>
                <div className="action-buttons">
                  <button
                    onClick={() => handleShareWithCareProvider(entry)}
                    className="button button-share"
                    style={{
                      backgroundColor: "#AF5676",
                      color: "#fff",
                    }}
                  >
                    <FaShareAlt /> Share with Care Provider
                  </button>
                  {/* <button
                    onClick={() => handleCallDoctor(entry)}
                    className="button button-call"
                    style={{
                      backgroundColor: "#f1745a",
                      color: "#fff",
                    }}
                  >
                    <FaPhoneAlt /> Call Doctor
                  </button> */}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2 className="popup-title">Share with Care Provider</h2>
            {selectedEntry && (
              <div className="popup-details">
                <p>You are sharing the following record:</p>
                <div className="popup-record">
                <p><strong>Date:</strong> {selectedEntry.date}</p>
                  <p><strong>Time:</strong> {selectedEntry.time}</p>
                  <p><strong>Notes:</strong> {selectedEntry.entry}</p>
                </div>
              </div>
            )}
            <div className="popup-actions">
              <button
                onClick={() => setShowPopup(false)}
                className="popup-button cancel"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Record shared successfully!');
                  setShowPopup(false);
                }}
                className="popup-button share"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyRecords;