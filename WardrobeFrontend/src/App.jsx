import React, { useState, useEffect, useRef } from 'react'
import './App.css'
import { DEFAULT_LOCATION_KEY, readDefaultLocation, searchLocations, getWeather, describeWeather } from './weather'
import { CgProfile } from 'react-icons/cg'
import { CiHeart } from 'react-icons/ci'
import { BsChatText } from 'react-icons/bs'
import { MdHome, MdOutlineEmail } from 'react-icons/md'
import { TfiLayoutColumn2 } from 'react-icons/tfi'
import { BiCloset } from 'react-icons/bi'

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

// show the matching icon based on the icon name
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

// show the same introduction content after the start page in the About us menu
function AboutUs() {
  const steps = [
    ['1', 'Add what you own', 'Save each piece with its category, type, colors, and a short description.'],
    ['2', 'Browse your closet', 'See everything in one place and edit or remove items as your wardrobe changes.'],
    ['3', 'Get outfit ideas', 'Receive suggestions based on what you own, the current season, and your style.']
  ]
  const names = ['Kyra Albaugh', 'Khadijah Bashir', 'Xintong Jiang', 'Justin Miles', 'Lucas Prawdzik', 'Joel Schueerholz']
  return <main className="intro-page about-us-page"><section className="intro-content">
    <h1>Wardrobe is a tool to help<br/>you style outfits with<br/>clothing you already own</h1>
    <p className="intro-lede">Keep a digital inventory of your wardrobe and get outfit recommendations that<br/>fit the season and your style.</p>
    <section className="how-it-works"><h2>How it works</h2>{steps.map(([number,title,description])=><article className="how-step" key={number}><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div></article>)}</section>
    <footer className="group-info"><p>Built by Group 1 - COSC482W/581</p><div className="name-list">{names.map(name=><span key={name}>{name}</span>)}</div></footer>
  </section></main>
}

// display one outfit card with its name and favorite button
const Outfit = ({type, title, tag}) => <div className="outfit-card"><div className={'outfit-image '+type}><div className="mini-item"></div></div><div className="outfit-info"><div><h4>{title}</h4><span>{tag}</span></div><button><Icon name="heart" size={17}/></button></div></div>

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
  const items = [...closetItems, ...newClosetItems, ...uploaded].filter(item => !deleted.includes(item.id))
  const visible = category === 'All items' ? items : items.filter(item => item.category === category)
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
//search all saved clothing items by name or category
function SearchResults({ searchTerm, favorites, toggleFavorite }) {
  const [uploaded, setUploaded] = useState([])
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    uploadedClosetStore('read')
      .then(items => { if (active) setUploaded(items) })
      .catch(() => { if (active) setError('Could not load saved clothes.') })
    return () => { active = false }
  }, [])
  let deleted = []
  try { deleted = JSON.parse(localStorage.getItem('wardrobe-deleted-items') || '[]') } catch { deleted = [] }
  const term = searchTerm.trim().toLowerCase()
  const results = [...closetItems, ...uploaded]
    .filter(item => !deleted.includes(item.id))
    .filter(item => term && [item.name, item.category].some(value => String(value || '').toLowerCase().includes(term)))
  return <section className="wardrobe-search-results" aria-label="Clothing search results">
    <h1>Search results</h1>
    {term ? <p>{results.length} {results.length === 1 ? 'item' : 'items'} found for <strong>{searchTerm.trim()}</strong></p> : <p>Type a clothing name or category to search your closet.</p>}
    {error && <p role="alert">{error}</p>}
    {results.length > 0 && <div className="closet-item-grid">{results.map(item => <ClosetItem key={item.id} item={item} isFavorite={favorites.some(saved => saved.id === item.id)} onFavorite={() => toggleFavorite(item)} />)}</div>}
    {term && !results.length && !error && <div className="closet-empty"><h2>No matching items</h2><p>Try another clothing name or category.</p></div>}
  </section>
}

// load the saved favorite items from local storage
function readFavorites() {
  try { return JSON.parse(localStorage.getItem('wardrobe-favorites') || '[]') } catch { return [] }
}
// show the clothing items that the user saved as favorites
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

