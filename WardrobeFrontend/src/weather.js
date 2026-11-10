export const DEFAULT_LOCATION_KEY = 'wardrobe-default-location'
const searchCache = new Map()
const weatherCache = new Map()
export function readDefaultLocation() {
  try {
    const value = JSON.parse(localStorage.getItem(DEFAULT_LOCATION_KEY) || 'null')
    return value && typeof value.label === 'string' && Number.isFinite(value.lat) && Number.isFinite(value.lon) ? value : null
  } catch { return null }
}
async function getJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) })
  if (!response.ok) throw new Error('The location or weather service is unavailable. Please try again.')
  return response.json()
}
export async function searchLocations(query) {
  const key = query.trim().toLowerCase()
  if (searchCache.has(key)) return searchCache.get(key)
  const url = new URL('https://photon.komoot.io/api/')
  url.search = new URLSearchParams({ q: query.trim(), limit: '5', lang: 'en' })
  const data = await getJson(url)
  const places = (data.features || []).map(feature => {
    const p = feature.properties || {}
    const [lon, lat] = feature.geometry?.coordinates || []
    const street = [p.housenumber, p.street].filter(Boolean).join(' ')
    const parts = [p.name, street, p.city || p.town || p.village, p.state, p.postcode, p.country].filter(Boolean)
    return { lat, lon, label: [...new Set(parts)].join(', ') }
  }).filter(place => Number.isFinite(place.lat) && Number.isFinite(place.lon) && place.label)
  const unique = places.filter((place, index) => places.findIndex(other => other.label === place.label) === index)
  searchCache.set(key, unique)
  return unique
}
export async function getWeather(place) {
  const key = `${place.lat},${place.lon}`
  const cached = weatherCache.get(key)
  if (cached && Date.now() - cached.fetchedAt < 600000) return cached
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.search = new URLSearchParams({ latitude: String(place.lat), longitude: String(place.lon), current: 'temperature_2m,apparent_temperature,weather_code,is_day', daily: 'precipitation_probability_max', timezone: 'auto', forecast_days: '1' })
  const data = await getJson(url)
  const current = data.current
  if (!current || !Number.isFinite(current.temperature_2m) || !Number.isFinite(current.apparent_temperature) || !Number.isFinite(current.weather_code)) throw new Error('Weather is not available for this location. Please try again.')
  const result = { temperature: current.temperature_2m, feelsLike: current.apparent_temperature, code: current.weather_code, isDay: current.is_day, rain: data.daily?.precipitation_probability_max?.[0] ?? null, time: current.time, date: data.daily?.time?.[0] || current.time.slice(0,10), fetchedAt: Date.now() }
  weatherCache.set(key, result)
  return result
}
export function describeWeather(code) {
  if (code === 0) return { label: 'Clear skies', icon: '☀' }
  if (code <= 2) return { label: 'Partly cloudy', icon: '⛅' }
  if (code === 3) return { label: 'Overcast', icon: '☁' }
  if ([45,48].includes(code)) return { label: 'Foggy', icon: '☁' }
  if ([71,73,75,77,85,86].includes(code)) return { label: 'Snow', icon: '❄' }
  if (code >= 95) return { label: 'Thunderstorms', icon: '⛈' }
  return { label: 'Rain or drizzle', icon: '☂' }
}
export function weatherAdvice(weather) {
  const tips = []
  if (weather.feelsLike < 10) tips.push('Add a warm coat and layers over your suit.')
  else if (weather.feelsLike >= 25) tips.push('Choose lightweight layers and remove your blazer when needed.')
  else tips.push('A blazer and trousers are a comfortable starting point; adjust layers to suit you.')
  if ([71,73,75,77,85,86].includes(weather.code)) tips.push('Add warm, slip-resistant footwear for snow.')
  else if (weather.rain >= 40 || [51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].includes(weather.code)) tips.push('Bring an umbrella and a water-resistant outer layer.')
  return tips.join(' ')
}
