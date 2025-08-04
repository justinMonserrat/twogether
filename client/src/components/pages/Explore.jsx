// src/pages/Explore.jsx
import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import "../../styles/Explore.css";
import Navbar from "../common/Navbar";
import PlaceCard from "../explore/PlaceCard";

export default function Explore() {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [places, setPlaces] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
      libraries: ["places"],
    });

    loader.load().then(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            const location = { lat: latitude, lng: longitude };
            setUserLocation(location);

            const mapInstance = new window.google.maps.Map(mapRef.current, {
              center: location,
              zoom: 13,
            });
            setMap(mapInstance);

            const service = new window.google.maps.places.PlacesService(
              mapInstance
            );
            service.nearbySearch(
              {
                location,
                radius: 5000,
                keyword: "things to do",
              },
              (results, status) => {
                if (
                  status === window.google.maps.places.PlacesServiceStatus.OK
                ) {
                  setPlaces(results);
                  results.forEach((place) => {
                    new window.google.maps.Marker({
                      position: place.geometry.location,
                      map: mapInstance,
                      title: place.name,
                    });
                  });
                } else {
                  console.error("PlacesService error:", status);
                }
              }
            );
          },
          (error) => console.error("Geolocation error:", error),
          { enableHighAccuracy: true }
        );
      }
    });
  }, []);

  useEffect(() => {
    if (map && selectedPlace) {
      map.panTo(selectedPlace.geometry.location);
      map.setZoom(15);
    }
  }, [selectedPlace, map]);

  return (
    <>
      <Navbar />
      <div className="explore-page">
        <div className="explore-left">
          <h2>Nearby Ideas</h2>
          <div className="filters-row">
            <button>Outdoors</button>
            <button>Romantic</button>
            <button>Free</button>
          </div>
          <div className="places-list">
            {places.map((place, idx) => (
              <PlaceCard
                key={idx}
                name={place.name}
                address={place.vicinity || ""}
                onClick={() => setSelectedPlace(place)}
              />
            ))}
          </div>
        </div>
        <div ref={mapRef} id="map" className="explore-map"></div>
      </div>
    </>
  );
}
