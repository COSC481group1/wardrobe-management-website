import './App.css'
import { useState, useRef, useEffect } from 'react'
import { CgProfile } from 'react-icons/cg'
import { CiEdit } from 'react-icons/ci'
import { CiSearch } from 'react-icons/ci'
import { AiOutlineHeart } from 'react-icons/ai'
import { FaTshirt } from 'react-icons/fa'
import top1 from './assets/ImageTop1.avif'
import bot1 from './assets/ImageBot2.jpg'
import acs1 from './assets/ImgaeAcs1.avif'

function Header({ activeIndex, onNavClick, onSearch }) {
  const [showSearch, setShowSearch] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const searchInputRef = useRef(null)

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showSearch])

  const handleSearchClick = () => {
    setShowSearch(!showSearch)
  }

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchInput.trim()) {
      onSearch(searchInput)
      setSearchInput('')
      setShowSearch(false)
    }
  }

  const navItems = [
    { name: 'HOME', index: 0 },
    { name: 'CLOSET', index: 1 },
    { name: 'OUTFITS', index: 2 }
  ]

  return (
    <header className="header">
      <div className="header-container">
        <nav className="header-nav">
          {navItems.map((item) => (
            <a 
              key={item.index}
              href="#"
              onClick={(e) => {
                e.preventDefault()
                onNavClick(item.index)
              }}
              className={activeIndex === item.index ? 'active' : ''}
            >
              {item.name}
            </a>
          ))}
        </nav>
        <div className="wardrobe-title">WARDROBE</div>
        <div className="header-right">
          {showSearch && (
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Search..." 
              className="search-input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchSubmit}
            />
          )}
          <button className="icon-btn" onClick={handleSearchClick}>
            <CiSearch size={24} />
          </button>
          <button 
            className="icon-btn"
            onClick={(e) => {
              e.preventDefault()
              onNavClick(3)
            }}
          >
            <AiOutlineHeart size={24} />
          </button>
          <button 
            className="profile-btn"
            onClick={(e) => {
              e.preventDefault()
              onNavClick(4)
            }}
          >
            <CgProfile size={24} />
          </button>
        </div>
      </div>
    </header>
  )
}

