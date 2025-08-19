import React from 'react'
import { createBrowserRouter, Outlet, Navigate } from 'react-router-dom'
import { Container } from '@mui/material'
import { useAuth } from './context/AuthContext'
import LoginPage from './views/auth/LoginPage'
import RegisterPage from './views/auth/RegisterPage'
import DashboardPage from './views/DashboardPage'
import TransactionsPage from './views/TransactionsPage'
import CategoriesPage from './views/CategoriesPage'
import GoalsPage from './views/GoalsPage'
import ReportsPage from './views/ReportsPage'
import Layout from './views/Layout'

function ProtectedRoute() {
    const { token } = useAuth()
    if (!token) return <Navigate to="/login" replace />
    return <Outlet />
}

const router = createBrowserRouter([
    {
        element: <Layout />,
        children: [
            { path: '/', element: <Navigate to="/dashboard" replace /> },
            { path: '/login', element: <LoginPage /> },
            { path: '/register', element: <RegisterPage /> },
            {
                element: <ProtectedRoute />,
                children: [
                    { path: '/dashboard', element: <DashboardPage /> },
                    { path: '/transactions', element: <TransactionsPage /> },
                    { path: '/categories', element: <CategoriesPage /> },
                    { path: '/goals', element: <GoalsPage /> },
                    { path: '/reports', element: <ReportsPage /> }
                ]
            }
        ]
    }
])

export default router 