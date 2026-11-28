import HomeThemePicker from './HomeThemePicker'

function HomePage({ accentColor, setAccentColor, sliderColors }) {
  return (
    <section className="main-homepage">
      <div className="home-page-content">
        <HomeThemePicker
          accentColor={accentColor}
          setAccentColor={setAccentColor}
          sliderColors={sliderColors}
        />
        <h1>Wardrobe</h1>
      </div>
    </section>
  )
}

export default HomePage
