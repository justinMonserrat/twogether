import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../common/Navbar";
import "../../styles/Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <Navbar />

      <header className="home-content">
        <h1>Welcome to Twogether</h1>
        <p>
          Your shared space for magical memories, meaningful moments, and
          adventure together.
        </p>
      </header>

      <div className="home-grid">
        <section className="home-section suggestion-box">
          <h2>🔮 Spellbound Suggestion</h2>
          <p>
            “Take a twilight walk and trade favorite memories under the stars.”
          </p>
          <span className="meta">Refreshed daily at 9am</span>
        </section>

        <section className="home-section journey-box">
          <h2>💖 Your Journey</h2>
          <p>
            You’ve created <strong>12 memories</strong> with your partner so
            far.
          </p>
          <p>
            Next planned event: <em>“Couples Game Night – Friday @ 7:30 PM”</em>
          </p>
        </section>
      </div>

      <section className="home-section spellbook-grid">
        <h2>📖 Your Spellbook</h2>
        <div className="grid">
          <div onClick={() => navigate("/activities")}>
            <h3>🔮 Generator</h3>
            <p>Get a new activity idea</p>
          </div>
          <div onClick={() => navigate("/journal")}>
            <h3>📖 Journal</h3>
            <p>See your shared history</p>
          </div>
          <div onClick={() => navigate("/explore")}>
            <h3>📍 Nearby</h3>
            <p>Discover places around you</p>
          </div>
          <div onClick={() => navigate("/notes")}>
            <h3>💌 Notes</h3>
            <p>Write a love letter or reminder</p>
          </div>
        </div>
      </section>
    </div>
  );
}
