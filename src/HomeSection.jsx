import React, { useState, useEffect } from "react";
import "./HomeSection.css";

export default function HomeSection() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const targetDate = new Date("2025-11-01T00:00:00-06:00"); // America/Mexico_City timezone (CST/CDT)
    
    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleEarlyAccess = () => {
    // Abrir formulario de acceso temprano en nueva pestaña
    window.open("https://tally.so/r/nPqd9P", "_blank");
  };

  return (
    <section className="home-section">
      {/* Hero principal con logo y significado */}
      <div className="home-content">
        <div className="home-logo-container">
          <img src="/veraztrans.png" alt="Logo VERAZ" className="home-logo" />
        </div>
        <div className="home-text-container">
          <div className="home-text">
            <h1 className="home-text-title">Veraz</h1>
            <p className="home-text-adjetivo">adjetivo</p>
            <p className="home-text-meaning">Que dice, usa o profesa siempre la verdad.</p>
          </div>
        </div>
      </div>

      {/* Contador regresivo */}
      <div className="countdown-container">
        <div className="countdown-display">
          <span className="countdown-number">{timeLeft.days.toString().padStart(2, '0')}</span>
          <span className="countdown-separator">:</span>
          <span className="countdown-number">{timeLeft.hours.toString().padStart(2, '0')}</span>
          <span className="countdown-separator">:</span>
          <span className="countdown-number">{timeLeft.minutes.toString().padStart(2, '0')}</span>
          <span className="countdown-separator">:</span>
          <span className="countdown-number">{timeLeft.seconds.toString().padStart(2, '0')}</span>
        </div>
        <div className="countdown-labels">
          <span className="countdown-label">días</span>
          <span className="countdown-label">horas</span>
          <span className="countdown-label">minutos</span>
          <span className="countdown-label">segundos</span>
        </div>
      </div>

      {/* Botón de llamada a la acción */}
      <div className="cta-container">
        <button className="cta-button" onClick={handleEarlyAccess}>
          Get early access
        </button>
      </div>

      {/* Footer */}
      <footer className="home-footer">
        <p className="footer-copyright">© 2025 Veraz. All rights reserved.</p>
        <p className="footer-credit">
          Made by <a href="https://emicarrada.com" target="_blank" rel="noopener noreferrer" className="footer-link">emicarrada</a>
        </p>
      </footer>
    </section>
  );
}
