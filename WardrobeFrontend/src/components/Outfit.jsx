import Icon from './Icon'

// display one outfit card with its name and favorite button
const Outfit = ({ type, title, tag }) => (
  <div className="outfit-card">
    <div className={'outfit-image ' + type}>
      <div className="mini-item"></div>
    </div>

    <div className="outfit-info">
      <div>
        <h4>{title}</h4>
        <span>{tag}</span>
      </div>

      <button>
        <Icon name="heart" size={17} />
      </button>
    </div>
  </div>
)

export default Outfit