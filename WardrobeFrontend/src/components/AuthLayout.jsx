import "../styles/wardrobe-auth.css";

// Change this once the team picks a name.
export const APP_NAME = "Wardrobe";

// No react-router-dom here -- Justin's App.jsx drives navigation itself
// (hash + activeIndex), so this just calls back up to whatever App.jsx
// passes in as onAboutClick.
export default function AuthLayout({ title, subtitle, children, footer, onAboutClick }) {
  return (
    <main className="auth-page">
      <div className="auth-columns">
        <aside className="auth-panel" aria-hidden="true">
          <div className="garment-tag">
            <span className="garment-tag-name">{APP_NAME}</span>
            <span className="garment-tag-line">Everything you own, in one place.</span>
          </div>
        </aside>

        <section className="auth-main">
          <button type="button" className="auth-about-link" onClick={onAboutClick}>
            About {APP_NAME}
          </button>
          <div className="auth-card">
            <h1>{title}</h1>
            {subtitle && <p className="auth-subtitle">{subtitle}</p>}
            {children}
            {footer && <p className="auth-footer">{footer}</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
