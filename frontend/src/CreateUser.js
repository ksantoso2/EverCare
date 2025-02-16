import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

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
        localStorage.setItem("username", formData.username);
        navigate("/mainpage");
      }
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  return (
    <div
      style={{
        textAlign: "center",
        paddingTop: "5rem",
        paddingBottom: "400px",
      }}
    >
      <picture>
        <source
          srcSet="https://fonts.gstatic.com/s/e/notoemoji/latest/1f31e/512.webp"
          type="image/webp"
        />
        <img
          src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f31e/512.gif"
          alt="🌞"
          width="90"
          height="90"
        />
      </picture>
      <h1>Hey there! Log in with EverCare</h1>
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
        {/* <input
          type="text"
          name="medication"
          placeholder="Medication"
          value={formData.medication}
          onChange={handleChange}
          required
        /> */}

        <button
          type="submit"
          className="button-19"
          style={{
            marginTop: "10px",
            padding: "8px",
            background: "#F1745A",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Join us!
        </button>
      </form>
    </div>
  );
}

export default CreateUser;
