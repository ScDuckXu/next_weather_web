import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplets, Wind } from "lucide-react"

interface WeatherData {
  date: string
  temperature: number
  condition: string
  humidity: number
  description: string
  windSpeed: number
  icon: string
}

interface WeatherDisplayProps {
  data: WeatherData | null
  isLoading: boolean
}

export function WeatherDisplay({ data, isLoading }: WeatherDisplayProps) {
  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="animate-pulse flex flex-col space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">No weather data available</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">
          {new Date(data.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </CardTitle>
        <CardDescription className="capitalize">{data.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <img
              src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`}
              alt={data.description}
              className="w-16 h-16"
            />
            <div className="text-4xl font-bold">{data.temperature}°C</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Droplets className="h-5 w-5 text-blue-500" />
            <span>Humidity: {data.humidity}%</span>
          </div>
          <div className="flex items-center space-x-2">
            <Wind className="h-5 w-5 text-gray-500" />
            <span>Wind: {data.windSpeed} m/s</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

