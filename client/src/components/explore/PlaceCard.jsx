import React from "react";
import "../../styles/Explore.css";

export default function PlaceCard({ name, address, onClick }) {
  return (
    <div className="place-card" onClick={onClick}>
      <h3>{name}</h3>
      <p>{address}</p>
    </div>
  );
}
