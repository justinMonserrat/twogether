import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { addActivity, getActivities } from "../../services/firestore";
import "../../styles/main.css";

export default function Activities() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    getActivities()
      .then((list) => {
        if (isMounted) setActivities(list || []);
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setError("Failed to load activities");
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim() || !description.trim()) {
      setError("Both title and description are required.");
      return;
    }

    try {
      const id = await addActivity({
        title: title.trim(),
        description: description.trim(),
        createdBy: user.uid,
      });
      setActivities((prev) => [
        ...prev,
        {
          id,
          title: title.trim(),
          description: description.trim(),
          createdBy: user.uid,
        },
      ]);
      setTitle("");
      setDescription("");
    } catch (err) {
      console.error(err);
      setError("Failed to add activity");
    }
  };

  return (
    <div className="activities-container">
      <h2>Find & Share Activities</h2>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="activity-form">
        <input
          type="text"
          placeholder="Activity title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <button type="submit">Add Activity</button>
      </form>

      <ul className="activity-list">
        {activities && activities.length > 0 ? (
          activities.map((act) => (
            <li key={act.id}>
              <h3>{act.title}</h3>
              <p>{act.description}</p>
            </li>
          ))
        ) : (
          <p>No activities yet.</p>
        )}
      </ul>
    </div>
  );
}