function App() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showOutfitModal, setShowOutfitModal] = useState(false)
  const [generatedOutfit, setGeneratedOutfit] = useState({
    top: { name: 'Top 1', image: top1 },
    bottom: { name: 'Bot 1', image: bot1 },
    accessory: { name: 'Acs 1', image: acs1 }
  })
  const [favorites, setFavorites] = useState([
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
    { id: 4, name: 'Item 4' },
    { id: 5, name: 'Item 5' },
    { id: 6, name: 'Item 6' },
    { id: 7, name: 'Item 7' },
    { id: 8, name: 'Item 8' }
  ])

  const contentMap = {
    0: {
      title: 'About',
      content: 'Welcome to your wardrobe management system'
    },
    1: {
      title: 'Closet',
      content: ''
    },
    2: {
      title: 'Outfits',
      content: ''
    },
    3: {
      title: 'Favorite',
      content: ''
    },
    4: {
      title: '',
      content: ''
    }
  }

  const removeFavorite = (id) => {
    setFavorites(favorites.filter(item => item.id !== id))
  }

  const handleNavClick = (index) => {
    setActiveIndex(index)
    if (index === 4 && !isLoggedIn) {
      setShowAuthModal(true)
    }
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    console.log('Search for:', query)
  }

  const renderProfilePage = () => {
    if (!isLoggedIn && showAuthModal) {
      return (
        <div className="auth-overlay">
          <div className="auth-modal">
            <button
              className="auth-close"
              onClick={() => {
                setShowAuthModal(false)
                setActiveIndex(0)
              }}
              aria-label="Close login window"
            >
              ×
            </button>
            <div className="auth-visual">
              <FaTshirt className="auth-illustration" />
            </div>
            <div className="auth-form-panel">
              <h2 className="auth-title">Login</h2>
              <label className="auth-label">Email</label>
              <input type="email" className="auth-input" placeholder="your@email.com" />
              <div className="auth-actions">
                <button className="auth-btn auth-btn-primary">Register</button>
                <button
                  className="auth-btn auth-btn-secondary"
                  onClick={() => {
                    setIsLoggedIn(true)
                    setShowAuthModal(false)
                  }}
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="settings-container">
        <div className="profile-section">
          <div className="profile-icon"><CgProfile /></div>
          <p className="profile-email">user@example.com</p>
          <button className="edit-profile-btn">
            <CiEdit size={18} />
            <span>Edit Profile</span>
          </button>
        </div>
        <div className="settings-panel">
          <div className="settings-item">
            <span className="dot">•</span>
            <div className="settings-title">Login & Security</div>
            <div className="settings-description">Manage your login and security settings</div>
          </div>
        </div>
        <div className="settings-panel">
          <div className="settings-item">
            <span className="dot">•</span>
            <div className="settings-title">Theme</div>
            <div className="settings-description">Choose a theme</div>
          </div>
        </div>
        <div className="settings-panel">
          <div className="settings-item">
            <span className="dot">•</span>
            <div className="settings-title">History</div>
            <div className="settings-description">View outfits you have looked at</div>
          </div>
        </div>
      </div>
    )
  }

  const handleGenerateOutfit = () => {
    setGeneratedOutfit({
      top: { name: 'Top 1', image: top1 },
      bottom: { name: 'Bot 1', image: bot1 },
      accessory: { name: 'Acs 1', image: acs1 }
    })
    setShowOutfitModal(true)
  }

  const renderOutfitModal = () => {
    if (!showOutfitModal) return null

    return (
      <div className="outfit-modal-overlay" onClick={() => setShowOutfitModal(false)}>
        <div className="outfit-modal" onClick={(e) => e.stopPropagation()}>
          <button className="outfit-close" onClick={() => setShowOutfitModal(false)} aria-label="Close outfit window">×</button>
          <h2 className="outfit-modal-title">Your Outfit</h2>
          <div className="outfit-modal-list">
            <div className="outfit-modal-item">
              <img src={generatedOutfit.top.image} alt={generatedOutfit.top.name} className="outfit-modal-image" />
            </div>
            <div className="outfit-modal-item">
              <img src={generatedOutfit.bottom.image} alt={generatedOutfit.bottom.name} className="outfit-modal-image" />
            </div>
            <div className="outfit-modal-item">
              <img src={generatedOutfit.accessory.image} alt={generatedOutfit.accessory.name} className="outfit-modal-image" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentContent = contentMap[activeIndex]
  return (
    <div className="App">
      <Header activeIndex={activeIndex} onNavClick={handleNavClick} onSearch={handleSearch} />
      <div className="main-content">
          <h1>{currentContent.title}</h1>
          {activeIndex === 2 ? (
            <div className="outfits-page">
              <div className="weather-panel">
                <div className="weather-icon">☀️</div>
                <div className="weather-info">
                  <p className="weather-temp">72°F</p>
                  <p className="weather-condition">Sunny</p>
                </div>
              </div>
              <div className="outfits-content generate-button-column">
                <button className="generate-btn generate-btn-large" onClick={handleGenerateOutfit}>Generate</button>
              </div>
            </div>
          ) : activeIndex === 3 ? (
            <div className="favourite-container">
              {favorites.map(item => (
                <div key={item.id} className="favourite-panel">
                  <div className="favourite-footer">
                    <p className="favourite-name">{item.name}</p>
                    <button 
                      className="edit-btn"
                      onClick={() => {}}
                    >
                      <CiEdit />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : activeIndex === 4 ? (
            renderProfilePage()
          ) : (
            <p>{currentContent.content}</p>
          )}
        </div>
        {renderOutfitModal()}
    </div>
  )
}

export default App