import React, { useState, useEffect, useRef } from 'react'
import './App.css'
import { DEFAULT_LOCATION_KEY, readDefaultLocation, searchLocations, getWeather, sendWeather, describeWeather } from './weather'
import { CgProfile } from 'react-icons/cg'
import { CiHeart } from 'react-icons/ci'
import { BsChatText } from 'react-icons/bs'
import { MdHome, MdOutlineEmail } from 'react-icons/md'
import { TfiLayoutColumn2 } from 'react-icons/tfi'
import { BiCloset } from 'react-icons/bi'
import { loginUser, registerUser, callApi, logout } from './api/auth'
import { getArticles } from './api/wardrobe'

import ClosetItem from './components/ClosetItem'
import Icon from './components/Icon'
import Outfit from './components/Outfit'
import HomeThemePicker from './components/HomeThemePicker'
import AboutUs from './components/AboutUs'
import SearchResults from './components/SearchResults'
import FavoritesPage from './components/FavoritesPage'
import Profile from './components/Profile'
import HomePage from './components/HomePage'
import DashboardComponent from './components/Dashboard'

// store the available colors for the website theme
const ACCENT_OPTIONS = [
  { name: 'Purple', value: '#7046d6' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Orange', value: '#f59e0b' },
  { name: 'Rose', value: '#ec4899' }
]

// convert a hex color to rgba so we can use transparent theme colors
function hexToRgba(hex, alpha = 1) {
  const clean = hex.replace('#', '')
  const value = clean.length === 3 ? clean.split('').map(char => char + char).join('') : clean
  const num = Number.parseInt(value, 16)
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// display the welcome page before the user logs in
function Landing({ goLogin }) {
  return <main className="landing photo-landing">
    <div className="photo-overlay" />
    <nav className="landing-nav photo-nav"><a className="brand">My App</a><div className="nav-links"><a href="#home">Home</a><a href="#about">About</a><a href="#contact">Contact</a></div><button className="pill-light" onClick={goLogin}>Get Started</button></nav>
    <section className="hero photo-hero"><h1><span>Get More</span> <em>Outfits</em></h1><div className="hero-actions"><button className="primary-btn" onClick={goLogin}>Get Started</button><button className="learn-btn">Learn More</button></div></section>
  </main>
}

// show the introduction and account options
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

// Convert backend database articles into the format used by closet cards
function mapArticle(article) {
  const categoryMap = {
    Undertop: 'Top',
    Overtop: 'Top',
    Bottom: 'Bottom',
    Shoe: 'Shoes',
    Headwear: 'Accessories',
    Misc: 'Accessories'
  }

  return {
    id: `article-${article.articleId}`,
    articleId: article.articleId,
    category: categoryMap[article.category] || 'Accessories',
    name: article.name,
    description: article.description,
    palette: article.palette,
    tags: article.tags,
    imageId: article.imageId,
    filename: article.filename
  }
}

// store the default clothing items shown in the closet
const closetItems = [
  { id: 'top1', category: 'Top', name: 'Black blazer', image: 'ImageTop1.jpg', suit: 1 },
  { id: 'bottom1', category: 'Bottom', name: 'Black tailored trousers', image: 'ImageBot1.jpg', suit: 1 },
  { id: 'accessory1', category: 'Accessories', name: 'Gold charm necklace', image: 'ImgaeAcs1.jpg', suit: 1 },
  { id: 'top2', category: 'Top', name: 'Charcoal blazer', image: 'ImageTop2.jpg', suit: 2 },
  { id: 'bottom2', category: 'Bottom', name: 'Charcoal trousers', image: 'ImageBot2.jpg', suit: 2 },
  { id: 'accessory2', category: 'Accessories', name: 'Patterned tie', image: 'ImageAcs2.jpg', suit: 2 }
]
// Load all clothing images from src/assets
const clothingImages = import.meta.glob(
  './assets/*.{jpg,jpeg,png,webp,heic}',
  {
    eager: true,
    query: '?url',
    import: 'default'
  }
)

function getClothingImage(filename) {
  return clothingImages[`./assets/${filename}`]
}
// 30 new clothing items included with the project
const newClosetItems = [
  { id: 'new-01', category: 'Accessories', name: 'Black beanie', source: getClothingImage('Black beanie.jpg') },
  { id: 'new-02', category: 'Top', name: 'Black cat crewneck', source: getClothingImage('Black cat crewneck.jpg') },
  { id: 'new-03', category: 'Bottom', name: 'Black cat jean', source: getClothingImage('Black cat jean.jpg') },
  { id: 'new-04', category: 'Top', name: 'Black crewneck sweatshirt', source: getClothingImage('Black crweneck sweatshirt.jpg') },
  { id: 'new-05', category: 'Bottom', name: 'Black jean', source: getClothingImage('Black jean.jpg') },
  { id: 'new-06', category: 'Top', name: 'Blue dog sweater', source: getClothingImage('Blue dog sweater.jpg') },
  { id: 'new-07', category: 'Bottom', name: 'Blue star jean', source: getClothingImage('Blue star jean.jpg') },
  { id: 'new-08', category: 'Top', name: 'Blue sweater', source: getClothingImage('Blue sweater.jpg') },
  { id: 'new-09', category: 'Bottom', name: 'Brown and blue plaid trousers', source: getClothingImage('Brown and blur plaid trousers.jpg') },
  { id: 'new-10', category: 'Accessories', name: 'Brown knit hat', source: getClothingImage('Brown knit hat.jpg') },
  { id: 'new-11', category: 'Bottom', name: 'Brown trousers', source: getClothingImage('Brown trousers.jpg') },
  { id: 'new-12', category: 'Accessories', name: 'Cartoon dog knit hat', source: getClothingImage('Cartoon dog knit hat.jpg') },
  { id: 'new-13', category: 'Top', name: 'Dark green cat crewneck sweatshirt', source: getClothingImage('Dark green cat crewneck sweatshirt .jpg') },
  { id: 'new-14', category: 'Bottom', name: 'Dark-blue trousers', source: getClothingImage('Dark-blue trousers.jpg') },
  { id: 'new-15', category: 'Top', name: 'Green cat sweater', source: getClothingImage('Green cat sweater.jpg') },
  { id: 'new-16', category: 'Top', name: 'Grey-blue crewneck', source: getClothingImage('Grey-blue crewneck.jpg') },
  { id: 'new-17', category: 'Bottom', name: 'Khaki star trousers', source: getClothingImage('Khaki start trousers.jpg') },
  { id: 'new-18', category: 'Bottom', name: 'Khaki trousers', source: getClothingImage('Khaki trousers.jpg') },
  { id: 'new-19', category: 'Bottom', name: 'Light-blue jean', source: getClothingImage('Light-blue jean.jpg') },
  { id: 'new-20', category: 'Top', name: 'Off-white crewneck', source: getClothingImage('Off-white crewneck.jpg') },
  { id: 'new-21', category: 'Shoes', name: 'Pink and white sneaker', source: getClothingImage('Pink and white sneaker.jpg') },
  { id: 'new-22', category: 'Accessories', name: 'Purple cat knit hat', source: getClothingImage('Purple cat knit hat.jpg') },
  { id: 'new-23', category: 'Accessories', name: 'Rainbow knit hat', source: getClothingImage('Rainbow knit hat.jpg') },
  { id: 'new-24', category: 'Shoes', name: 'Sail and Brown sneaker', source: getClothingImage('Sail and Brown sneaker.jpg') },
  { id: 'new-25', category: 'Shoes', name: 'White Sneaker', source: getClothingImage('White Sneaker.jpg') },
  { id: 'new-26', category: 'Top', name: 'White bear sweater', source: getClothingImage('White bear sweater.jpg') },
  { id: 'new-27', category: 'Accessories', name: 'White cat fish knit hat', source: getClothingImage('White cat fish knit hat.jpg') },
  { id: 'new-28', category: 'Top', name: 'White crewneck', source: getClothingImage('White crewneck.jpg') },
  { id: 'new-29', category: 'Bottom', name: 'White trousers', source: getClothingImage('White trousers.jpg') },
  { id: 'new-30', category: 'Top', name: 'Yellow cat sweater', source: getClothingImage('Yellow cat sweater.jpg') }
]
// save, load, or delete uploaded clothing images in the browser database
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
// show all closet items and let the user upload, filter, or delete clothing
function Closet({ favorites, toggleFavorite }) {
  const [articles, setArticles] = useState([])
  const [loadingArticles, setLoadingArticles] = useState(true)
  const [articleError, setArticleError] = useState('')

 useEffect(() => {
  getArticles()
    .then(data => {
      console.log('Database articles:', JSON.stringify(data, null, 2))
      console.log('First article property names:', Object.keys(data[0]))

      console.log('Image filenames:', data.map(article => ({
        id: article.articleId,
        imageId: article.imageId,
        filename: article.filename
      })))

      setArticles(data)
    })
    .catch(error => {
      console.error('Failed to load articles:', error)
      setArticleError(error.message)
    })
    .finally(() => {
      setLoadingArticles(false)
    })
}, [])

  // keep track of which clothing category the user selects
  const [category, setCategory] = useState('All items')
  const [uploaded, setUploaded] = useState([])
  const [deleted, setDeleted] = useState(() => { try { return JSON.parse(localStorage.getItem('wardrobe-deleted-items') || '[]') } catch { return [] } })
  const [uploadCategory, setUploadCategory] = useState('Top')
  //when a category is selected, use it for new uploads
  function selectCategory(nextCategory) {
    setCategory(nextCategory)
    if (nextCategory !== 'All items') setUploadCategory(nextCategory)
  }
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const fileInput = useRef(null)
  const [pendingFiles, setPendingFiles] = useState([])
  const [pendingIndex, setPendingIndex] = useState(0)
  const [pendingName, setPendingName] = useState('')
  const [pendingCategory, setPendingCategory] = useState('Top')
  useEffect(() => { uploadedClosetStore('read').then(setUploaded).catch(()=>setStatus('Saved images could not be loaded in this browser.')) }, [])
  const categories = ['All items', 'Top', 'Bottom', 'Shoes', 'Accessories']
  const databaseItems = articles.map(mapArticle)

  const items = [...databaseItems, ...uploaded]
    .filter(item => !deleted.includes(item.id))
  const visible = category === 'All items' ? items : items.filter(item => item.category === category)
  if (loadingArticles) {
    return <div className="closet-loading">Loading your closet...</div>
  }

  if (articleError) {
    return <div className="closet-error">{articleError}</div>
  }
  // remove the selected clothing item and update browser storage
  async function deleteItem(item) {
    const next = [...deleted, item.id]
    try {
      localStorage.setItem('wardrobe-deleted-items', JSON.stringify(next)); setDeleted(next)
      if (item.source) { await uploadedClosetStore('delete', [item]); setUploaded(previous => previous.filter(saved => saved.id !== item.id)) }
      setStatus(`${item.name} deleted.`)
    }
    catch { setStatus('This item could not be deleted. Browser storage is unavailable.') }
  }
  //save the corrected clothing name to the browser database
  async function saveClothingName(item) {
    const name = editName.trim()
    if (!name) { setStatus('Please enter a clothing name.'); return }
    try {
      const updated = { ...item, name }
      await uploadedClosetStore('write', [updated])
      setUploaded(previous => previous.map(saved => saved.id === item.id ? updated : saved))
      setEditingId(null)
      setStatus('Clothing name updated.')
    } catch { setStatus('Could not save the updated name.') }
  }
  //show a centered name window after selecting images
  function upload(event) {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (!files.length) return
    if (files.some(file => !file.type.startsWith('image/'))) {
      setStatus('Please choose image files.')
      return
    }
    setPendingFiles(files)
    setPendingIndex(0)
    setPendingName('')
    setPendingCategory(uploadCategory)
    setStatus('')
  }
  //close the name window and clear pending images
  function cancelNaming() {
    setPendingFiles([])
    setPendingIndex(0)
    setPendingName('')
  }
  //save the current image using the name entered by the user
  async function savePendingImage(event) {
    event.preventDefault()
    const name = pendingName.trim()
    const file = pendingFiles[pendingIndex]
    if (!file || !name || busy) return
    setBusy(true)
    try {
      const source = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(file)
      })
      const item = {
        id: crypto.randomUUID(),
        category: pendingCategory,
        name: name.slice(0, 100),
        source
      }
      await uploadedClosetStore('write', [item])
      setUploaded(previous => [...previous, item])
      setCategory(pendingCategory)
      setStatus(`${item.name} saved to ${pendingCategory}.`)
      if (pendingIndex + 1 < pendingFiles.length) {
        setPendingIndex(previous => previous + 1)
        setPendingName('')
      } else {
        cancelNaming()
      }
    } catch {
      setStatus('Image could not be saved. Check available browser storage.')
    } finally {
      setBusy(false)
    }
  }
  return <section className="closet-layout">
    <aside className="closet-sidebar"><nav aria-label="Clothing categories">{categories.map(label => <button key={label} type="button" className={category === label ? 'selected' : ''} aria-pressed={category === label} onClick={()=>selectCategory(label)}><span>{label}</span><span className="category-count">{label === 'All items' ? items.length : items.filter(item=>item.category===label).length}</span></button>)}</nav></aside>
    <section className="closet-items"><div className="closet-heading"><div><h1>{category === 'All items' ? 'Your items' : category}</h1><p>{visible.length} {visible.length === 1 ? 'item' : 'items'}</p></div><div className="closet-upload"><label htmlFor="upload-category">Upload to</label><select id="upload-category" value={uploadCategory} disabled={busy} onChange={event=>setUploadCategory(event.target.value)}>{categories.slice(1).map(label=><option key={label}>{label}</option>)}</select><button type="button" className="generate-outfit" disabled={busy} onClick={()=>fileInput.current.click()}><Icon name="plus" size={18}/>{busy ? 'Uploading…' : 'Upload images'}</button><input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={upload}/></div></div>
      <p className="closet-upload-status" role="status">{status}</p>
      {pendingFiles.length > 0 && <div className="item-name-overlay" onMouseDown={event => { if (event.target === event.currentTarget && !busy) cancelNaming() }}>
        <form className="item-name-dialog" role="dialog" aria-modal="true" aria-labelledby="item-name-title" onSubmit={savePendingImage}>
          <h2 id="item-name-title">Please enter the item name</h2>
          <p>{pendingCategory} · Image {pendingIndex + 1} of {pendingFiles.length}</p>
          <input autoFocus aria-label="Item name" placeholder="e.g. Black Jeans" value={pendingName} onChange={event => setPendingName(event.target.value)} maxLength={100} required />
          <div className="item-name-actions">
            <button type="submit" className="generate-outfit" disabled={busy || !pendingName.trim()}>{busy ? 'Saving…' : 'Save item'}</button>
            <button type="button" onClick={cancelNaming} disabled={busy}>Cancel</button>
          </div>
        </form>
      </div>}
      {editingId && <form className="clothing-name-editor" onSubmit={event=>{event.preventDefault();const item=uploaded.find(saved=>saved.id===editingId);if(item)saveClothingName(item)}}>
        <label htmlFor="edit-clothing-name">Edit clothing name</label>
        <input id="edit-clothing-name" value={editName} maxLength={100} onChange={event=>setEditName(event.target.value)} required />
        <button type="submit">Save</button><button type="button" onClick={()=>setEditingId(null)}>Cancel</button>
      </form>}
      {visible.length ? <div className="closet-item-grid">{visible.map(item=><ClosetItem key={item.id} item={item} onDelete={()=>deleteItem(item)} isFavorite={favorites.some(saved=>saved.id===item.id)} onFavorite={()=>toggleFavorite(item)} onEdit={item.source ? ()=>{setEditingId(item.id);setEditName(item.name)} : undefined}/>)}</div> : <div className="closet-empty"><h2>{category === 'All items' ? 'Your closet is empty' : `No ${category.toLowerCase()} yet`}</h2><p>Upload images to add items here.</p></div>}
    </section>
  </section>
}

