import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('token') || '')
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'))

    useEffect(() => {
        if (token) localStorage.setItem('token', token)
        else localStorage.removeItem('token')
    }, [token])

    useEffect(() => {
        if (user) localStorage.setItem('user', JSON.stringify(user))
        else localStorage.removeItem('user')
    }, [user])

    const login = useCallback(async (username, password) => {
        const data = await api.post('/users/login', { username, password })
        setToken(data.token)
        setUser(data.user)
        return data
    }, [])

    const register = useCallback(async (payload) => {
        const data = await api.post('/users/register', payload)
        return data
    }, [])

    const logout = useCallback(() => {
        setToken('')
        setUser(null)
    }, [])

    const value = useMemo(() => ({ token, user, login, register, logout }), [token, user, login, register, logout])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
} 