import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyRecords.css";
import { FaShareAlt, FaPhoneAlt } from "react-icons/fa"; // Importing Font Awesome icons
import Papa from "papaparse"; // Importing PapaParse library for CSV export

function MyRecords() {
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleRedirectBack = () => {
    navigate("/mainpage");
  };

  const handleShareWithCareProvider = (entry) => {
    console.log("Share with Care Provider:", entry);
    // Implement logic to share with care provider
  };

  const handleCallDoctor = (entry) => {
    console.log("Call Doctor for:", entry);
    // Implement logic for calling a doctor
  };

  const handleExportCSV = () => {
    // Flatten health records into a CSV format
    const data = healthRecords.flatMap((group) =>
      group.entries.map((entry) => ({
        Date: group.date,
        Time: entry.time,
        Notes: entry.entry,
      }))
    );

    // Convert the data into CSV
    const csv = Papa.unparse(data);

    // Create a download link for the CSV file
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "health_records.csv"; // Default filename for the download
    link.click();
  };

  return (
    <div className="my-records-container">
      <h1>
       {" "}
        My Health Records
      </h1>
      
      {/* Export CSV Button */}
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
          border: "none",
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
                  <button
                    onClick={() => handleCallDoctor(entry)}
                    className="button button-call"
                    style={{
                      backgroundColor: "#f1745a",
                      color: "#fff",
                    }}
                  >
                    <FaPhoneAlt /> Call Doctor
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const handleViewChat = (record) => {
  console.log("View Chat for:", record);
};

export default MyRecords;
