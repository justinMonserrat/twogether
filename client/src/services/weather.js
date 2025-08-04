import axios from "axios";

const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

export async function getWeatherByZip(zip, countryCode = "us") {
  const url = `${BASE_URL}?zip=${zip},${countryCode}&units=imperial&appid=${API_KEY}`;
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (err) {
    console.error("Error fetching weather:", err);
    return null;
  }
}
