import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CreateUser from "./CreateUser";
import ChatPage from "./ChatPage";
import "./App.css";
import MainPage from "./MainPage";
import MyRecords from "./MyRecords";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CreateUser />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/mainpage" element={<MainPage />} />
        <Route path="/myrecords" element={<MyRecords />} />

      </Routes>
    </Router>
  );
}

export default App;