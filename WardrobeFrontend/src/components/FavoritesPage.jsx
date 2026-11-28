import { useState } from 'react'

// Show the clothing items that the user saved as favorites
function FavoritesPage({ favorites, updateFavorites }) {
  const [editing, setEditing] = useState(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Top')
  const [error, setError] = useState('')

  function save(event) {
    event.preventDefault()
    if (!name.trim()) {
      setError('Enter an item name.')
      return
    }

    if (
      updateFavorites(
        favorites.map(item =>
          item.id === editing
            ? { ...item, name: name.trim(), category }
            : item
        )
      )
    ) {
      setEditing(null)
    } else {
      setError('Changes could not be saved in this browser.')
    }
  }

  return (
    <section className="favorites-page">
      <h1>Your favourites</h1>

      {favorites.length ? (
        <div className="closet-item-grid">
          {favorites.map(item => (
            <article className="closet-item" key={item.id}>
              <div className="closet-item-image">
                <img
                  src={item.source || '/closet/' + item.image}
                  alt={item.name}
                />
              </div>

              <div className="closet-item-info">
                {editing === item.id ? (
                  <form className="favorite-edit" onSubmit={save}>
                    <label htmlFor={'favorite-name-' + item.id}>Name</label>

                    <input
                      id={'favorite-name-' + item.id}
                      value={name}
                      required
                      maxLength={100}
                      onChange={event => setName(event.target.value)}
                    />

                    <label htmlFor={'favorite-category-' + item.id}>
                      Category
                    </label>

                    <select
                      id={'favorite-category-' + item.id}
                      value={category}
                      onChange={event => setCategory(event.target.value)}
                    >
                      {['Top', 'Bottom', 'Shoes', 'Accessories'].map(label => (
                        <option key={label}>{label}</option>
                      ))}
                    </select>

                    {error && <p role="alert">{error}</p>}

                    <div className="favorite-actions">
                      <button className="favorite-save" type="submit">
                        Save
                      </button>

                      <button type="button" onClick={() => setEditing(null)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <p>{item.category}</p>
                    <h3>{item.name}</h3>

                    <div className="favorite-actions">
                      <button
                        className="favorite-edit-button"
                        type="button"
                        aria-label={`Edit ${item.name}`}
                        onClick={() => {
                          setEditing(item.id)
                          setName(item.name)
                          setCategory(item.category)
                          setError('')
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="closet-delete"
                        type="button"
                        aria-label={`Remove ${item.name} from favourites`}
                        onClick={() =>
                          updateFavorites(
                            favorites.filter(saved => saved.id !== item.id)
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="closet-empty">
          <h2>No favourites yet</h2>
        </div>
      )}
    </section>
  )
}

export default FavoritesPage
