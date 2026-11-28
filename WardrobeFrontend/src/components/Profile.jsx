import { useState } from 'react'
import { CgProfile } from 'react-icons/cg'
import { MdOutlineEmail } from 'react-icons/md'
import Icon from './Icon'

// Show account settings and sign-out options
function Profile({ email, logout }) {
  const [username, setUsername] = useState(() =>
    localStorage.getItem('wardrobe-username') ||
    (email ? email.split('@')[0] : 'Guest')
  )
  const [editingUsername, setEditingUsername] = useState(false)
  const [usernameDraft, setUsernameDraft] = useState(username)
  const [usernameStatus, setUsernameStatus] = useState('')

  function saveUsername(event) {
    event.preventDefault()
    const value = usernameDraft.trim()

    if (!value) {
      setUsernameStatus('Enter a username.')
      return
    }

    try {
      localStorage.setItem('wardrobe-username', value)
      setUsername(value)
      setEditingUsername(false)
      setUsernameStatus('')
    } catch {
      setUsernameStatus('Username could not be saved in this browser.')
    }
  }

  const [theme, setTheme] = useState(() =>
    localStorage.getItem('wardrobe-theme') || 'light'
  )
  const [openPassword, setOpenPassword] = useState(false)
  const [openTheme, setOpenTheme] = useState(false)
  const [message, setMessage] = useState('')

  function changeTheme(value) {
    setTheme(value)
    document.documentElement.dataset.theme = value

    try {
      localStorage.setItem('wardrobe-theme', value)
    } catch {}
  }

  return (
    <section className="settings-page">
      <section className="settings-account">
        <CgProfile size={54} aria-hidden="true" />
        <h2>{username}</h2>

        {editingUsername ? (
          <form className="username-form" onSubmit={saveUsername}>
            <label htmlFor="settings-username">Username</label>
            <input
              id="settings-username"
              value={usernameDraft}
              onChange={event => setUsernameDraft(event.target.value)}
              required
              maxLength={50}
              autoComplete="username"
            />

            <div className="favorite-actions">
              <button className="settings-purple" type="submit">
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingUsername(false)
                  setUsernameStatus('')
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            className="username-edit"
            type="button"
            onClick={() => {
              setUsernameDraft(username)
              setEditingUsername(true)
              setUsernameStatus('')
            }}
          >
            Edit username
          </button>
        )}

        {usernameStatus && (
          <p role="status" className="settings-help">
            {usernameStatus}
          </p>
        )}

        <dl>
          <div>
            <dt>
              <MdOutlineEmail size={20} aria-hidden="true" />
              <span>Email</span>
            </dt>
            <dd>{email || 'Not signed in'}</dd>
          </div>
        </dl>
      </section>

      <section className="settings-section settings-combined">
        <div className="settings-option">
          <button
            className="settings-option-row"
            type="button"
            aria-expanded={openPassword}
            onClick={() => {
              setOpenPassword(!openPassword)
              setMessage('')
            }}
          >
            <span>Change password</span>
            <span className={openPassword ? 'option-arrow expanded' : 'option-arrow'}>
              <Icon name="chevron" size={20} />
            </span>
          </button>

          {openPassword && (
            <form
              className="settings-password-form"
              onSubmit={event => {
                event.preventDefault()
                setMessage(
                  'Password changes will be available when account authentication is connected.'
                )
              }}
            >
              <p className="settings-help">
                Password changes are not connected to an account service yet.
              </p>

              <label htmlFor="settings-current">Current password</label>
              <input
                id="settings-current"
                type="password"
                autoComplete="current-password"
                required
              />

              <label htmlFor="settings-new">New password</label>
              <input
                id="settings-new"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />

              <label htmlFor="settings-confirm">Confirm new password</label>
              <input
                id="settings-confirm"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />

              <button className="settings-purple" type="submit">
                Change password
              </button>

              {message && (
                <p role="status" className="settings-help">
                  {message}
                </p>
              )}
            </form>
          )}
        </div>

        <div className="settings-option">
          <button
            className="settings-option-row"
            type="button"
            aria-expanded={openTheme}
            onClick={() => setOpenTheme(!openTheme)}
          >
            <span>Themes</span>
            <span className={openTheme ? 'option-arrow expanded' : 'option-arrow'}>
              <Icon name="chevron" size={20} />
            </span>
          </button>

          {openTheme && (
            <div className="settings-theme-controls">
              <label className="theme-label" htmlFor="theme-select">
                Switch to a different theme
              </label>
              <select
                id="theme-select"
                value={theme}
                onChange={event => changeTheme(event.target.value)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          )}
        </div>
      </section>

      <div className="settings-signout">
        <button type="button" onClick={logout}>
          Sign out
        </button>
      </div>
    </section>
  )
}

export default Profile
