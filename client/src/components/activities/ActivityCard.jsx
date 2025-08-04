export default function ActivityCard({ activity, favorites, setFavorites }) {
  const isFavorite = favorites.includes(activity.id);

  const toggleFavorite = () => {
    if (isFavorite) {
      setFavorites(favorites.filter((id) => id !== activity.id));
    } else {
      setFavorites([...favorites, activity.id]);
    }
  };

  return (
    <div className="activity-card">
      <h3>{activity.title}</h3>
      <p>{activity.tags.join(", ")}</p>
      <button onClick={toggleFavorite}>{isFavorite ? "❤️" : "🤍"}</button>
    </div>
  );
}
