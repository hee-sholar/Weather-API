import { useState } from "react";
import axios from "axios";
import {
  Loader2,
  CloudRain,
  Sun,
  CloudSun,
  Snowflake,
  MapPin,
} from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-purple-200 to-pink-300 flex items-center justify-center px-4">
      <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-md text-center space-y-6">
        <h1 className="text-4xl font-extrabold text-blue-800 drop-shadow-md">🌦 Weather Finder</h1>

        <div className="flex items-center border border-blue-300 rounded-full overflow-hidden shadow-sm">
          <input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex-1 p-3 outline-none bg-transparent placeholder:text-blue-500"
          />
          <button
            onClick={fetchWeather}
            className="bg-blue-600 text-white px-6 py-3 hover:bg-blue-700 transition font-semibold"
          >
            {status === "loading" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Search"
            )}
          </button>
        </div>

        {status === "error" && <p className="text-red-600 font-medium">{error}</p>}

        {status === "success" && weather && (
          <div className="bg-white rounded-2xl p-6 shadow-xl space-y-3 text-gray-800">
            <h2 className="text-2xl font-semibold flex justify-center items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" /> {weather.name}, {weather.sys.country}
            </h2>
            {weather.weather?.[0]?.icon ? (
              <img src={getIcon()} alt="weather icon" className="mx-auto h-20 w-20" />
            ) : (
              <div className="text-blue-500 flex justify-center">{getFallbackIcon()}</div>
            )}
            <p className="text-xl">🌡 <span className="font-semibold">{weather.main.temp}°C</span></p>
            <p>💧 Humidity: <span className="font-medium">{weather.main.humidity}%</span></p>
            <p>🌬 Wind: <span className="font-medium">{weather.wind.speed} m/s</span></p>
            <p>🌥 Condition: <span className="capitalize font-medium">{weather.weather[0].description}</span></p>
          </div>
        )}
      </div>
    </div>
  );
}
