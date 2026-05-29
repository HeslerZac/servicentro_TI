import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'

export type RolUsuario = 'ADMINISTRADOR' | 'SECRETARIA' | 'VENDEDOR'

type Usuario = {
  id: string
  nombreUsuario: string
  rol: RolUsuario
}

type AuthState = {
  token: string | null
  usuario: Usuario | null
}

type LoginInput = { usuario: string; contrasena: string }

type AuthContextType = {
  token: string | null
  usuario: Usuario | null
  isAuthenticated: boolean
  roles: RolUsuario[]
  login: (cred: LoginInput) => Promise<void>
  logout: () => void
  register: (data: { nombreUsuario: string; contrasena: string; rol?: RolUsuario }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'taller.auth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) as AuthState : { token: null, usuario: null }
    } catch {
      return { token: null, usuario: null }
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    api.setToken(state.token)
  }, [state.token])

  const login = useCallback(async (cred: LoginInput) => {
    const { data } = await api.client.post('/auth/login', cred)
    setState({ token: data.token, usuario: data.usuario })
  }, [])

  const logout = useCallback(() => {
    setState({ token: null, usuario: null })
  }, [])

  const register = useCallback(async (data: { nombreUsuario: string; contrasena: string; rol?: RolUsuario }) => {
    await api.client.post('/usuarios', {
      nombreUsuario: data.nombreUsuario,
      contrasena: data.contrasena,
      rol: data.rol,
    })
  }, [])

  const value = useMemo<AuthContextType>(() => ({
    token: state.token,
    usuario: state.usuario,
    isAuthenticated: Boolean(state.token),
    roles: state.usuario ? [state.usuario.rol] : [],
    login,
    logout,
    register,
  }), [state, login, logout, register])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

