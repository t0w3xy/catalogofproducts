import { NavLink, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { count } = useCart()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <nav className="nav">
      <NavLink to="/" end>Главная</NavLink>
      <NavLink to="/catalog">Каталог</NavLink>
      <NavLink to="/cart">Корзина ({count})</NavLink>
      {user && <NavLink to="/dashboard">Кабинет</NavLink>}

      <span className="spacer" />

      <button onClick={toggleTheme}>
        {theme === 'light' ? ' Тёмная' : ' Светлая'}
      </button>

      {user ? (
        <button onClick={handleLogout}>Выйти ({user.name})</button>
      ) : (
        <NavLink to="/login">Войти</NavLink>
      )}
    </nav>
  )
}

export default Navbar
