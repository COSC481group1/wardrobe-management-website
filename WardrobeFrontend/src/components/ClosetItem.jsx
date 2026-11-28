import { useState, useEffect } from 'react'
import { callApi } from '../api/auth'
import Icon from './Icon'

// display a clothing item with favorite and delete buttons
function ClosetItem({ item, onDelete, onFavorite, isFavorite, onEdit }) {
  const [imageSrc, setImageSrc] = useState(
    item.source || (item.image ? `/closet/${item.image}` : "")
  )

  useEffect(() => {
    // Uploaded browser images don't need an API request.
    if (item.source) {
      setImageSrc(item.source)
      return
    }

    // Legacy local images can still load normally.
    if (!item.filename) {
      setImageSrc(item.image ? `/closet/${item.image}` : "")
      return
    }

    let cancelled = false
    let objectUrl = null

    async function loadImage() {
      try {
        const blob = await callApi(
          'GET',
          `/ClothingImages/${encodeURIComponent(item.filename)}`,
          { responseType: 'blob' }
        )
        objectUrl = URL.createObjectURL(blob)

        if (!cancelled) {
          setImageSrc(objectUrl)
        }
      } catch (error) {
        console.error(`Failed to load image for ${item.name}:`, error)

        if (!cancelled) {
          setImageSrc(item.image ? `/closet/${item.image}` : "")
        }
      }
    }

    loadImage()

    return () => {
      cancelled = true

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [item.filename, item.source, item.image, item.name])

  return (
    <article className="closet-item">
      <div className="closet-item-image">
        {imageSrc && (
          <img
            src={imageSrc}
            alt={item.name}
          />
        )}
      </div>

      <div className="closet-item-info">
        <p>{item.category}</p>

        <h3>{item.name}</h3>

        {item.description && (
          <p className="closet-item-description">
            {item.description}
          </p>
        )}

        {item.palette && (
          <p className="closet-item-palette">
            {item.palette}
          </p>
        )}

        <div className="item-action-row">
          {onEdit && (
            <button
              className="closet-delete"
              type="button"
              onClick={onEdit}
            >
              Edit name
            </button>
          )}

          {onFavorite && (
            <button
              className={'item-favorite ' + (isFavorite ? 'saved' : '')}
              type="button"
              aria-label={`${isFavorite ? 'Remove' : 'Save'} ${item.name} ${isFavorite ? 'from' : 'to'} favourites`}
              aria-pressed={!!isFavorite}
              onClick={onFavorite}
            >
              <Icon name="heart" size={21} />
            </button>
          )}

          {onDelete && (
            <button
              className="closet-delete"
              type="button"
              aria-label={`Delete ${item.name}`}
              onClick={onDelete}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export default ClosetItem