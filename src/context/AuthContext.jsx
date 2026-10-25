import { createContext, useContext, useEffect, useState } from 'react'
import { api, setToken, getToken } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // пока проверяем сохранённый токен, показываем «Загрузка»
  const [checking, setChecking] = useState(() => Boolean(getToken()))

  useEffect(() => {
    if (!getToken()) return
    api('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => setToken(null))
      .finally(() => setChecking(false))
  }, [])

  async function authenticate(path, email, password) {
    const data = await api(path, { method: 'POST', body: { email, password } })
    setToken(data.token)
    setUser(data.user)
  }

  const value = {
    user,
    checking,
    register: (email, password) => authenticate('/auth/register', email, password),
    login: (email, password) => authenticate('/auth/login', email, password),
    logout: () => {
      setToken(null)
      setUser(null)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
