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
      <NavLink to="/catalog">Услуги</NavLink>
      <NavLink to="/cart">Корзина ({count})</NavLink>
      <NavLink to="/about">О нас</NavLink>
      {user && <NavLink to="/dashboard">Профиль</NavLink>}

      <span className="spacer" />

      <button onClick={toggleTheme}>
        {theme === 'light' ? '🌙 Тёмная' : '☀️ Светлая'}
      </button>

      {user ? (
        <button onClick={handleLogout}>Выйти</button>
      ) : (
        <>
          <NavLink to="/login">Войти</NavLink>
          <NavLink to="/register">Регистрация</NavLink>
        </>
      )}
    </nav>
  )
}

export default Navbar
