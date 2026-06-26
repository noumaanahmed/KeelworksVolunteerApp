import React from "react";

const ThankYouPage = ({ onReturnHome }) => {
  const s = {
    overlay: { minHeight: "100vh", background: "linear-gradient(135deg, #1a3c5e 0%, #2d6a9f 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" },
    card: { background: "#fff", borderRadius: "12px", padding: "48px 40px", width: "100%", maxWidth: "460px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", textAlign: "center" },
    icon: { fontSize: "56px", marginBottom: "16px" },
    title: { color: "#1a3c5e", fontSize: "26px", fontWeight: "700", margin: "0 0 12px" },
    text: { color: "#555", fontSize: "15px", lineHeight: 1.6, margin: "0 0 28px" },
    btn: { padding: "12px 28px", background: "#1a3c5e", color: "#fff", border: "none", borderRadius: "6px", fontSize: "15px", fontWeight: "600", cursor: "pointer" },
  };

  return (
    <div style={s.overlay}>
      <div style={s.card}>
        <div style={s.icon}>🎉</div>
        <h2 style={s.title}>Thank you for applying!</h2>
        <p style={s.text}>
          Your application has been submitted successfully. We've sent a confirmation
          email and our team will review your application soon. We appreciate your
          interest in volunteering with KeelWorks!
        </p>
        <button style={s.btn} onClick={onReturnHome}>Return to Home</button>
      </div>
    </div>
  );
};

export default ThankYouPage;
