import { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Loader2,
  CloudRain,
  Sun,
  CloudSun,
  Snowflake,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [hourly, setHourly] = useState([]);
  const audioCtx = useRef(null);
  const toastId = useRef(null);

  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

  // Play pleasant beep
  const playBeep = () => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioCtx.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = 600;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  };

  const fetchWeather = async () => {
    if (!city) return;
    setStatus("loading");
    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          city
        )}&units=metric&appid=${apiKey}`
      );

      const forecastRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
          city
        )}&units=metric&appid=${apiKey}`
      );

      setWeather(res.data);
      setHourly(forecastRes.data.list.slice(0, 12));
      setError("");
      setStatus("success");
      playBeep();
    } catch (err) {
      setWeather(null);
      setHourly([]);
      setStatus("error");
      setError("😕 City not found. Try another.");
    }
  };

  const getIcon = () => {
    const code = weather?.weather?.[0]?.icon;
    return `https://openweathermap.org/img/wn/${code}@2x.png`;
  };

  const getFallbackIcon = () => {
    const desc = weather?.weather?.[0]?.main?.toLowerCase() || "";
    if (desc.includes("cloud")) return <CloudSun className="h-12 w-12" />;
    if (desc.includes("rain")) return <CloudRain className="h-12 w-12" />;
    if (desc.includes("snow")) return <Snowflake className="h-12 w-12" />;
    return <Sun className="h-12 w-12" />;
  };

  // Online/Offline detection
  useEffect(() => {
    const checkOnline = () => {
      if (!navigator.onLine) {
        if (!toastId.current) {
          toastId.current = toast.error("⚠️ No internet connection", {
            duration: Infinity,
            id: "offline-toast",
          });
        }
      } else {
        toast.dismiss("offline-toast");
        toastId.current = null;
      }
    };

    window.addEventListener("online", checkOnline);
    window.addEventListener("offline", checkOnline);
    checkOnline(); // Initial check

    return () => {
      window.removeEventListener("online", checkOnline);
      window.removeEventListener("offline", checkOnline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 flex items-center justify-center px-4">
      <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">
        <h1 className="text-3xl font-bold text-blue-800">🌦 Weather Finder</h1>

        <div className="flex items-center border border-blue-300 rounded-full overflow-hidden shadow">
          <input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex-1 p-3 outline-none bg-transparent placeholder:text-blue-500"
          />
          <button
            onClick={fetchWeather}
            className="bg-blue-600 text-white px-5 py-2 hover:bg-blue-700 transition font-semibold"
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Search"
            )}
          </button>
        </div>

        {status === "error" && (
          <p className="text-red-600 font-medium">{error}</p>
        )}

        {status === "success" && weather && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-2xl font-semibold flex justify-center items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                {weather.name}, {weather.sys.country}
              </h2>
              {weather.weather?.[0]?.icon ? (
                <img
                  src={getIcon()}
                  alt="weather icon"
                  className="mx-auto h-20 w-20"
                />
              ) : (
                <div className="text-blue-500">{getFallbackIcon()}</div>
              )}
              <p className="text-xl">🌡 {weather.main.temp}°C</p>
              <p>💧 Humidity: {weather.main.humidity}%</p>
              <p>🌬 Wind: {weather.wind.speed} m/s</p>
              <p className="capitalize">
                🌥 Condition: {weather.weather[0].description}
              </p>
            </div>

            {/* Hourly Forecast */}
            <div>
              <h3 className="text-lg font-medium mb-2">Hourly Forecast</h3>
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                {hourly.map((h, i) => (
                  <div key={i} className="bg-white/90 p-2 rounded-lg shadow">
                    <p>
                      {new Date(h.dt_txt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="font-semibold">{Math.round(h.main.temp)}°C</p>
                    <p className="capitalize">
                      {h.weather[0].description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
