"use client";

import { useState } from "react";
import Sidebar from "../ui/components/Sidebar";
import Button from "@/app/ui/components/button";
import Modal from "@/app/ui/components/modal";

export default function TasksPage() {
    const [open, setOpen] = useState(false);

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
          <p>This is the tasks page.</p>
          <Button onClick={() => setOpen(true)}>Open Modal</Button>
        </section>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title= "My Modal"
      >
        <p>Modal content</p>
      </Modal>
      
    </main>
  );
}