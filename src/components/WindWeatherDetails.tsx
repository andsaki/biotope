import { tokens } from "@/styles/tokens";
import type { WeatherLocationStatus } from "@/hooks/useWeather";
import type { WeatherSnapshot } from "@/utils/weather";

interface WindWeatherDetailsProps {
  weather: WeatherSnapshot;
  sourceText: string;
  isMobile: boolean;
  locationStatus: WeatherLocationStatus;
  onRequestPreciseLocation: () => void;
}

const formatForecastHour = (date: Date) =>
  `${String(date.getHours()).padStart(2, "0")}時`;

const getWeatherTone = (condition: WeatherSnapshot["condition"]) => {
  switch (condition) {
    case "thunderstorm":
      return "遠雷";
    case "snow":
      return "白い粒";
    case "showers":
    case "rain":
    case "drizzle":
      return "雨粒";
    case "fog":
      return "深まる霧";
    case "cloudy":
    case "partly-cloudy":
      return "やわらぐ光";
    case "clear":
    default:
      return "戻る光";
  }
};

const formatWindSpeed = (speed: number | null) =>
  speed === null ? null : `${speed.toFixed(1)}m/s`;

const getLocationButtonText = (locationStatus: WeatherLocationStatus) => {
  switch (locationStatus) {
    case "requesting":
      return "位置を確認中";
    case "precise":
      return "現在地を使用中";
    case "denied":
      return "位置情報は未許可";
    default:
      return "現在地を使う";
  }
};

export const WindWeatherDetails = ({
  weather,
  sourceText,
  isMobile,
  locationStatus,
  onRequestPreciseLocation,
}: WindWeatherDetailsProps) => {
  const forecastPreview = weather.forecast.slice(1, 4);
  const windSpeedText = formatWindSpeed(weather.windSpeed);
  const locationButtonText = getLocationButtonText(locationStatus);
  const locationDisabled =
    locationStatus === "requesting" || locationStatus === "precise";

  return (
    <div
      style={{
        width: "100%",
        paddingTop: isMobile ? "10px" : tokens.spacing.sm,
        borderTop: "1px solid rgba(255, 255, 255, 0.24)",
        fontFamily: tokens.typography.fontFamily.serif,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: isMobile ? "17px" : "18px",
          fontWeight: 700,
          color: "rgba(255, 255, 255, 0.98)",
          textShadow: "0 2px 4px rgba(0, 0, 0, 0.4)",
        }}
      >
        {weather.label}
      </div>
      <div
        style={{
          marginTop: "2px",
          fontSize: "11px",
          fontWeight: 500,
          color: "rgba(255, 255, 255, 0.82)",
          lineHeight: 1.5,
          textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
        }}
      >
        {weather.description}
      </div>
      <div
        style={{
          marginTop: "2px",
          fontSize: "10px",
          fontWeight: 500,
          color: "rgba(255, 255, 255, 0.7)",
          lineHeight: 1.4,
        }}
      >
        {sourceText}
      </div>
      {windSpeedText && (
        <div
          style={{
            marginTop: "3px",
            fontSize: "10px",
            fontWeight: 500,
            color: "rgba(255, 255, 255, 0.74)",
            lineHeight: 1.4,
          }}
        >
          風 {windSpeedText}
          {weather.windGusts !== null && weather.windGusts > (weather.windSpeed ?? 0) + 1
            ? ` / 突風 ${weather.windGusts.toFixed(1)}m/s`
            : ""}
        </div>
      )}
      <div
        style={{
          marginTop: "8px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4px 10px",
          fontSize: "10px",
          fontWeight: 500,
          color: "rgba(255, 255, 255, 0.76)",
          lineHeight: 1.5,
        }}
      >
        <span>気温 {weather.temperature.toFixed(1)}℃</span>
        <span>体感 {weather.apparentTemperature.toFixed(1)}℃</span>
        <span>湿度 {Math.round(weather.humidity)}%</span>
        <span>視程 {Math.max(0.1, weather.visibility / 1000).toFixed(1)}km</span>
      </div>
      {forecastPreview.length > 0 && (
        <div
          style={{
            width: "100%",
            marginTop: tokens.spacing.sm,
            paddingTop: tokens.spacing.sm,
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          <div
            style={{
              marginBottom: "6px",
              fontSize: "10px",
              letterSpacing: 0,
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.74)",
            }}
          >
            水辺予報
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            {forecastPreview.map((point) => (
              <div
                key={point.time.toISOString()}
                style={{
                  minWidth: "34px",
                  padding: "5px 6px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  background: "rgba(255, 255, 255, 0.1)",
                }}
              >
                <div
                  style={{
                    fontSize: "9px",
                    fontWeight: 500,
                    color: "rgba(255, 255, 255, 0.72)",
                    lineHeight: 1.2,
                  }}
                >
                  {formatForecastHour(point.time)}
                </div>
                <div
                  style={{
                    marginTop: "2px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "rgba(255, 255, 255, 0.96)",
                    lineHeight: 1.2,
                  }}
                >
                  {point.label}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: "6px",
              fontSize: "10px",
              fontWeight: 500,
              color: "rgba(255, 255, 255, 0.82)",
              lineHeight: 1.45,
            }}
          >
            {weather.forecastSummary || getWeatherTone(forecastPreview[0].condition)}
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={onRequestPreciseLocation}
        disabled={locationDisabled}
        style={{
          width: "100%",
          marginTop: "10px",
          padding: "7px 8px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "8px",
          background: "rgba(255, 255, 255, 0.08)",
          color: "rgba(255, 255, 255, 0.86)",
          fontFamily: tokens.typography.fontFamily.serif,
          fontSize: "10px",
          fontWeight: 600,
          cursor: locationDisabled ? "default" : "pointer",
          opacity: locationStatus === "requesting" ? 0.65 : 1,
        }}
      >
        {locationButtonText}
      </button>
    </div>
  );
};
