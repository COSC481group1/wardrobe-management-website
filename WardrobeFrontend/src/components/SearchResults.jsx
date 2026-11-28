import { useState, useEffect } from 'react'
import ClosetItem from './ClosetItem'
import { getArticles } from '../api/wardrobe'

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

// Search database and locally uploaded clothing by name or category
function SearchResults({
  searchTerm,
  favorites,
  toggleFavorite,
  uploadedClosetStore
}) {
  const [articles, setArticles] = useState([])
  const [uploaded, setUploaded] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    // Load database clothing
    getArticles()
      .then(data => {
        console.log('Search database response:', data)

        if (active) {
          setArticles(data.map(mapArticle))
        }
      })
      .catch(error => {
        console.error('Failed to load search clothing:', error)

        if (active) {
          setError('Could not load clothing from the database.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    // Load locally uploaded clothing
    uploadedClosetStore('read')
      .then(items => {
        if (active) setUploaded(items)
      })
      .catch(error => {
        console.error('Failed to load uploaded clothing:', error)

        if (active) {
          setError('Could not load saved clothes.')
        }
      })

    return () => {
      active = false
    }
  }, [uploadedClosetStore])

  // Retrieve locally deleted item IDs
  let deleted = []

  try {
    deleted = JSON.parse(
      localStorage.getItem('wardrobe-deleted-items') || '[]'
    )
  } catch {
    deleted = []
  }

  // Search by clothing name or category
  const term = (searchTerm || '').trim().toLowerCase()

  const results = [...articles, ...uploaded]
    .filter(item => !deleted.includes(item.id))
    .filter(item =>
      term &&
      [item.name, item.category].some(value =>
        String(value || '').toLowerCase().includes(term)
      )
    )

  return (
    <section
      className="wardrobe-search-results"
      aria-label="Clothing search results"
    >
      <h1>Search results</h1>

      {term ? (
        <p>
          {results.length} {results.length === 1 ? 'item' : 'items'} found for{' '}
          <strong>{searchTerm.trim()}</strong>
        </p>
      ) : (
        <p>Type a clothing name or category to search your closet.</p>
      )}

      {loading && <p>Loading your clothing...</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && results.length > 0 && (
        <div className="closet-item-grid">
          {results.map(item => (
            <ClosetItem
              key={item.id}
              item={item}
              isFavorite={favorites.some(saved => saved.id === item.id)}
              onFavorite={() => toggleFavorite(item)}
            />
          ))}
        </div>
      )}

      {!loading && term && !results.length && !error && (
        <div className="closet-empty">
          <h2>No matching items</h2>
          <p>Try another clothing name or category.</p>
        </div>
      )}
    </section>
  )
}

export default SearchResults