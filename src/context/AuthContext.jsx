import React, { createContext, useContext, useState, useCallback } from 'react'
import { api } from '../api/index.js'

const AuthContext = createContext(null)

function loadUser() {
  try {
    const token = localStorage.getItem('simagent_token')
    const user = localStorage.getItem('simagent_user')
    if (token && user) return JSON.parse(user)
  } catch {}
  return null
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(loadUser)

  const login = useCallback(async (staffId, pin) => {
    const { token, user } = await api.auth.login(staffId, pin)
    localStorage.setItem('simagent_token', token)
    localStorage.setItem('simagent_user', JSON.stringify(user))
    setCurrentUser(user)
    return user
  }, [])

  const logout = useCallback(() => {
    setCurrentUser(null)
    localStorage.removeItem('simagent_token')
    localStorage.removeItem('simagent_user')
  }, [])

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
