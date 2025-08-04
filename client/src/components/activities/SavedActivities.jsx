export default function SavedActivities({ favorites }) {
  return (
    <div className="saved-activities">
      <h2>Saved Activities</h2>
      {favorites.length === 0 ? (
        <p>No favorites yet!</p>
      ) : (
        <ul>
          {favorites.map((id) => (
            <li key={id}>{id}</li> // Replace with activity lookup later
          ))}
        </ul>
      )}
    </div>
  );
}
