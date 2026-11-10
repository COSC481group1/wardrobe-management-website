import React, { useState, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { DEFAULT_LOCATION_KEY, readDefaultLocation, searchLocations, getWeather, describeWeather, weatherAdvice } from './weather'
import { CgProfile } from 'react-icons/cg'
import { MdHome, MdOutlineEmail } from 'react-icons/md'
import { TfiLayoutColumn2 } from 'react-icons/tfi'
import { BiCloset } from 'react-icons/bi'

const ACCENT_OPTIONS = [
  { name: 'Purple', value: '#7046d6' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Orange', value: '#f59e0b' },
  { name: 'Rose', value: '#ec4899' }
]

function hexToRgba(hex, alpha = 1) {
  const clean = hex.replace('#', '')
  const value = clean.length === 3 ? clean.split('').map(char => char + char).join('') : clean
  const num = Number.parseInt(value, 16)
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const Icon = ({ name, size = 20, stroke = 1.8 }) => {
  const paths = {
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z"/></>,
    closet: <><path d="M5 21V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17"/><path d="M10 3v18M14 12h.01"/></>,
    hanger: <><path d="M12 4a3 3 0 0 1 3 3c0 2-3 2-3 4"/><path d="M4.5 18.5 11 11a1.5 1.5 0 0 1 2 0l6.5 7.5a1 1 0 0 1-.75 1.65h-13.5a1 1 0 0 1-.75-1.65Z"/></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.9-8.6a5.5 5.5 0 0 0-.1-7.8Z"/>,
    user: <><circle cx="12" cy="8" r="3.5"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></>,
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    spark: <path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8Z"/>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    check: <path d="m5 12 4 4L19 6"/>
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

function Landing({ goLogin }) {
  return <main className="landing photo-landing">
    <div className="photo-overlay" />
    <nav className="landing-nav photo-nav"><a className="brand">My App</a><div className="nav-links"><a href="#home">Home</a><a href="#about">About</a><a href="#contact">Contact</a></div><button className="pill-light" onClick={goLogin}>Get Started</button></nav>
    <section className="hero photo-hero"><h1><span>Get More</span> <em>Outfits</em></h1><div className="hero-actions"><button className="primary-btn" onClick={goLogin}>Get Started</button><button className="learn-btn">Learn More</button></div></section>
  </main>
}

function Login({ onLogin, goHome, goSignup, goSignin }) {
  const [showMessage, setShowMessage] = useState(false)
  const steps = [
    ['1', 'Add what you own', 'Save each piece with its category, type, colors, and a short description.'],
    ['2', 'Browse your closet', 'See everything in one place and edit or remove items as your wardrobe changes.'],
    ['3', 'Get outfit ideas', 'Receive suggestions based on what you own, the current season, and your style.']
  ]
  const names = ['Kyra Albaugh', 'Khadijah Bashir', 'Xintong Jiang', 'Justin Miles', 'Lucas Prawdzik', 'Joel Schueerholz']
  return <main className="intro-page"><section className="intro-content"><h1>Wardrobe is a tool to help<br/>you style outfits with<br/>clothing you already own</h1><p className="intro-lede">Keep a digital inventory of your wardrobe and get outfit recommendations that<br/>fit the season and your style.</p><div className="intro-actions"><button className="intro-primary" onClick={goSignup}>Create an account</button><button className="intro-secondary" onClick={goSignin}>Log in</button></div>{showMessage && <p className="intro-note">Account setup is coming next.</p>}<section className="how-it-works"><h2>How it works</h2>{steps.map(([number,title,text])=><article className="how-step" key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</section><footer className="group-info"><p>Built by Group 1 - COSC482W/581</p><div className="name-list">{names.map(name=><span key={name}>{name}</span>)}</div></footer></section></main>
}

const Outfit = ({type, title, tag}) => <div className="outfit-card"><div className={'outfit-image '+type}><div className="mini-item"></div></div><div className="outfit-info"><div><h4>{title}</h4><span>{tag}</span></div><button><Icon name="heart" size={17}/></button></div></div>

const closetItems = [
  { id: 'top1', category: 'Top', name: 'Black blazer', image: 'ImageTop1.jpg', suit: 1 },
  { id: 'bottom1', category: 'Bottom', name: 'Black tailored trousers', image: 'ImageBot1.jpg', suit: 1 },
  { id: 'accessory1', category: 'Accessories', name: 'Gold charm necklace', image: 'ImgaeAcs1.jpg', suit: 1 },
  { id: 'top2', category: 'Top', name: 'Charcoal blazer', image: 'ImageTop2.jpg', suit: 2 },
  { id: 'bottom2', category: 'Bottom', name: 'Charcoal trousers', image: 'ImageBot2.jpg', suit: 2 },
  { id: 'accessory2', category: 'Accessories', name: 'Patterned tie', image: 'ImageAcs2.jpg', suit: 2 }
]
async function uploadedClosetStore(action, items = []) {
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open('wardrobe-closet', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('images', { keyPath: 'id' })
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
  try { return await new Promise((resolve, reject) => {
    const transaction = db.transaction('images', action === 'read' ? 'readonly' : 'readwrite')
    const store = transaction.objectStore('images')
    let result = []
    if (action === 'read') { const request = store.getAll(); request.onsuccess = () => { result = request.result } }
    else if (action === 'delete') items.forEach(item => store.delete(item.id))
    else items.forEach(item => store.put(item))
    transaction.oncomplete = () => resolve(result)
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  }) } finally { db.close() }
}
function Closet({ favorites, toggleFavorite }) {
  const [category, setCategory] = useState('All items')
  const [uploaded, setUploaded] = useState([])
  const [deleted, setDeleted] = useState(() => { try { return JSON.parse(localStorage.getItem('wardrobe-deleted-items') || '[]') } catch { return [] } })
  const [uploadCategory, setUploadCategory] = useState('Top')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const fileInput = useRef(null)
  useEffect(() => { uploadedClosetStore('read').then(setUploaded).catch(()=>setStatus('Saved images could not be loaded in this browser.')) }, [])
  const categories = ['All items', 'Top', 'Bottom', 'Shoes', 'Accessories']
  const items = [...closetItems, ...uploaded].filter(item => !deleted.includes(item.id))
  const visible = category === 'All items' ? items : items.filter(item => item.category === category)
  async function deleteItem(item) {
    const next = [...deleted, item.id]
    try {
      localStorage.setItem('wardrobe-deleted-items', JSON.stringify(next)); setDeleted(next)
      if (item.source) { await uploadedClosetStore('delete', [item]); setUploaded(previous => previous.filter(saved => saved.id !== item.id)) }
      setStatus(`${item.name} deleted.`)
    }
    catch { setStatus('This item could not be deleted. Browser storage is unavailable.') }
  }
  async function upload(event) {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (!files.length) return
    if (files.some(file=>!file.type.startsWith('image/'))) { setStatus('Please choose image files.'); return }
    setBusy(true); setStatus('Uploading images…')
    try {
      const additions = await Promise.all(files.map(async file => {
        const source = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(reader.error); reader.readAsDataURL(file) })
        await new Promise((resolve, reject) => { const image = new Image(); image.onload = resolve; image.onerror = reject; image.src = source })
        return { id: crypto.randomUUID(), category: uploadCategory, name: file.name.replace(/\.[^.]+$/, ''), source }
      }))
      await uploadedClosetStore('write', additions)
      setUploaded(previous => [...previous, ...additions]); setCategory(uploadCategory)
      setStatus(`${additions.length} ${additions.length === 1 ? 'image' : 'images'} added to ${uploadCategory}.`)
    } catch { setStatus('Images could not be saved. Try a different image or check available browser storage.') }
    finally { setBusy(false) }
  }
  return <section className="closet-layout">
    <aside className="closet-sidebar"><nav aria-label="Clothing categories">{categories.map(label => <button key={label} type="button" className={category === label ? 'selected' : ''} aria-pressed={category === label} onClick={()=>setCategory(label)}><span>{label}</span><span className="category-count">{label === 'All items' ? items.length : items.filter(item=>item.category===label).length}</span></button>)}</nav></aside>
    <section className="closet-items"><div className="closet-heading"><div><h1>{category === 'All items' ? 'Your items' : category}</h1><p>{visible.length} {visible.length === 1 ? 'item' : 'items'}</p></div><div className="closet-upload"><label htmlFor="upload-category">Upload to</label><select id="upload-category" value={uploadCategory} disabled={busy} onChange={event=>setUploadCategory(event.target.value)}>{categories.slice(1).map(label=><option key={label}>{label}</option>)}</select><button type="button" className="generate-outfit" disabled={busy} onClick={()=>fileInput.current.click()}><Icon name="plus" size={18}/>{busy ? 'Uploading…' : 'Upload images'}</button><input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={upload}/></div></div>
      <p className="closet-upload-status" role="status">{status}</p>
      {visible.length ? <div className="closet-item-grid">{visible.map(item=><ClosetItem key={item.id} item={item} onDelete={()=>deleteItem(item)} isFavorite={favorites.some(saved=>saved.id===item.id)} onFavorite={()=>toggleFavorite(item)}/>)}</div> : <div className="closet-empty"><h2>{category === 'All items' ? 'Your closet is empty' : `No ${category.toLowerCase()} yet`}</h2><p>Upload images to add items here.</p></div>}
    </section>
  </section>
}
function readFavorites() {
  try { return JSON.parse(localStorage.getItem('wardrobe-favorites') || '[]') } catch { return [] }
}
function FavoritesPage({ favorites, updateFavorites }) {
  const [editing, setEditing] = useState(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Top')
  const [error, setError] = useState('')
  function save(event) {
    event.preventDefault()
    if (!name.trim()) { setError('Enter an item name.'); return }
    if (updateFavorites(favorites.map(item=>item.id === editing ? {...item, name: name.trim(), category} : item))) setEditing(null)
    else setError('Changes could not be saved in this browser.')
  }
  return <section className="favorites-page"><h1>Your favourites</h1>{favorites.length ? <div className="closet-item-grid">{favorites.map(item=><article className="closet-item" key={item.id}><div className="closet-item-image"><img src={item.source || '/closet/'+item.image} alt={item.name}/></div><div className="closet-item-info">{editing === item.id ? <form className="favorite-edit" onSubmit={save}><label htmlFor={'favorite-name-'+item.id}>Name</label><input id={'favorite-name-'+item.id} value={name} required maxLength={100} onChange={event=>setName(event.target.value)}/><label htmlFor={'favorite-category-'+item.id}>Category</label><select id={'favorite-category-'+item.id} value={category} onChange={event=>setCategory(event.target.value)}>{['Top','Bottom','Shoes','Accessories'].map(label=><option key={label}>{label}</option>)}</select>{error && <p role="alert">{error}</p>}<div className="favorite-actions"><button className="favorite-save" type="submit">Save</button><button type="button" onClick={()=>setEditing(null)}>Cancel</button></div></form> : <><p>{item.category}</p><h3>{item.name}</h3><div className="favorite-actions"><button className="favorite-edit-button" type="button" aria-label={`Edit ${item.name}`} onClick={()=>{setEditing(item.id);setName(item.name);setCategory(item.category);setError('')}}>Edit</button><button className="closet-delete" type="button" aria-label={`Remove ${item.name} from favourites`} onClick={()=>updateFavorites(favorites.filter(saved=>saved.id!==item.id))}>Remove</button></div></>}</div></article>)}</div> : <div className="closet-empty"><h2>No favourites yet</h2></div>}</section>
}

function ClosetItem({item, onDelete, onFavorite, isFavorite}) {
  return <article className="closet-item"><div className="closet-item-image"><img src={item.source || '/closet/'+item.image} alt={item.name}/></div><div className="closet-item-info"><p>{item.category}</p><h3>{item.name}</h3><div className="item-action-row">{onFavorite && <button className={'item-favorite '+(isFavorite ? 'saved' : '')} type="button" aria-label={`${isFavorite ? 'Remove' : 'Save'} ${item.name} ${isFavorite ? 'from' : 'to'} favourites`} aria-pressed={!!isFavorite} onClick={onFavorite}><Icon name="heart" size={21}/></button>}{onDelete && <button className="closet-delete" type="button" aria-label={`Delete ${item.name}`} onClick={onDelete}>Delete</button>}</div></div></article>
}

function OutfitsPage({ favorites, toggleFavorite }) {
  const [suit, setSuit] = useState(null)
  const [generation, setGeneration] = useState(0)
  const [styleRequest, setStyleRequest] = useState('')
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
    setPlace(selected); setQuery(selected.label); setMatches([]); setWeather(null); setSuit(null); setError(''); setBusy(true)
    try { const result = await getWeather(selected); if (id === request.current) setWeather(result) }
    catch { if (id === request.current) setError('Could not load weather. Check your connection and try again.') }
    finally { if (id === request.current) setBusy(false) }
  }
  useEffect(() => { if (defaultPlace) loadWeather(defaultPlace); return () => { request.current++ } }, [])
  async function search(event) {
    event.preventDefault()
    const text = query.trim()
    if (!text) { setError('Enter an address or city.'); return }
    if (Date.now() - lastSearch.current < 1500) return
    lastSearch.current = Date.now()
    const id = ++request.current
    setBusy(true); setError(''); setNotice(''); setWeather(null); setPlace(null); setSuit(null); setMatches([])
    try {
      const results = await searchLocations(text)
      if (id !== request.current) return
      setMatches(results)
      if (!results.length) setError('No location found. Include the city, state, or postal code and try again.')
    } catch { if (id === request.current) setError('Could not search locations. Check your connection and try again.') }
    finally { if (id === request.current) setBusy(false) }
  }
  function saveDefault() {
    try { localStorage.setItem(DEFAULT_LOCATION_KEY, JSON.stringify(place)); setDefaultPlace(place); setNotice('Default location saved.') }
    catch { setError('Could not save your default location in this browser.') }
  }
  function generate() { setAppliedStyle(styleRequest.trim()); setSuit(Math.floor(Math.random() * 2) + 1); setGeneration(previous => previous + 1) }
  const description = weather ? describeWeather(weather.code) : null
  const date = weather ? new Date(weather.date+'T12:00:00').toLocaleDateString(undefined, {weekday:'long',month:'long',day:'numeric'}) : ''
  return <section className="outfits-layout">
    <aside className="weather-panel"><p className="weather-label">TODAY’S WEATHER</p>
      <form className="location-form" onSubmit={search}><label htmlFor="weather-address">Address or destination</label><input id="weather-address" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Street address, city, state" maxLength={250} required/><button className="settings-purple" type="submit" disabled={busy}>{busy ? 'Loading…' : 'Get weather'}</button></form>
      {defaultPlace && <button className="use-default" type="button" disabled={busy} onClick={()=>{setNotice('');loadWeather(defaultPlace)}}>Use default location</button>}
      {defaultPlace && <p className="default-location">Default: {defaultPlace.label}</p>}
      {matches.length > 0 && <div className="location-matches"><p>Choose your location to get weather</p><ul>{matches.map(match=><li key={match.label}><button type="button" onClick={()=>loadWeather(match)}>{match.label}</button></li>)}</ul></div>}
      {error && <p className="location-error" role="alert">{error}</p>}{notice && <p className="location-notice" role="status">{notice}</p>}
      {busy && <p role="status" className="location-hint">Finding your location’s weather…</p>}
      {place && !busy && <div className="active-location"><h2>{place.label}</h2>{JSON.stringify(place) !== JSON.stringify(defaultPlace) && <button className="use-default" type="button" onClick={saveDefault}>Save as default</button>}{!weather && <button className="use-default" type="button" onClick={()=>loadWeather(place)}>Retry weather</button>}</div>}
      {weather && <><h1>{date}</h1><div className="weather-sun" aria-hidden="true">{description.icon}</div><p className="weather-temperature">{Math.round(weather.temperature)}<span>°C</span></p><h2>{description.label}</h2><div className="weather-details"><div><span>Feels like</span><strong>{Math.round(weather.feelsLike)}°C</strong></div><div><span>Rain chance today</span><strong>{weather.rain === null ? 'Unavailable' : weather.rain+'%'}</strong></div></div><p className="weather-updated">Local update: {weather.time.replace('T',' ')}</p></>}
      <p className="weather-sources">Weather: <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a> · Places: <a href="https://photon.komoot.io/" target="_blank" rel="noreferrer">Photon</a> / <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap</a></p>
    </aside>
    <section className="outfit-generator"><div className="generator-heading"><div><h1>Your outfit for today</h1></div></div>
      <div className="style-request-field"><textarea id="outfit-style-request" value={styleRequest} maxLength={500} rows={3} onChange={event=>setStyleRequest(event.target.value)} placeholder="Please generate an autumn outfit that fits today’s season."/><div className="style-request-footer"><span>{styleRequest.length}/500</span></div></div>
      {weather && <div className="outfit-weather-advice"><strong>For your selected location</strong><p>{weatherAdvice(weather)}</p></div>}
      <div aria-live="polite" aria-atomic="true">{suit === null ? <div className="outfit-prompt"><button className="generate-outfit" type="button" onClick={generate}>Generate outfit</button></div> : <section className="generated-suit" key={generation}>{appliedStyle && <div className="applied-style"><strong>Your style request</strong><p>{appliedStyle}</p></div>}<div className="closet-item-grid">{closetItems.filter(item=>item.suit===suit).map(item=><ClosetItem key={item.id} item={item} isFavorite={favorites.some(saved=>saved.id===item.id)} onFavorite={()=>toggleFavorite(item)}/>)}</div><div className="generator-button-center generated-button"><button className="generate-outfit" type="button" onClick={generate}>Generate another outfit</button></div></section>}</div>
    </section>
  </section>
}

function hueToHex(hue) {
  const h = ((Number(hue) % 360) + 360) % 360
  const saturation = 0.78
  const lightness = 0.52
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const x = chroma * (1 - Math.abs((h / 60) % 2 - 1))
  const m = lightness - chroma / 2
  const [r, g, b] = h < 60 ? [chroma, x, 0] : h < 120 ? [x, chroma, 0] : h < 180 ? [0, chroma, x] : h < 240 ? [0, x, chroma] : h < 300 ? [x, 0, chroma] : [chroma, 0, x]
  return '#' + [r, g, b].map(channel => Math.round((channel + m) * 255).toString(16).padStart(2, '0')).join('')
}

function hexToHue(hex) {
  const n = parseInt(hex.replace('#', ''), 16)
  if (!Number.isFinite(n)) return 260
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min
  if (delta === 0) return 260
  let hue = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4
  return Math.round((hue * 60 + 360) % 360)
}

function HomeThemePicker({ accentColor, setAccentColor }) {
  const hue = hexToHue(accentColor)
  return <div className="home-theme-picker">
    <label htmlFor="home-color-slider">Choose your theme color</label>
    <input id="home-color-slider" className="home-color-slider rainbow-slider" type="range" min="0" max="359" step="1" value={hue} onChange={event => setAccentColor(hueToHex(event.target.value))} aria-label="Slide to choose any theme color" />
  </div>
}

function Dashboard({ email, logout }) {
  const [favorites, setFavorites] = useState(readFavorites)
  const [favoriteError, setFavoriteError] = useState('')
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('wardrobe-accent-color') || '#7046d6')

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor)
    document.documentElement.style.setProperty('--accent-soft', hexToRgba(accentColor, 0.19))
    document.documentElement.style.setProperty('--accent-strong', hexToRgba(accentColor, 0.58))
    localStorage.setItem('wardrobe-accent-color', accentColor)
  }, [accentColor])

  function updateFavorites(next) {
    try { localStorage.setItem('wardrobe-favorites', JSON.stringify(next)); setFavorites(next); setFavoriteError(''); return true }
    catch { setFavoriteError('Favourites could not be saved in this browser.'); return false }
  }
  function toggleFavorite(item) { updateFavorites(favorites.some(saved=>saved.id===item.id) ? favorites.filter(saved=>saved.id!==item.id) : [...favorites, {...item}]) }

  const [page,setPage]=useState('home'); const nav=[[MdHome,'Home'],[TfiLayoutColumn2,'Closet'],[BiCloset,'Outfits']]
  const initials=(email || 'Y').slice(0,1).toUpperCase()
  return <main className="app-shell"><header className="app-header"><div className="app-nav">{nav.map(([NavIcon,l])=><button key={l} className={page===l.toLowerCase()?'active':''} onClick={()=>setPage(l.toLowerCase())}><NavIcon size={20} aria-hidden="true"/><span>{l}</span></button>)}</div><button className="app-brand" onClick={()=>setPage('home')}>wardrobe</button><div className="right-nav"><button className={page==='favourites'?'active':''} onClick={()=>setPage('favourites')}><Icon name="heart" size={19}/><span>Favourites</span></button><button className={page==='profile'?'active':''} onClick={()=>setPage('profile')}><CgProfile size={22} aria-hidden="true"/><span>Settings</span></button></div></header>
  {favoriteError && <p className="favorite-status" role="alert">{favoriteError}</p>}
  {page==='profile' ? <Profile email={email} logout={logout} /> : page==='favourites' ? <FavoritesPage favorites={favorites} updateFavorites={updateFavorites}/> : page==='outfits' ? <OutfitsPage favorites={favorites} toggleFavorite={toggleFavorite}/> : page==='closet' ? <Closet favorites={favorites} toggleFavorite={toggleFavorite}/> : page==='home' ? <section className="main-homepage"><div className="home-page-content"><HomeThemePicker accentColor={accentColor} setAccentColor={setAccentColor} /><h1>Wardrobe<br/>Management System</h1></div></section> : <section className="dashboard"><div className="dash-heading"><div><p className="date">TUESDAY, APRIL 16</p><h1>Good morning, {email?.split('@')[0] || 'there'} <span>✦</span></h1><p className="sub">Your wardrobe is ready when you are.</p></div><button className="add-btn"><Icon name="plus" size={18}/> Add to closet</button></div><div className="insight-card"><div className="insight-mark"><Icon name="spark" size={23}/></div><div><span>YOUR DAILY EDIT</span><h3>Sunny skies call for something effortless.</h3><p>We picked a few looks that feel like you.</p></div><button className="view-edit">View today’s edit <Icon name="arrow" size={17}/></button></div><div className="content-grid"><section><div className="section-title"><h2>{page==='favourites'?'Your favourites':'Outfits for today'}</h2><button>View all <Icon name="chevron" size={16}/></button></div><div className="outfits"><Outfit type="city" title="City soft tailoring" tag="WORK · 18°C"/><Outfit type="cream" title="A little bit golden" tag="LUNCH · 20°C"/><Outfit type="black" title="After-dark ease" tag="DINNER · 16°C"/></div></section><aside className="closet-summary"><div className="summary-top"><div><p>YOUR CLOSET</p><h3>48 pieces</h3></div><button><Icon name="arrow" size={17}/></button></div><div className="closet-bars"><i></i><i></i><i></i><i></i><i></i></div><div className="summary-bottom"><span><b>12</b> New this season</span><span><b>8</b> Never worn</span></div></aside></div></section>}
 </main>
}

function Profile({email,logout}) {
  const [username, setUsername] = useState(() => localStorage.getItem('wardrobe-username') || (email ? email.split('@')[0] : 'Guest'))
  const [editingUsername, setEditingUsername] = useState(false)
  const [usernameDraft, setUsernameDraft] = useState(username)
  const [usernameStatus, setUsernameStatus] = useState('')
  function saveUsername(event) {
    event.preventDefault()
    const value = usernameDraft.trim()
    if (!value) { setUsernameStatus('Enter a username.'); return }
    try { localStorage.setItem('wardrobe-username', value); setUsername(value); setEditingUsername(false); setUsernameStatus('') }
    catch { setUsernameStatus('Username could not be saved in this browser.') }
  }
  const [theme, setTheme] = useState(() => localStorage.getItem('wardrobe-theme') || 'light')
  const [openPassword, setOpenPassword] = useState(false)
  const [openTheme, setOpenTheme] = useState(false)
  const [message, setMessage] = useState('')
  function changeTheme(value) {
    setTheme(value); document.documentElement.dataset.theme = value
    try { localStorage.setItem('wardrobe-theme', value) } catch {}
  }
  return <section className="settings-page"><section className="settings-account"><CgProfile size={54} aria-hidden="true"/><h2>{username}</h2>{editingUsername ? <form className="username-form" onSubmit={saveUsername}><label htmlFor="settings-username">Username</label><input id="settings-username" value={usernameDraft} onChange={event=>setUsernameDraft(event.target.value)} required maxLength={50} autoComplete="username"/><div className="favorite-actions"><button className="settings-purple" type="submit">Save</button><button type="button" onClick={()=>{setEditingUsername(false);setUsernameStatus('')}}>Cancel</button></div></form> : <button className="username-edit" type="button" onClick={()=>{setUsernameDraft(username);setEditingUsername(true);setUsernameStatus('')}}>Edit username</button>}{usernameStatus && <p role="status" className="settings-help">{usernameStatus}</p>}<dl><div><dt><MdOutlineEmail size={20} aria-hidden="true"/><span>Email</span></dt><dd>{email || 'Not signed in'}</dd></div></dl></section>
    <section className="settings-section settings-combined"><div className="settings-option"><button className="settings-option-row" type="button" aria-expanded={openPassword} onClick={()=>{setOpenPassword(!openPassword);setMessage('')}}><span>Change password</span><span className={openPassword ? 'option-arrow expanded' : 'option-arrow'}><Icon name="chevron" size={20}/></span></button>{openPassword && <form className="settings-password-form" onSubmit={event=>{event.preventDefault();setMessage('Password changes will be available when account authentication is connected.')}}><p className="settings-help">Password changes are not connected to an account service yet.</p><label htmlFor="settings-current">Current password</label><input id="settings-current" type="password" autoComplete="current-password" required/><label htmlFor="settings-new">New password</label><input id="settings-new" type="password" autoComplete="new-password" minLength={8} required/><label htmlFor="settings-confirm">Confirm new password</label><input id="settings-confirm" type="password" autoComplete="new-password" minLength={8} required/><button className="settings-purple" type="submit">Change password</button>{message && <p role="status" className="settings-help">{message}</p>}</form>}</div>
    <div className="settings-option"><button className="settings-option-row" type="button" aria-expanded={openTheme} onClick={()=>setOpenTheme(!openTheme)}><span>Themes</span><span className={openTheme ? 'option-arrow expanded' : 'option-arrow'}><Icon name="chevron" size={20}/></span></button>{openTheme && <div className="settings-theme-controls"><label className="theme-label" htmlFor="theme-select">Switch to a different theme</label><select id="theme-select" value={theme} onChange={event=>changeTheme(event.target.value)}><option value="light">Light</option><option value="dark">Dark</option></select></div>}</div></section>
    <div className="settings-signout"><button type="button" onClick={logout}>Sign out</button></div>
  </section>
}

function AccountPage({ mode, onComplete, changeMode, onClose }) {
  const signup = mode === 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  function submit(event) {
    event.preventDefault()
    if (signup && password !== confirm) { setError('Passwords do not match.'); return }
    setError('')
    onComplete(email.trim())
  }
  return <main className="account-page">
    <button className="account-close" type="button" aria-label="Close account page and go to main page" onClick={onClose}>×</button>
    <section className="account-art" aria-label="Wardrobe"><div className="wardrobe-card"><h2>Wardrobe</h2><p>Everything you own,<br/>in one place.</p></div></section>
    <section className="account-panel"><div className="account-form-wrap">
      <h1>{signup ? 'Create your account' : 'Log in'}</h1>
      <p className="account-subtitle">{signup ? 'Start building your digital closet' : 'Welcome back to your digital closet'}</p>
      <form onSubmit={submit}>
        <div className="account-field"><label htmlFor="account-email">Email</label><input id="account-email" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} /></div>
        <div className="account-field"><label htmlFor="account-password">Password</label><div className="password-input"><input id="account-password" type={showPassword ? 'text' : 'password'} autoComplete={signup ? 'new-password' : 'current-password'} minLength={8} required value={password} onChange={e=>{setPassword(e.target.value);setError('')}} aria-describedby={signup ? 'password-hint' : undefined}/><button type="button" aria-controls="account-password" aria-pressed={showPassword} onClick={()=>setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</button></div>{signup && <p id="password-hint" className="password-hint">At least 8 characters</p>}</div>
        {signup && <div className="account-field"><label htmlFor="account-confirm">Confirm password</label><div className="password-input"><input id="account-confirm" type={showConfirm ? 'text' : 'password'} autoComplete="new-password" minLength={8} required value={confirm} onChange={e=>{setConfirm(e.target.value);setError('')}} aria-invalid={!!error} aria-describedby={error ? 'account-error' : undefined}/><button type="button" aria-controls="account-confirm" aria-pressed={showConfirm} onClick={()=>setShowConfirm(!showConfirm)}>{showConfirm ? 'Hide' : 'Show'}</button></div></div>}
        {error && <p id="account-error" className="account-error" role="alert">{error}</p>}
        <button className="account-submit" type="submit">{signup ? 'Create account' : 'Log in'}</button>
      </form>
      <p className="account-switch">{signup ? 'Already have an account?' : 'Don’t have an account?'} <button type="button" onClick={()=>changeMode(signup ? 'signin' : 'signup')}>{signup ? 'Log in' : 'Create an account'}</button></p>
    </div></section>
  </main>
}

function App(){useEffect(()=>{document.documentElement.dataset.theme=localStorage.getItem('wardrobe-theme')||'light'},[]);const [view,setView]=useState('landing');const [email,setEmail]=useState(()=>localStorage.getItem('myapp-email')||'');const login=e=>{localStorage.setItem('myapp-email',e);setEmail(e);setView('app')};const logout=()=>{localStorage.removeItem('myapp-email');setEmail('');setView('signin')};return view==='landing'?<Landing goLogin={()=>setView('login')}/>:view==='login'?<Login goHome={()=>setView('landing')} onLogin={login} goSignup={()=>setView('signup')} goSignin={()=>setView('signin')}/>:view==='signup'||view==='signin'?<AccountPage key={view} mode={view} onComplete={login} changeMode={setView} onClose={()=>setView('app')}/>:<Dashboard email={email} logout={logout}/>}
createRoot(document.getElementById('root')).render(<App />)
