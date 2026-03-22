import Logo from "./ui/components/Logo";
import AuthButtons from "./ui/components/AuthButtons";

export default function WelcomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "radial-gradient(circle at top, #004e89 0%, #1A659E 45%, #F7C59F 100%)",
        color: "white",
        padding: "24px",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "720px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "24px",
          padding: "40px 24px",
          borderRadius: "24px",
          backgroundColor: "rgba(17, 24, 39, 0.55)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
          backdropFilter: "blur(6px)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
            }}
          >
            Welcome to{" "}
            <span style={{ color: "#FF6B35" }}>
              FlowTask
            </span>
          </h1>


        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "120px",
          }}
        >
          <Logo />
        </div>

        <p
          style={{
            margin: 0,
            fontSize: "1rem",
            color: "white",
            fontWeight: 500,
          }}
        >
          Never lose the rhythm of your multitask flow.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            width: "100%",
            maxWidth: "240px",
          }}
        >
          <AuthButtons />
        </div>
      </section>
    </main>
  );
}