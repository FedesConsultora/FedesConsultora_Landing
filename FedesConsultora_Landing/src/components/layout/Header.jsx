// Header.jsx
import { NavLink } from 'react-router-dom'

export default function Header() {
  return (
    <header className="site-header">
      <div className="container">
        <NavLink to="/" className="logo">
          Fedes Consultora
        </NavLink>
      </div>
    </header>
  )
}
