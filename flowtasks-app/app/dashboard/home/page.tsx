"use client";

import Schedule from "@/app/ui/components/schedule/schedule";
import styles from "@/app/ui/components/componentStyles/schedule.module.css";


export default function HomePage() {


  return (
    <>
      <section style={{ flex: 1, padding: "20px" }}>
          <h1 className={styles.welcomeTitle}>Welcome "UserName" to FlowTasks!</h1>
          <p>This is your schedule for this week:</p>
      </section>
    
    <Schedule />
    
    
    </>

  );
}
