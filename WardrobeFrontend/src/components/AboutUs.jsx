// show the introduction content on the About Us page
function AboutUs() {
  const steps = [
    ['1', 'Add what you own', 'Save each piece with its category, type, colors, and a short description.'],
    ['2', 'Browse your closet', 'See everything in one place and edit or remove items as your wardrobe changes.'],
    ['3', 'Get outfit ideas', 'Receive suggestions based on what you own, the current season, and your style.']
  ]

  const names = [
    'Kyra Albaugh',
    'Khadijah Bashir',
    'Xintong Jiang',
    'Justin Miles',
    'Lucas Prawdzik',
    'Joel Schueerholz'
  ]

  return (
    <main className="intro-page about-us-page">
      <section className="intro-content">
        <h1>
          Wardrobe is a tool to help
          <br />
          you style outfits with
          <br />
          clothing you already own
        </h1>

        <p className="intro-lede">
          Keep a digital inventory of your wardrobe and get outfit recommendations that
          <br />
          fit the season and your style.
        </p>

        <section className="how-it-works">
          <h2>How it works</h2>

          {steps.map(([number, title, description]) => (
            <article className="how-step" key={number}>
              <span>{number}</span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </section>

        <footer className="group-info">
          <p>Built by Group 1 - COSC482W/581</p>

          <div className="name-list">
            {names.map(name => (
              <span key={name}>{name}</span>
            ))}
          </div>
        </footer>
      </section>
    </main>
  )
}

export default AboutUs
