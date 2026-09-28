import './App.css'
import { useState, useRef, useEffect } from 'react'

function App() {
  const [activeIndex, setActiveIndex] = useState(0)
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
  const sidebarRef = useRef(null)

  const menuItems = [
    { name: 'Homepage', href: '#homepage' },
    { name: 'Closet', href: '#closet' },
    { name: 'Outfits', href: '#outfits' },
    { name: 'Favourite', href: '#favourite' },
    { name: 'Settings', href: '#settings' }
  ]

  const contentMap = {
    0: {
      title: 'Homepage',
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
      title: 'Favourite',
      content: ''
    },
    4: {
      title: 'Settings',
      content: ''
    }
  }
    // Update URL hash when activeIndex changes
  useEffect(() => {
    window.location.hash = menuItems[activeIndex].href.substring(1)
  }, [activeIndex, menuItems])

  // Listen for hash changes from browser back/forward
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1) || 'homepage'
      const index = menuItems.findIndex(item => item.href === `#${hash}`)
      if (index !== -1) {
        setActiveIndex(index)
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [menuItems])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!sidebarRef.current) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((prev) => (prev + 1) % menuItems.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((prev) => (prev - 1 + menuItems.length) % menuItems.length)
      }
    }

    const sidebar = sidebarRef.current
    if (sidebar) {
      sidebar.addEventListener('keydown', handleKeyDown)
      return () => sidebar.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuItems.length])

  const handleSidebarClick = () => {
    if (sidebarRef.current) {
      sidebarRef.current.focus()
    }
  }

  const handleLinkClick = (index, e) => {
    e.preventDefault()
    setActiveIndex(index)
    if (sidebarRef.current) {
      sidebarRef.current.focus()
    }
  }

  const removeFavorite = (id) => {
    setFavorites(favorites.filter(item => item.id !== id))
  }

  const currentContent = contentMap[activeIndex]
  return (
    <div className="App">
        <div 
          className="sidebar" 
          ref={sidebarRef}
          onClick={handleSidebarClick}
          tabIndex={0}
        >
          <nav>
            <ul>
              {menuItems.map((item, index) => (
                <li key={index}>
                  <a 
                    href={item.href}
                    onClick={(e) => handleLinkClick(index, e)}
                    className={activeIndex === index ? 'active' : ''}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
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
              <div className="outfits-content">
                {/* Outfits content will go here */}
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
                      ✏️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : activeIndex === 4 ? (
            <div className="settings-container">
              <div className="profile-section">
                <div className="profile-icon">👤</div>
                <p className="profile-email">user@example.com</p>
              </div>
              <div className="settings-panel">
                <div className="settings-item">
                  <span className="dot">•</span>
                  <div className="settings-title">Passwords</div>
                  <div className="settings-description">Change my passwords</div>
                </div>
              </div>
              <div className="settings-panel">
                <div className="settings-item">
                  <span className="dot">•</span>
                  <div className="settings-title">Theme</div>
                  <div className="settings-description">Choose a theme</div>
                </div>
              </div>
            </div>
          ) : (
            <p>{currentContent.content}</p>
          )}
        </div>
      </div>
  )
}

export default App
