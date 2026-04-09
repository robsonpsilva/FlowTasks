"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Schedule from "@/app/ui/components/schedule/schedule";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Se o status for 'unauthenticated', manda para o login
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    return null; // Evita "piscar" o conteúdo antes do redirecionamento
  }

  return (
    <>
      <section style={{ flex: 1, padding: "20px" }}>
        <h1>Welcome {session.user?.name} to FlowTasks!</h1>
      </section>
      <Schedule />
      <section>
      </section>
    </>
  );
}