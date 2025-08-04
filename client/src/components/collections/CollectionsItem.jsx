import React from "react";

export default function CollectionsItem({ item, onDelete }) {
  // Optional: show emoji by type
  const typeIcons = {
    movies: "🎬",
    shows: "📺",
    games: "🎮",
  };

  return (
    <li className="collections-item">
      <span>
        {typeIcons[item.type] || "📁"} {item.title}
      </span>
      <button onClick={onDelete}>❌</button>
    </li>
  );
}
