
import React, { useState, useEffect, useRef } from 'react'
import ClosetItem from './ClosetItem'
import {
  DEFAULT_LOCATION_KEY,
  readDefaultLocation,
  searchLocations,
  getWeather,
  sendWeather,
  describeWeather
} from '../weather'

// generate outfits using closet items and show the weather section
function OutfitsPage({
  favorites,
  toggleFavorite,
  searchTerm = '',
  submittedStyle = '',
  uploadedClosetStore,
  newClosetItems,
  getClosetItem,
})  {
  const [suit, setSuit] = useState(null)
  const [generation, setGeneration] = useState(0)
  const [uploaded, setUploaded] = useState([])
  const [generatedItems, setGeneratedItems] = useState([])
  const [outfitMessage, setOutfitMessage] = useState('')

  useEffect(() => {
    let active = true

    uploadedClosetStore('read')
      .then(items => {
        if (active) setUploaded(items)
      })
      .catch(() => {
        if (active) setOutfitMessage('Could not load saved clothes.')
      })

    return () => {
      active = false
    }
  }, [uploadedClosetStore])

  const [styleRequest, setStyleRequest] = useState('')

  useEffect(() => {
    if (submittedStyle) setStyleRequest(submittedStyle)
  }, [submittedStyle])

  const [appliedStyle, setAppliedStyle] = useState('')
  const [defaultPlace, setDefaultPlace] = useState(readDefaultLocation)
  const [place, setPlace] = useState(defaultPlace)
  const [query, setQuery] = useState(defaultPlace?.label || '')
  const [matches, setMatches] = useState([])
  const [weather, setWeather] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const request = useRef(0)
  const lastSearch = useRef(0)

  async function loadWeather(selected) {
    const id = ++request.current

    setPlace(selected)
    setQuery(selected.label)
    setMatches([])
    setWeather(null)
    setSuit(null)
    setError('')
    setBusy(true)

    try {
      const result = await getWeather(selected)

      if (id === request.current) {
        setWeather(result)
        sendWeather(result)
      }
    } catch {
      if (id === request.current) {
        setError('Could not load weather. Check your connection and try again.')
      }
    } finally {
      if (id === request.current) setBusy(false)
    }
  }

  useEffect(() => {
    if (defaultPlace) loadWeather(defaultPlace)

    return () => {
      request.current++
    }
  }, [])

  async function search(event) {
    event.preventDefault()

    const text = query.trim()

    if (!text) {
      setError('Enter an address or city.')
      return
    }

    if (Date.now() - lastSearch.current < 1500) return

    lastSearch.current = Date.now()

    const id = ++request.current

    setBusy(true)
    setError('')
    setNotice('')
    setWeather(null)
    setPlace(null)
    setSuit(null)
    setMatches([])

    try {
      const results = await searchLocations(text)

      if (id !== request.current) return

      setMatches(results)

      if (!results.length) {
        setError('No location found. Include the city, state, or postal code and try again.')
      }
    } catch (err) {
      if (id === request.current) {
        setError(err.message || 'Could not search locations. Please try again.')
      }
    } finally {
      if (id === request.current) setBusy(false)
    }
  }

  function saveDefault() {
    try {
      localStorage.setItem(DEFAULT_LOCATION_KEY, JSON.stringify(place))
      setDefaultPlace(place)
      setNotice('Default location saved.')
    } catch {
      setError('Could not save your default location in this browser.')
    }
  }

  // generate an outfit using the clothes saved in Closet
  async function generate() {
    let savedItems

    try {
      savedItems = await uploadedClosetStore('read')
      setUploaded(savedItems)
    } catch {
      setOutfitMessage('Could not load your saved clothes. Please try again.')
      return
    }

    let deleted = []

    try {
      deleted = JSON.parse(localStorage.getItem('wardrobe-deleted-items') || '[]')
    } catch {
      deleted = []
    }

    // use only uploaded clothing, not the sample suits
    const allItems = [...newClosetItems, ...savedItems].filter(
      item => !deleted.includes(item.id)
    )

    const pick = category => {
      const choices = allItems.filter(item => item.category === category)
      return choices.length
        ? choices[Math.floor(Math.random() * choices.length)]
        : null
    }

    const top = pick('Top')
    const bottom = pick('Bottom')
    const shoes = pick('Shoes')
    const accessories = pick('Accessories')

    const missing = []

    if (!top) missing.push('Top')
    if (!bottom) missing.push('Bottom')
    if (!shoes) missing.push('Shoes')

    if (missing.length) {
      setGeneratedItems([])
      setSuit(null)
      setOutfitMessage('Please upload and save: ' + missing.join(', '))
      return
    }

    setGeneratedItems([top, bottom, shoes, ...(accessories ? [accessories] : [])])
    setOutfitMessage('')
    setAppliedStyle(styleRequest.trim())
    setSuit(1)
    setGeneration(previous => previous + 1)
  }

  const description = weather ? describeWeather(weather.code) : null

  const date = weather
    ? new Date(weather.date + 'T12:00:00').toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : ''

  return (
    <section className="outfits-layout">
      <aside className="weather-panel">
        <p className="weather-label">TODAY’S WEATHER</p>

        <form className="location-form" onSubmit={search}>
          <input
            id="weather-address"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Street address, city, state"
            maxLength={250}
            required
          />
          <button className="settings-purple" type="submit" disabled={busy}>
            {busy ? 'Loading…' : 'Get weather'}
          </button>
        </form>

        {defaultPlace && (
          <p className="default-location">Default: {defaultPlace.label}</p>
        )}

        {matches.length > 0 && (
          <div className="location-matches">
            <p>Choose your location to get weather</p>
            <ul>
              {matches.map(match => (
                <li key={match.label}>
                  <button type="button" onClick={() => loadWeather(match)}>
                    {match.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && <p className="location-error" role="alert">{error}</p>}
        {notice && <p className="location-notice" role="status">{notice}</p>}

        {busy && (
          <p role="status" className="location-hint">
            Finding your location’s weather…
          </p>
        )}

        {place && !busy && (
          <div className="active-location">
            {JSON.stringify(place) !== JSON.stringify(defaultPlace) && (
              <button className="use-default" type="button" onClick={saveDefault}>
                Save as default
              </button>
            )}

            {!weather && (
              <button className="use-default" type="button" onClick={() => loadWeather(place)}>
                Retry weather
              </button>
            )}
          </div>
        )}

        {weather && (
          <>
            <h1>{date}</h1>
            <div className="weather-sun" aria-hidden="true">{description.icon}</div>
            <p className="weather-temperature">
              {Math.round(weather.temperature)}<span>°F</span>
            </p>
            <h2>{description.label}</h2>

            <div className="weather-details">
              <div>
                <span>Feels like</span>
                <strong>{Math.round(weather.feelsLike)}°F</strong>
              </div>
              <div>
                <span>Rain chance today</span>
                <strong>{weather.rain === null ? 'Unavailable' : weather.rain + '%'}</strong>
              </div>
            </div>

            <p className="weather-updated">
              Local update: {weather.time.replace('T', ' ')}
            </p>
          </>
        )}

        <p className="weather-sources">
          Weather: <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a>
          {' · '}
          Places: <a href="https://photon.komoot.io/" target="_blank" rel="noreferrer">Photon</a>
          {' / '}
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap</a>
        </p>
      </aside>

      <section className="outfit-generator">
        {searchTerm.trim() && (
          <p className="outfit-search-note">
            Searching outfit pieces for: <strong>{searchTerm}</strong>
          </p>
        )}

        <div aria-live="polite" aria-atomic="true">
          {outfitMessage && (
            <p className="closet-upload-status" role="status">{outfitMessage}</p>
          )}

          {suit === null ? (
            <div className="outfit-prompt">
              <button className="generate-outfit" type="button" onClick={generate}>
                Generate outfit
              </button>
            </div>
          ) : (
            <section className="generated-suit" key={generation}>
              {appliedStyle && (
                <div className="applied-style">
                  <strong>Your style</strong>
                  <p>{appliedStyle}</p>
                </div>
              )}

              <div className="closet-item-grid">
                {generatedItems.map(item => (
                  <ClosetItem
                    key={item.id}
                    item={item}
                    isFavorite={favorites.some(saved => saved.id === item.id)}
                    onFavorite={() => toggleFavorite(item)}
                  />
                ))}
              </div>

              <div className="generator-button-center generated-button">
                <button className="generate-outfit" type="button" onClick={generate}>
                  Generate another outfit
                </button>
              </div>
            </section>
          )}
        </div>
      </section>
    </section>
  )
}

export default OutfitsPage