// load the saved favorite items from local storage
function readFavorites() {
  try { return JSON.parse(localStorage.getItem('wardrobe-favorites') || '[]') } catch { return [] }
}

// convert the slider hue value to a hex color
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

// convert the current hex color to a slider hue value
function hexToHue(hex) {
  const n = parseInt(hex.replace('#', ''), 16)
  if (!Number.isFinite(n)) return 260
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min
  if (delta === 0) return 260
  let hue = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4
  return Math.round((hue * 60 + 360) % 360)
}

// colors for the slider, including neutral colors
const SLIDER_COLORS = ['#d83b43', '#e15a4e', '#e87b53', '#ec9a66', '#e5b77e', '#d6bd83', '#b7b878', '#8fb47b', '#65a98c', '#4ca69d', '#4b9fae', '#4d8eb8', '#557cc1', '#646bc2', '#755fc0', '#7046d6', '#895ed4', '#a774d4', '#c48acb', '#ce8caf', '#b98686', '#a77a6b', '#906b58', '#785b4b', '#604c42', '#514743', '#66615e', '#807e7b', '#a5a3a0', '#b9b9b9', '#8e8e8e', '#686868', '#454545', '#292929', '#101010']

function Dashboard({ email, logout }) {
  return (
    <DashboardComponent
      email={email}
      logout={logout}
      readFavorites={readFavorites}
      hexToRgba={hexToRgba}
      sliderColors={SLIDER_COLORS}
      uploadedClosetStore={uploadedClosetStore}
      Closet={Closet}
      newClosetItems={newClosetItems}
    />
  )
}

