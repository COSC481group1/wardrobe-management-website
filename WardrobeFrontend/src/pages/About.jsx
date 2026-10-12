import { APP_NAME } from "../components/AuthLayout";
import "../styles/wardrobe-auth.css";

const STEPS = [
  {
    title: "Add what you own",
    text: "Save each piece with its category, type, colors, and a short description.",
  },
  {
    title: "Browse your closet",
    text: "See everything in one place and edit or remove items as your wardrobe changes.",
  },
  {
    title: "Get outfit ideas",
    text: "Receive suggestions based on what you own, the current season, and your style.",
  },
];

// Alphabetical by last name, as on the project slides.
const TEAM = [
  "Kyra Albaugh",
  "Khadijah Bashir",
  "Xintong Jiang",
  "Justin Miles",
  "Lucas Prawdzik",
  "Joel Schueerholz",
];

// Called by App.jsx with onGoToSignUp / onGoToLogin to switch tabs.
export default function About({ onGoToSignUp, onGoToLogin }) {
  return (
    <main className="about-page">
      <header className="about-hero">
        <h1>{APP_NAME} is a tool to help you style outfits with clothing you already own.</h1>
        <p>
          Keep a digital inventory of your wardrobe and get outfit recommendations that fit
          the season and your style.
        </p>
        <div className="about-actions">
          <button type="button" className="btn-primary" onClick={onGoToSignUp}>
            Create an account
          </button>
          <button type="button" className="btn-secondary" onClick={onGoToLogin}>
            Log in
          </button>
        </div>
      </header>

      <section className="about-section" aria-labelledby="how-heading">
        <h2 id="how-heading">How it works</h2>
        <ol className="about-steps">
          {STEPS.map((step) => (
            <li key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="about-section" aria-labelledby="team-heading">
        <h2 id="team-heading">Built by Group 1 - COSC482W/581</h2>
        <ul className="about-team">
          {TEAM.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
