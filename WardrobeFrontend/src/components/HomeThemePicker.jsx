// let the user select a color for the website background
function HomeThemePicker({ accentColor, setAccentColor, sliderColors }) {
  // find the selected color on the slider
  const selected = sliderColors.indexOf(accentColor)

  return (
    <div className="home-theme-picker">
      <label htmlFor="home-color-slider">Background color</label>

      <input
        id="home-color-slider"
        className="home-color-slider rainbow-slider"
        type="range"
        min="0"
        max={sliderColors.length - 1}
        step="1"
        value={selected < 0 ? 0 : selected}
        onChange={event =>
          setAccentColor(sliderColors[Number(event.target.value)])
        }
        aria-label="Change background color"
      />
    </div>
  )
}

export default HomeThemePicker