// handle the sign up and log in forms
function AccountPage({ mode, onComplete, changeMode, onClose }) {
  const signup = mode === 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  async function submit(event) {
     event.preventDefault()

    if (signup && password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setError('')

    try {
      if (signup) {
        await registerUser({ email: email.trim(), password })
        await loginUser({ email: email.trim(), password })
      } else {
        await loginUser({ email: email.trim(), password })
      }

      onComplete(email.trim())
    } catch (err) {
      setError(err.message || 'Authentication failed.')
    }
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
        <button className="account-submit" type="submit">DEBUG</button>
      </form>
      <p className="account-switch">{signup ? 'Already have an account?' : 'Don’t have an account?'} <button type="button" onClick={()=>changeMode(signup ? 'signin' : 'signup')}>{signup ? 'Log in' : 'Create an account'}</button></p>
    </div></section>
  </main>
}

// control the current page and keep track of the logged in user
function App(){useEffect(()=>{document.documentElement.dataset.theme=localStorage.getItem('wardrobe-theme')||'light'},[]);const [view,setView]=useState(()=>localStorage.getItem('myapp-email')?'app':'landing');const [email,setEmail]=useState(()=>localStorage.getItem('myapp-email')||'');const [slideFromStart,setSlideFromStart]=useState(false);const openIntroduction=()=>{setSlideFromStart(true);setView('login')};const login=e=>{localStorage.setItem('myapp-email',e);setEmail(e);setView('app')};const logout=()=>{localStorage.removeItem('myapp-email');setEmail('');setView('signin')};return view==='landing'?<Landing goLogin={openIntroduction}/>:view==='login'?<div className={slideFromStart?'start-slide-up':''}><Login goHome={()=>{setSlideFromStart(false);setView('landing')}} onLogin={login} goSignup={()=>{setSlideFromStart(false);setView('signup')}} goSignin={()=>{setSlideFromStart(false);setView('signin')}}/></div>:view==='signup'||view==='signin'?<AccountPage key={view} mode={view} onComplete={login} changeMode={setView} onClose={()=>setView('landing')}/>:<Dashboard email={email} logout={logout}/>}
export default App