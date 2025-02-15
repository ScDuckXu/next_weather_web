"use client"

import { useState, useEffect, useCallback } from "react"
import { WeatherDisplay } from "@/components/weather-display"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface WeatherData {
  date: string
  temperature: number
  condition: string
  humidity: number
  description: string
  windSpeed: number
  icon: string
}

interface LocationData {
  name: string
  country: string
}

export default function WeatherApp() {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([])
  const [location, setLocation] = useState<LocationData | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWeatherData = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch("/api/weather")
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch weather data")
      }
      const data = await response.json()
      setLocation(data.location)
      setWeatherData(data.weather)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching weather data:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch weather data")
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWeatherData()
    const intervalId = setInterval(fetchWeatherData, 600000) // Update every 10 minutes
    return () => clearInterval(intervalId)
  }, [fetchWeatherData])

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : weatherData.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex < weatherData.length - 1 ? prevIndex + 1 : 0))
  }

  const handleRetry = () => {
    setIsLoading(true)
    fetchWeatherData()
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">
          {location ? `${location.name}, ${location.country}` : "Loading location..."}
        </h1>
        <p className="text-center text-gray-500 mb-8">Weather Forecast</p>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              {error}
              <Button variant="outline" size="sm" className="ml-4" onClick={handleRetry}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <WeatherDisplay data={weatherData[currentIndex] || null} isLoading={isLoading} />

        {!error && weatherData.length > 0 && (
          <>
            <div className="mt-8">
              <Carousel className="w-full max-w-xs mx-auto">
                <CarouselContent>
                  {weatherData.map((data, index) => (
                    <CarouselItem key={data.date} className="basis-1/3">
                      <div
                        className={`p-2 text-center cursor-pointer ${
                          index === currentIndex ? "bg-blue-100 rounded-lg" : ""
                        }`}
                        onClick={() => setCurrentIndex(index)}
                      >
                        <div className="font-semibold">
                          {new Date(data.date).toLocaleDateString("en-US", { weekday: "short" })}
                        </div>
                        <div>{data.temperature}°C</div>
                        <img
                          src={`https://openweathermap.org/img/wn/${data.icon}.png`}
                          alt={data.description}
                          className="w-8 h-8 mx-auto"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
            <div className="flex justify-center mt-4 space-x-4">
              <Button onClick={handlePrevious} variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button onClick={handleNext} variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

