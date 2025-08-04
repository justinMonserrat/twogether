// src/pages/Activities.jsx
import React, { useEffect, useState } from "react";
import FiltersBar from "../activities/FiltersBar";
import ActivityGenerator from "../activities/ActivityGenerator";
import ActivityCard from "../activities/ActivityCard";
import SavedActivities from "../activities/SavedActivities";
import CustomActivityForm from "../activities/CustomActivityForm";
import { getWeatherByZip } from "../../services/weather";
import { auth, db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import "../../styles/Activities.css";
import Navbar from "../common/Navbar";

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [filters, setFilters] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [customActivities, setCustomActivities] = useState([]);
  const [weather, setWeather] = useState(null);
  const [zipCode, setZipCode] = useState("21054");
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [userCollections, setUserCollections] = useState({});
  const user = auth.currentUser;

  // Fetch weather
  const fetchWeather = async (zip) => {
    setWeatherLoading(true);
    try {
      const data = await getWeatherByZip(zip);
      if (data) setWeather(data);
    } catch (err) {
      console.error("Error fetching weather:", err);
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(zipCode);
  }, []);

  const isOutdoorFriendly = () => {
    if (!weather || !weather.weather || !weather.main) return false;
    const condition = weather.weather[0].main.toLowerCase();
    const temp = weather.main.temp;
    return !condition.includes("rain") && temp > 55;
  };

  useEffect(() => {
    if (!weather) return;
    if (isOutdoorFriendly()) {
      setFilters({});
    } else {
      setFilters({ indoorOnly: true });
    }
  }, [weather]);

  useEffect(() => {
    if (!user) return;
    const loadCollections = async () => {
      const types = ["movies", "shows", "games"];
      const data = {};

      for (let type of types) {
        const snap = await getDocs(collection(db, `users/${user.uid}/${type}`));
        data[type] = snap.docs.map((doc) => doc.data().title);
      }

      setUserCollections(data);
    };

    loadCollections();
  }, [user]);

  useEffect(() => {
    const allActivities = [
      { id: "1", title: "Picnic in the Park", tags: ["outdoor", "free"] },
      {
        id: "2",
        title: "Pick a movie to watch",
        tags: ["indoor", "$"],
        usesCollection: "movies",
      },
      {
        id: "3",
        title: "Pick a board game",
        tags: ["indoor", "free"],
        usesCollection: "games",
      },
      { id: "4", title: "Hiking Adventure", tags: ["outdoor", "free"] },
    ];

    const filtered = filters.indoorOnly
      ? allActivities.filter((a) => a.tags.includes("indoor"))
      : filters.outdoorOnly
      ? allActivities.filter((a) => a.tags.includes("outdoor"))
      : allActivities;

    const enriched = filtered.map((a) => {
      if (a.usesCollection && userCollections[a.usesCollection]?.length) {
        const options = userCollections[a.usesCollection];
        const randomItem = options[Math.floor(Math.random() * options.length)];
        return { ...a, title: `${randomItem}` };
      }
      return a;
    });

    setActivities(enriched);
  }, [filters, userCollections]);

  return (
    <>
      <Navbar />
      <div className="activities-page">
        {/* Weather Bar */}
        <div className="weather-row">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchWeather(zipCode);
            }}
            className="zip-form"
          >
            <label htmlFor="zip">Enter ZIP:</label>
            <input
              id="zip"
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              maxLength={5}
              pattern="\d{5}"
              required
            />
            <button type="submit">Update</button>
          </form>

          <div className="weather-status">
            {!weatherLoading && weather?.weather && weather?.main && (
              <p>
                Weather in {zipCode}: {weather.weather[0].main},{" "}
                {Math.round(weather.main.temp)}°F —{" "}
                {isOutdoorFriendly()
                  ? "Great for outdoor!"
                  : "Better to stay indoors!"}
              </p>
            )}
          </div>
        </div>

        {/* Filters and Generator */}
        <FiltersBar filters={filters} setFilters={setFilters} />
        <ActivityGenerator activities={activities} />

        {/* Activity Grid */}
        <h2>Browse Activities</h2>
        <div className="activities-grid">
          {activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              favorites={favorites}
              setFavorites={setFavorites}
            />
          ))}
        </div>

        {/* Custom and Saved */}
        <SavedActivities favorites={favorites} />
        <CustomActivityForm setCustomActivities={setCustomActivities} />
      </div>
    </>
  );
}
