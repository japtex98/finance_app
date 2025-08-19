import React from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import './styles.css'

const queryClient = new QueryClient()

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: { main: '#000000' },
        secondary: { main: '#777777' },
        background: { default: '#ffffff', paper: '#ffffff' },
        text: { primary: '#000000', secondary: '#555555' }
    }
})

const container = document.getElementById('root')
const root = createRoot(container)

root.render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </QueryClientProvider>
        </ThemeProvider>
    </React.StrictMode>
) 