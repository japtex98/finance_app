import React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Button, Box, Container, Stack, Drawer, List, ListItemButton, ListItemIcon, ListItemText, CssBaseline, Divider } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import CategoryIcon from '@mui/icons-material/Category'
import FlagIcon from '@mui/icons-material/Flag'
import AssessmentIcon from '@mui/icons-material/Assessment'
import LogoutIcon from '@mui/icons-material/Logout'
import LoginIcon from '@mui/icons-material/Login'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { useAuth } from '../context/AuthContext'

const drawerWidth = 220

export default function Layout() {
    const { token, logout } = useAuth()
    const location = useLocation()

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: 'background.paper', color: 'text.primary', boxShadow: 'none', borderBottom: '1px solid #eee' }}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>MoneyApp</Typography>
                    {token ? (
                        <Button color="inherit" startIcon={<LogoutIcon />} onClick={logout}>Logout</Button>
                    ) : (
                        <Stack direction="row" spacing={1}>
                            <Button color="inherit" component={Link} to="/login" startIcon={<LoginIcon />}>Login</Button>
                            <Button color="inherit" component={Link} to="/register" startIcon={<PersonAddIcon />}>Register</Button>
                        </Stack>
                    )}
                </Toolbar>
            </AppBar>

            {token && (
                <Drawer variant="permanent" sx={{ width: drawerWidth, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid #eee' } }}>
                    <Toolbar />
                    <Box sx={{ overflow: 'auto' }}>
                        <List>
                            <ListItemButton component={Link} to="/dashboard" selected={location.pathname.startsWith('/dashboard')}>
                                <ListItemIcon><DashboardIcon /></ListItemIcon>
                                <ListItemText primary="Dashboard" />
                            </ListItemButton>
                            <ListItemButton component={Link} to="/transactions" selected={location.pathname.startsWith('/transactions')}>
                                <ListItemIcon><ReceiptLongIcon /></ListItemIcon>
                                <ListItemText primary="Transactions" />
                            </ListItemButton>
                            <ListItemButton component={Link} to="/categories" selected={location.pathname.startsWith('/categories')}>
                                <ListItemIcon><CategoryIcon /></ListItemIcon>
                                <ListItemText primary="Categories" />
                            </ListItemButton>
                            <ListItemButton component={Link} to="/goals" selected={location.pathname.startsWith('/goals')}>
                                <ListItemIcon><FlagIcon /></ListItemIcon>
                                <ListItemText primary="Goals" />
                            </ListItemButton>
                            <ListItemButton component={Link} to="/reports" selected={location.pathname.startsWith('/reports')}>
                                <ListItemIcon><AssessmentIcon /></ListItemIcon>
                                <ListItemText primary="Reports" />
                            </ListItemButton>
                        </List>
                        <Divider />
                    </Box>
                </Drawer>
            )}

            <Box component="main" sx={{ flexGrow: 1, p: 3, ml: token ? `${drawerWidth}px` : 0 }}>
                <Toolbar />
                <Container maxWidth="lg" sx={{ px: 0 }}>
                    <Outlet />
                </Container>
            </Box>
        </Box>
    )
} 