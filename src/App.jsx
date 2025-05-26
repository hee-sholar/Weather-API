import { useState } from "react";
import axios from "axios";
import { Loader2, CloudRain, Sun, CloudSun, Snowflake } from "lucide-react";

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

  const fetchWeather = async () => {
    if (!city) return;
    setStatus("loading");
    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
      );
      setWeather(res.data);
      setError("");
      setStatus("success");
    } catch (err) {
      setWeather(null);
      setStatus("error");
      setError("City not found. Try another.");
    }
  };

  const getIcon = () => {
    const code = weather?.weather?.[0]?.icon;
    const url = `https://openweathermap.org/img/wn/${code}@2x.png`;
    return url;
  };

  const getFallbackIcon = () => {
    const desc = weather?.weather?.[0]?.main.toLowerCase();
    if (desc.includes("cloud")) return <CloudSun className="h-12 w-12" />;
    if (desc.includes("rain")) return <CloudRain className="h-12 w-12" />;
    if (desc.includes("snow")) return <Snowflake className="h-12 w-12" />;
    return <Sun className="h-12 w-12" />;
  };

  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md text-center space-y-6">
        <h1 className="text-3xl font-bold text-blue-700">🌦 Weather Finder</h1>

        <div className="flex items-center border border-blue-300 rounded overflow-hidden">
          <input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex-1 p-2 outline-none"
          />
          <button
            onClick={fetchWeather}
            className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
          >
            {status === "loading" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Search"
            )}
          </button>
        </div>

        {status === "error" && <p className="text-red-500">{error}</p>}

        {status === "success" && weather && (
          <div className="bg-blue-50 rounded-lg p-6 space-y-3">
            <h2 className="text-2xl font-semibold">
              {weather.name}, {weather.sys.country}
            </h2>
            {weather.weather?.[0]?.icon ? (
              <img src={getIcon()} alt="weather icon" className="mx-auto h-20 w-20" />
            ) : (
              <div className="text-blue-500">{getFallbackIcon()}</div>
            )}
            <p className="text-xl">🌡 {weather.main.temp}°C</p>
            <p>💧 Humidity: {weather.main.humidity}%</p>
            <p>🌬 Wind: {weather.wind.speed} m/s</p>
            <p>🌥 Condition: {weather.weather[0].description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
