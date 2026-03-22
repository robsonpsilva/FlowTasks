"use client";

import { useState } from "react";
import Sidebar from "../ui/components/Sidebar";

export default function HomePage() {


  return (
    <main
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#0a0a0a",
        color: "white",
      }}
    >
      <Sidebar />
    
        <section style={{ flex: 1, padding: "20px" }}>
          <h1>Welcome to FlowTasks!</h1>
          <p>This is the home page of your task management app.</p>
        </section>

      
      
    </main>
  );
}