// display a clothing item with favorite and delete buttons
function ClosetItem({item, onDelete, onFavorite, isFavorite, onEdit}) {
  return <article className="closet-item"><div className="closet-item-image"><img src={item.source || '/closet/'+item.image} alt={item.name}/></div><div className="closet-item-info"><p>{item.category}</p><h3>{item.name}</h3><div className="item-action-row">{onEdit && <button className="closet-delete" type="button" onClick={onEdit}>Edit name</button>}{onFavorite && <button className={'item-favorite '+(isFavorite ? 'saved' : '')} type="button" aria-label={`${isFavorite ? 'Remove' : 'Save'} ${item.name} ${isFavorite ? 'from' : 'to'} favourites`} aria-pressed={!!isFavorite} onClick={onFavorite}><Icon name="heart" size={21}/></button>}{onDelete && <button className="closet-delete" type="button" aria-label={`Delete ${item.name}`} onClick={onDelete}>Delete</button>}</div></div></article>
}

// generate outfits using closet items and show the weather section
function OutfitsPage({ favorites, toggleFavorite, searchTerm = '', submittedStyle = '' }) {
  const [suit, setSuit] = useState(null)
  const [generation, setGeneration] = useState(0)
  const [uploaded, setUploaded] = useState([])
  const [generatedItems, setGeneratedItems] = useState([])
  const [outfitMessage, setOutfitMessage] = useState('')
  useEffect(() => {
    let active = true
    uploadedClosetStore('read').then(items => { if (active) setUploaded(items) }).catch(() => { if (active) setOutfitMessage('Could not load saved clothes.') })
    return () => { active = false }
  }, [])
  const [styleRequest, setStyleRequest] = useState('')
  useEffect(() => { if (submittedStyle) setStyleRequest(submittedStyle) }, [submittedStyle])
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
    } catch (err) { if (id === request.current) setError(err.message || 'Could not search locations. Please try again.') }
    finally { if (id === request.current) setBusy(false) }
  }
  function saveDefault() {
    try { localStorage.setItem(DEFAULT_LOCATION_KEY, JSON.stringify(place)); setDefaultPlace(place); setNotice('Default location saved.') }
    catch { setError('Could not save your default location in this browser.') }
  }
  //generate an outfit using the clothes saved in Closet
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
    try { deleted = JSON.parse(localStorage.getItem('wardrobe-deleted-items') || '[]') } catch { deleted = [] }
    //use only uploaded clothing, not the sample suits
    const allItems = [...newClosetItems, ...savedItems].filter(item => !deleted.includes(item.id))
    const pick = category => {
      const choices = allItems.filter(item => item.category === category)
      return choices.length ? choices[Math.floor(Math.random() * choices.length)] : null
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
  const date = weather ? new Date(weather.date+'T12:00:00').toLocaleDateString(undefined, {weekday:'long',month:'long',day:'numeric'}) : ''
  return <section className="outfits-layout">
    <aside className="weather-panel"><p className="weather-label">TODAY’S WEATHER</p>
      <form className="location-form" onSubmit={search}><input id="weather-address" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Street address, city, state" maxLength={250} required/><button className="settings-purple" type="submit" disabled={busy}>{busy ? 'Loading…' : 'Get weather'}</button></form>
      
      
      {defaultPlace && <p className="default-location">Default: {defaultPlace.label}</p>}
      {matches.length > 0 && <div className="location-matches"><p>Choose your location to get weather</p><ul>{matches.map(match=><li key={match.label}><button type="button" onClick={()=>loadWeather(match)}>{match.label}</button></li>)}</ul></div>}
      {error && <p className="location-error" role="alert">{error}</p>}{notice && <p className="location-notice" role="status">{notice}</p>}
      {busy && <p role="status" className="location-hint">Finding your location’s weather…</p>}
      {place && !busy && <div className="active-location">{JSON.stringify(place) !== JSON.stringify(defaultPlace) && <button className="use-default" type="button" onClick={saveDefault}>Save as default</button>}{!weather && <button className="use-default" type="button" onClick={()=>loadWeather(place)}>Retry weather</button>}</div>}
      {weather && <><h1>{date}</h1><div className="weather-sun" aria-hidden="true">{description.icon}</div><p className="weather-temperature">{Math.round(weather.temperature)}<span>°C</span></p><h2>{description.label}</h2><div className="weather-details"><div><span>Feels like</span><strong>{Math.round(weather.feelsLike)}°C</strong></div><div><span>Rain chance today</span><strong>{weather.rain === null ? 'Unavailable' : weather.rain+'%'}</strong></div></div><p className="weather-updated">Local update: {weather.time.replace('T',' ')}</p></>}
      <p className="weather-sources">Weather: <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a> · Places: <a href="https://photon.komoot.io/" target="_blank" rel="noreferrer">Photon</a> / <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap</a></p>
    </aside>
    <section className="outfit-generator">
      {searchTerm.trim() && <p className="outfit-search-note">Searching outfit pieces for: <strong>{searchTerm}</strong></p>}
      <div aria-live="polite" aria-atomic="true">
        {outfitMessage && <p className="closet-upload-status" role="status">{outfitMessage}</p>}
        {suit === null ? <div className="outfit-prompt"><button className="generate-outfit" type="button" onClick={generate}>Generate outfit</button></div> : <section className="generated-suit" key={generation}>
          {appliedStyle && <div className="applied-style"><strong>You style</strong><p>{appliedStyle}</p></div>}
          <div className="closet-item-grid">{generatedItems.map(item => <ClosetItem key={item.id} item={item} isFavorite={favorites.some(saved => saved.id === item.id)} onFavorite={() => toggleFavorite(item)}/>)}</div>
          <div className="generator-button-center generated-button"><button className="generate-outfit" type="button" onClick={generate}>Generate another outfit</button></div>
        </section>}
      </div>
    </section>
  </section>
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

// let the user select a color for the website background
function HomeThemePicker({ accentColor, setAccentColor }) {
  // find the selected color on the slider
  const selected = SLIDER_COLORS.indexOf(accentColor)
  return <div className="home-theme-picker">
    <label htmlFor="home-color-slider">Background color</label>
    <input id="home-color-slider" className="home-color-slider rainbow-slider" type="range" min="0" max={SLIDER_COLORS.length - 1} step="1" value={selected < 0 ? 0 : selected} onChange={event => setAccentColor(SLIDER_COLORS[Number(event.target.value)])} aria-label="Change background color" />
  </div>
}

// display the main website navigation and selected page
function Dashboard({ email, logout }) {
  const [favorites, setFavorites] = useState(readFavorites)
  const [favoriteError, setFavoriteError] = useState('')
  const [accentColor, setAccentColor] = useState('#7046d6')

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

  const [page,setPage]=useState('outfits'); const [menuOpen,setMenuOpen]=useState(false); const [chatOpen,setChatOpen]=useState(false); const [searchTerm,setSearchTerm]=useState(''); const [stylePrompt,setStylePrompt]=useState(''); const [submittedStyle,setSubmittedStyle]=useState(''); const nav=[[MdHome,'Home'],[TfiLayoutColumn2,'Closet'],[BiCloset,'Outfits']]
  const initials=(email || 'Y').slice(0,1).toUpperCase()
  return <main className="app-shell editorial-shell"><header className="app-header editorial-header">
    <div className="editorial-left"><button className="editorial-menu" aria-label="Open menu" aria-expanded={menuOpen} onClick={()=>setMenuOpen(!menuOpen)}>☰</button><div className="header-theme"><HomeThemePicker accentColor={accentColor} setAccentColor={setAccentColor}/></div></div>
    <button className="app-brand editorial-logo" onClick={()=>setPage('outfits')}>WARDROBE</button>
    <div className="editorial-right"><form className="header-search" role="search" onSubmit={event=>{event.preventDefault();setPage('search')}}><button aria-label="Search clothes" type="submit"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="10.8" cy="10.8" r="7.2"/><path d="m16 16 5 5"/></svg></button><input aria-label="Search clothes" placeholder="Search clothes" value={searchTerm} onChange={event=>{setSearchTerm(event.target.value);setPage('search')}}/></form><button className={page==='favourites'?'active':''} onClick={()=>setPage('favourites')} aria-label="Favourites" title="Favourites"><CiHeart size={25} aria-hidden="true"/></button><button className={page==='profile'?'active':''} onClick={()=>setPage('profile')} aria-label="Profile" title="Profile"><CgProfile size={21}/></button></div>
  </header>
  {menuOpen && <div className="editorial-menu-panel"><button onClick={()=>{setPage('introduction');setMenuOpen(false)}}>About us</button><button onClick={()=>{setPage('closet');setMenuOpen(false)}}>Closet</button><button onClick={()=>{setPage('outfits');setMenuOpen(false)}}>Outfits</button></div>}
  {favoriteError && <p className="favorite-status" role="alert">{favoriteError}</p>}
  {page==='profile' ? <Profile email={email} logout={logout} /> : page==='favourites' ? <FavoritesPage favorites={favorites} updateFavorites={updateFavorites}/> : page==='search' ? <SearchResults searchTerm={searchTerm} favorites={favorites} toggleFavorite={toggleFavorite}/> : page==='outfits' ? <OutfitsPage favorites={favorites} toggleFavorite={toggleFavorite} searchTerm={searchTerm} submittedStyle={submittedStyle}/> : page==='closet' ? <Closet favorites={favorites} toggleFavorite={toggleFavorite}/> : page==='introduction' ? <AboutUs /> : page==='home' ? <section className="main-homepage"><div className="home-page-content"><HomeThemePicker accentColor={accentColor} setAccentColor={setAccentColor} /><h1>Wardrobe</h1></div></section> : <section className="dashboard"><div className="dash-heading"><div><p className="date">TUESDAY, APRIL 16</p><h1>Good morning, {email?.split('@')[0] || 'there'} <span>✦</span></h1><p className="sub">Your wardrobe is ready when you are.</p></div><button className="add-btn"><Icon name="plus" size={18}/> Add to closet</button></div><div className="insight-card"><div className="insight-mark"><Icon name="spark" size={23}/></div><div><span>YOUR DAILY EDIT</span><h3>Sunny skies call for something effortless.</h3><p>We picked a few looks that feel like you.</p></div><button className="view-edit">View today’s edit <Icon name="arrow" size={17}/></button></div><div className="content-grid"><section><div className="section-title"><h2>{page==='favourites'?'Your favourites':'Outfits for today'}</h2><button>View all <Icon name="chevron" size={16}/></button></div><div className="outfits"><Outfit type="city" title="City soft tailoring" tag="WORK · 18°C"/><Outfit type="cream" title="A little bit golden" tag="LUNCH · 20°C"/><Outfit type="black" title="After-dark ease" tag="DINNER · 16°C"/></div></section><aside className="closet-summary"><div className="summary-top"><div><p>YOUR CLOSET</p><h3>48 pieces</h3></div><button><Icon name="arrow" size={17}/></button></div><div className="closet-bars"><i></i><i></i><i></i><i></i><i></i></div><div className="summary-bottom"><span><b>12</b> New this season</span><span><b>8</b> Never worn</span></div></aside></div></section>}
  <div className="style-chat"><button className="chat-launch" title="Type the style you want" aria-label="Type the style you want" onClick={()=>setChatOpen(!chatOpen)}><BsChatText size={25}/></button><span className="chat-tooltip">Type the style you want</span>{chatOpen && <form className="chat-popover" onSubmit={event=>{event.preventDefault();setSubmittedStyle(stylePrompt.trim());setPage('outfits');setChatOpen(false)}}><div className="chat-popover-title"><strong>What kind of style would you like?</strong><button type="button" aria-label="Close" onClick={()=>setChatOpen(false)}>×</button></div><textarea id="chat-style" value={stylePrompt} onChange={event=>setStylePrompt(event.target.value)} maxLength={500} placeholder="e.g. Generate a warm autumn outfit." required/><button className="generate-outfit" type="submit">Apply style</button></form>}</div>
 </main>
}

// show the account settings and sign out option
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

// handle the sign up and log in forms
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

// control the current page and keep track of the logged in user
function App(){useEffect(()=>{document.documentElement.dataset.theme=localStorage.getItem('wardrobe-theme')||'light'},[]);const [view,setView]=useState(()=>localStorage.getItem('myapp-email')?'app':'landing');const [email,setEmail]=useState(()=>localStorage.getItem('myapp-email')||'');const [slideFromStart,setSlideFromStart]=useState(false);const openIntroduction=()=>{setSlideFromStart(true);setView('login')};const login=e=>{localStorage.setItem('myapp-email',e);setEmail(e);setView('app')};const logout=()=>{localStorage.removeItem('myapp-email');setEmail('');setView('signin')};return view==='landing'?<Landing goLogin={openIntroduction}/>:view==='login'?<div className={slideFromStart?'start-slide-up':''}><Login goHome={()=>{setSlideFromStart(false);setView('landing')}} onLogin={login} goSignup={()=>{setSlideFromStart(false);setView('signup')}} goSignin={()=>{setSlideFromStart(false);setView('signin')}}/></div>:view==='signup'||view==='signin'?<AccountPage key={view} mode={view} onComplete={login} changeMode={setView} onClose={()=>setView('landing')}/>:<Dashboard email={email} logout={logout}/>}
export default App