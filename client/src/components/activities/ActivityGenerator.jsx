// src/activities/ActivityGenerator.jsx
import { useState } from "react";

export default function ActivityGenerator({ activities }) {
  const [message, setMessage] = useState("");

  const surprise = () => {
    if (activities.length === 0) return;
    const random = activities[Math.floor(Math.random() * activities.length)];
    setMessage(`🎉 Try this: ${random.title}`);
    setTimeout(() => setMessage(""), 5000); // Auto-clear after 5 sec
  };

  return (
    <div className="activity-generator">
      <button onClick={surprise}>Surprise Us!</button>
      {message && <p className="surprise-message">{message}</p>}
    </div>
  );
}
