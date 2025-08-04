import { useState } from "react";

export default function CustomActivityForm({ setCustomActivities }) {
  const [title, setTitle] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      setCustomActivities((prev) => [...prev, { id: Date.now(), title }]);
      setTitle("");
    }
  };

  return (
    <form onSubmit={submit} className="custom-activity-form">
      <h3>Add Your Own Activity</h3>
      <input
        type="text"
        placeholder="Activity Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button type="submit">Add</button>
    </form>
  );
}
