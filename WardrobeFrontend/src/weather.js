// keep the default destination and weather information in browser storage
export const DEFAULT_LOCATION_KEY = 'wardrobe-default-location'
const searchCache = new Map()
const weatherCache = new Map()
// get the saved default destination from local storage
export function readDefaultLocation() {
  try {
    const value = JSON.parse(localStorage.getItem(DEFAULT_LOCATION_KEY) || 'null')
    return value && typeof value.label === 'string' && Number.isFinite(value.lat) && Number.isFinite(value.lon) ? value : null
  } catch { return null }
}
// request data from the weather or location service
async function getJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) })
  if (!response.ok) throw new Error('The location or weather service is unavailable. Please try again.')
  return response.json()
}
//format the location name so users can recognize the result
function locationLabel(parts) {
  return [...new Set(parts.filter(Boolean).map(value => String(value).trim()).filter(Boolean))].join(', ')
}

//search Open-Meteo for cities, states, and postal codes
async function searchOpenMeteo(query) {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search')
  url.search = new URLSearchParams({ name: query, count: '10', language: 'en', format: 'json' })
  const data = await getJson(url)
  return (data.results || []).map(p => ({
    lat: p.latitude, lon: p.longitude,
    label: locationLabel([p.name, p.admin1, p.country, p.postcodes?.[0]])
  })).filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lon) && p.label)
}

//search Photon for street addresses and other detailed locations
async function searchPhoton(query) {
  const url = new URL('https://photon.komoot.io/api/')
  url.search = new URLSearchParams({ q: query, limit: '8', lang: 'en' })
  const data = await getJson(url)
  return (data.features || []).map(feature => {
    const p = feature.properties || {}
    const [lon, lat] = feature.geometry?.coordinates || []
    const street = [p.housenumber, p.street].filter(Boolean).join(' ')
    return { lat, lon, label: locationLabel([p.name, street, p.city || p.town || p.village, p.state, p.postcode, p.country]) }
  }).filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lon) && p.label)
}

//try both location services; one service being down should not break search
export async function searchLocations(query) {
  const text = query.trim()
  if (!text) return []
  const key = text.toLowerCase()
  if (searchCache.has(key)) return searchCache.get(key)

  //a shorter city query also helps when a user types 'Detroit, Michigan'
  const city = text.split(',')[0].trim()
  const tasks = [searchOpenMeteo(text), searchPhoton(text)]
  if (city !== text && city.length >= 2) tasks.push(searchOpenMeteo(city))
  const responses = await Promise.allSettled(tasks)
  const places = responses.flatMap(result => result.status === 'fulfilled' ? result.value : [])
  const unique = places.filter((place, index) =>
    places.findIndex(other => other.label.toLowerCase() === place.label.toLowerCase()) === index
  ).slice(0, 12)
  if (!unique.length && responses.every(result => result.status === 'rejected')) {
    throw new Error('Both location services are unavailable. Check your internet connection and try again.')
  }
  searchCache.set(key, unique)
  return unique
}
// get the current weather for the selected destination
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
// convert the weather code to a readable condition and icon
export function describeWeather(code) {
  if (code === 0) return { label: 'Clear skies', icon: '☀' }
  if (code <= 2) return { label: 'Partly cloudy', icon: '⛅' }
  if (code === 3) return { label: 'Overcast', icon: '☁' }
  if ([45,48].includes(code)) return { label: 'Foggy', icon: '☁' }
  if ([71,73,75,77,85,86].includes(code)) return { label: 'Snow', icon: '❄' }
  if (code >= 95) return { label: 'Thunderstorms', icon: '⛈' }
  return { label: 'Rain or drizzle', icon: '☂' }
}
// give clothing suggestions based on the current weather
export function weatherAdvice(weather) {
  const tips = []
  if (weather.feelsLike < 10) tips.push('Add a warm coat and layers over your suit.')
  else if (weather.feelsLike >= 25) tips.push('Choose lightweight layers and remove your blazer when needed.')
  else tips.push('A blazer and trousers are a comfortable starting point; adjust layers to suit you.')
  if ([71,73,75,77,85,86].includes(weather.code)) tips.push('Add warm, slip-resistant footwear for snow.')
  else if (weather.rain >= 40 || [51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].includes(weather.code)) tips.push('Bring an umbrella and a water-resistant outer layer.')
  return tips.join(' ')
}