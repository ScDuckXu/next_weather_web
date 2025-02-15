import { NextResponse } from "next/server"

const API_KEY = process.env.OPENWEATHERMAP_API_KEY
const BASE_URL = "https://api.openweathermap.org/data/2.5"
const GEO_URL = "https://api.openweathermap.org/geo/1.0"

export async function GET() {
  if (!API_KEY) {
    console.error("OpenWeatherMap API key is missing")
    return NextResponse.json({ error: "Weather API configuration error" }, { status: 500 })
  }

  try {
    // First, get the exact coordinates for Jianye District
    const geoResponse = await fetch(`${GEO_URL}/direct?q=Jianye,Nanjing,CN&limit=1&appid=${API_KEY}`)

    if (!geoResponse.ok) {
      throw new Error(`Geocoding API error: ${geoResponse.status}`)
    }

    const geoData = await geoResponse.json()

    if (!geoData || geoData.length === 0) {
      throw new Error("Location not found")
    }

    const { lat, lon } = geoData[0]
    console.log("Location coordinates:", { lat, lon })

    // Fetch current weather
    const currentWeatherResponse = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}&lang=en`,
    )

    if (!currentWeatherResponse.ok) {
      throw new Error(`Weather API error: ${currentWeatherResponse.status}`)
    }

    const currentWeatherData = await currentWeatherResponse.json()

    // Fetch 5-day forecast
    const forecastResponse = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}&lang=en`,
    )

    if (!forecastResponse.ok) {
      throw new Error(`Forecast API error: ${forecastResponse.status}`)
    }

    const forecastData = await forecastResponse.json()

    // Process and return the data
    const processedData = [
      {
        date: new Date().toISOString(),
        temperature: Math.round(currentWeatherData.main.temp),
        condition: currentWeatherData.weather[0].main,
        humidity: currentWeatherData.main.humidity,
        description: currentWeatherData.weather[0].description,
        windSpeed: currentWeatherData.wind?.speed || 0,
        icon: currentWeatherData.weather[0].icon,
      },
      ...(forecastData.list || [])
        .filter((item: any, index: number) => index % 8 === 0)
        .slice(0, 6)
        .map((item: any) => ({
          date: item.dt_txt,
          temperature: Math.round(item.main.temp),
          condition: item.weather[0].main,
          humidity: item.main.humidity,
          description: item.weather[0].description,
          windSpeed: item.wind?.speed || 0,
          icon: item.weather[0].icon,
        })),
    ]

    // Log successful response (without sensitive data)
    console.log("Weather data fetched successfully for:", geoData[0].name)

    return NextResponse.json({
      location: {
        name: geoData[0].name,
        country: geoData[0].country,
      },
      weather: processedData,
    })
  } catch (error) {
    console.error("Error in weather API route:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch weather data" },
      { status: 500 },
    )
  }
}

