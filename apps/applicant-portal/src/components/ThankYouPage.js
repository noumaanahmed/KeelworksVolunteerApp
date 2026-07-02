import React, { useEffect } from "react";

const ThankYouPage = ({ onReturnHome }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onReturnHome();
    }, 3600);

    return () => clearTimeout(timer);
  }, [onReturnHome]);

  return (
    <div className="thank-you-overlay">
      <div className="thank-you-card">
        <div className="thank-you-icon">🎉</div>
        <h2>Thank you for applying!</h2>
        <p>
          Your application has been submitted successfully. We sent a confirmation
          email and your applicant dashboard will show status updates in real time.
        </p>
        <button type="button" onClick={onReturnHome}>Go to My Dashboard</button>
      </div>
    </div>
  );
};

export default ThankYouPage;
