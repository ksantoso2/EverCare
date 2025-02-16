import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateUser() {
  const [formData, setFormData] = useState({ name: "", age: "", username: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        localStorage.setItem("username", formData.username); // Store username
        navigate("/mainpage"); // Redirect to chat page
      }
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  return (
<div style={{ textAlign: "center", paddingTop: "5rem" }}>

      <h1>Hi, new User!</h1>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          width: "300px",
          margin: "auto",
        }}
      >
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="age"
          placeholder="Age"
          value={formData.age}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="medication"
          placeholder="Medication"
          value={formData.medication}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          style={{
            marginTop: "10px",
            padding: "8px",
            background: "#007bff",
            color: "#5CB286",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Create User
        </button>
      </form>
    </div>
  );
}

export default CreateUser;
