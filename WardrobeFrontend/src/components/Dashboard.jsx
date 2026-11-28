
import React, { useState, useEffect } from 'react'
import { CgProfile } from 'react-icons/cg'
import { CiHeart } from 'react-icons/ci'
import { BsChatText } from 'react-icons/bs'

import Icon from './Icon'
import Outfit from './Outfit'
import HomeThemePicker from './HomeThemePicker'
import AboutUs from './AboutUs'
import SearchResults from './SearchResults'
import FavoritesPage from './FavoritesPage'
import Profile from './Profile'
import HomePage from './HomePage'
import OutfitsPage from './OutfitsPage'

// display the main website navigation and selected page
function Dashboard({
  email,
  logout,
  readFavorites,
  hexToRgba,
  sliderColors,
  uploadedClosetStore,
  Closet,
  newClosetItems
}) {
  const [favorites, setFavorites] = useState(readFavorites)
  const [favoriteError, setFavoriteError] = useState('')
  const [accentColor, setAccentColor] = useState('#7046d6')

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor)
    document.documentElement.style.setProperty('--accent-soft', hexToRgba(accentColor, 0.19))
    document.documentElement.style.setProperty('--accent-strong', hexToRgba(accentColor, 0.58))
    localStorage.setItem('wardrobe-accent-color', accentColor)
  }, [accentColor, hexToRgba])

  function updateFavorites(next) {
    try {
      localStorage.setItem('wardrobe-favorites', JSON.stringify(next))
      setFavorites(next)
      setFavoriteError('')
      return true
    } catch {
      setFavoriteError('Favourites could not be saved in this browser.')
      return false
    }
  }

  function toggleFavorite(item) {
    updateFavorites(
      favorites.some(saved => saved.id === item.id)
        ? favorites.filter(saved => saved.id !== item.id)
        : [...favorites, { ...item }]
    )
  }

  const [page, setPage] = useState('outfits')
  const [menuOpen, setMenuOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [stylePrompt, setStylePrompt] = useState('')
  const [submittedStyle, setSubmittedStyle] = useState('')

  return (
    <main className="app-shell editorial-shell">
      <header className="app-header editorial-header">
        <div className="editorial-left">
          <button
            className="editorial-menu"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
          <div className="header-theme">
            <HomeThemePicker
              accentColor={accentColor}
              setAccentColor={setAccentColor}
              sliderColors={sliderColors}
            />
          </div>
        </div>

        <button
          className="app-brand editorial-logo"
          onClick={() => setPage('outfits')}
        >
          WARDROBE
        </button>

        <div className="editorial-right">
          <form
            className="header-search"
            role="search"
            onSubmit={event => {
              event.preventDefault()
              setPage('search')
            }}
          >
            <button aria-label="Search clothes" type="submit">
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <circle cx="10.8" cy="10.8" r="7.2" />
                <path d="m16 16 5 5" />
              </svg>
            </button>

            <input
              aria-label="Search clothes"
              placeholder="Search clothes"
              value={searchTerm}
              onChange={event => {
                setSearchTerm(event.target.value)
                setPage('search')
              }}
            />
          </form>

          <button
            className={page === 'favourites' ? 'active' : ''}
            onClick={() => setPage('favourites')}
            aria-label="Favourites"
            title="Favourites"
          >
            <CiHeart size={25} aria-hidden="true" />
          </button>

          <button
            className={page === 'profile' ? 'active' : ''}
            onClick={() => setPage('profile')}
            aria-label="Profile"
            title="Profile"
          >
            <CgProfile size={21} />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="editorial-menu-panel">
          <button onClick={() => { setPage('introduction'); setMenuOpen(false) }}>About us</button>
          <button onClick={() => { setPage('closet'); setMenuOpen(false) }}>Closet</button>
          <button onClick={() => { setPage('outfits'); setMenuOpen(false) }}>Outfits</button>
        </div>
      )}

      {favoriteError && (
        <p className="favorite-status" role="alert">
          {favoriteError}
        </p>
      )}

      {page === 'profile' ? (
        <Profile email={email} logout={logout} />
      ) : page === 'favourites' ? (
        <FavoritesPage favorites={favorites} updateFavorites={updateFavorites} />
      ) : page === 'search' ? (
        <SearchResults
          searchTerm={searchTerm}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          uploadedClosetStore={uploadedClosetStore}
        />
      ) : page === 'outfits' ? (
        <OutfitsPage
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          searchTerm={searchTerm}
          submittedStyle={submittedStyle}
          newClosetItems={newClosetItems}
          uploadedClosetStore={uploadedClosetStore}
        />
      ) : page === 'closet' ? (
        <Closet favorites={favorites} toggleFavorite={toggleFavorite} />
      ) : page === 'introduction' ? (
        <AboutUs />
      ) : page === 'home' ? (
        <HomePage
          accentColor={accentColor}
          setAccentColor={setAccentColor}
          sliderColors={sliderColors}
        />
      ) : (
        <section className="dashboard">
          <div className="dash-heading">
            <div>
              <p className="date">TUESDAY, APRIL 16</p>
              <h1>
                Good morning, {email?.split('@')[0] || 'there'} <span>✦</span>
              </h1>
              <p className="sub">Your wardrobe is ready when you are.</p>
            </div>
            <button className="add-btn">
              <Icon name="plus" size={18} /> Add to closet
            </button>
          </div>

          <div className="insight-card">
            <div className="insight-mark">
              <Icon name="spark" size={23} />
            </div>
            <div>
              <span>YOUR DAILY EDIT</span>
              <h3>Sunny skies call for something effortless.</h3>
              <p>We picked a few looks that feel like you.</p>
            </div>
            <button className="view-edit">
              View today’s edit <Icon name="arrow" size={17} />
            </button>
          </div>

          <div className="content-grid">
            <section>
              <div className="section-title">
                <h2>{page === 'favourites' ? 'Your favourites' : 'Outfits for today'}</h2>
                <button>
                  View all <Icon name="chevron" size={16} />
                </button>
              </div>
              <div className="outfits">
                <Outfit type="city" title="City soft tailoring" tag="WORK · 18°C" />
                <Outfit type="cream" title="A little bit golden" tag="LUNCH · 20°C" />
                <Outfit type="black" title="After-dark ease" tag="DINNER · 16°C" />
              </div>
            </section>

            <aside className="closet-summary">
              <div className="summary-top">
                <div>
                  <p>YOUR CLOSET</p>
                  <h3>48 pieces</h3>
                </div>
                <button>
                  <Icon name="arrow" size={17} />
                </button>
              </div>
              <div className="closet-bars">
                <i></i><i></i><i></i><i></i><i></i>
              </div>
              <div className="summary-bottom">
                <span><b>12</b> New this season</span>
                <span><b>8</b> Never worn</span>
              </div>
            </aside>
          </div>
        </section>
      )}

      <div className="style-chat">
        <button
          className="chat-launch"
          title="Type the style you want"
          aria-label="Type the style you want"
          onClick={() => setChatOpen(!chatOpen)}
        >
          <BsChatText size={25} />
        </button>
        <span className="chat-tooltip">Type the style you want</span>

        {chatOpen && (
          <form
            className="chat-popover"
            onSubmit={event => {
              event.preventDefault()
              setSubmittedStyle(stylePrompt.trim())
              setPage('outfits')
              setChatOpen(false)
            }}
          >
            <div className="chat-popover-title">
              <strong>What kind of style would you like?</strong>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setChatOpen(false)}
              >
                ×
              </button>
            </div>
            <textarea
              id="chat-style"
              value={stylePrompt}
              onChange={event => setStylePrompt(event.target.value)}
              maxLength={500}
              placeholder="e.g. Generate a warm autumn outfit."
              required
            />
            <button className="generate-outfit" type="submit">
              Apply style
            </button>
          </form>
        )}
      </div>
    </main>
  )
}

export default Dashboard
