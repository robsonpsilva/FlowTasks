"use client";

import Schedule from "@/app/ui/components/schedule/schedule";
import styles from "@/app/ui/components/componentStyles/schedule.module.css";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session } = useSession();
  const user = session?.user;
  return (
    <>
      <section style={{ flex: 1, padding: "20px" }}>
          <h1 className={styles.welcomeTitle}>Welcome {user?.name} to FlowTasks!</h1>
          <p>This is your schedule for this week:</p>
      </section>
    
    <Schedule />
    
    
    </>

  );
}
