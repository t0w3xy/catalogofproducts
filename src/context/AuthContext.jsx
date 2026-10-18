import { createContext, useContext, useState } from 'react'

/*
  Учебная авторизация без сервера:
  - пользователи хранятся в localStorage ("users")
  - текущая сессия — в localStorage ("session")
  В реальном проекте пароли хранит и проверяет бэкенд (с хэшированием).
*/
const AuthContext = createContext(null)

function read(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => read('session', null))

  function startSession(u) {
    const session = { name: u.name, email: u.email }
    localStorage.setItem('session', JSON.stringify(session))
    setUser(session)
  }

  function register(name, email, password) {
    const users = read('users', [])
    if (users.some((u) => u.email === email)) {
      return { ok: false, error: 'Пользователь с таким email уже существует' }
    }
    const newUser = { name, email, password }
    localStorage.setItem('users', JSON.stringify([...users, newUser]))
    startSession(newUser)
    return { ok: true }
  }

  function login(email, password) {
    const found = read('users', []).find(
      (u) => u.email === email && u.password === password
    )
    if (!found) return { ok: false, error: 'Неверный email или пароль' }
    startSession(found)
    return { ok: true }
  }

  function logout() {
    localStorage.removeItem('session')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
