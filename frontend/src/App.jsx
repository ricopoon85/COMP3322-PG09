import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import Profile from './pages/Profile'

import './App.css'

function RequireLogin({ children }) {
  const token = localStorage.getItem('token')

  return token ? children : <Navigate to="/login" replace />
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem('token')))

  useEffect(() => {
    const updateLoginStatus = () => {
      setIsLoggedIn(Boolean(localStorage.getItem('token')))
    }

    window.addEventListener('login-event', updateLoginStatus)

    return () => {
      window.removeEventListener('login-event', updateLoginStatus)
    }
  }, [])

  return (
    <BrowserRouter>
      {isLoggedIn && (
        <nav className="navbar">
          <Link to="/">Home</Link> |  <Link to="/profile">Profile</Link>{' '}
          <button className="logout" onClick={() => {
            localStorage.removeItem('token')
            window.dispatchEvent(new Event('auth-changed'))
            window.location.href = '/login'
          }}>
            Logout
          </button>
        </nav>
      )}
      <Routes>
        <Route path="/" element={<RequireLogin><Home /></RequireLogin>} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<RequireLogin><Profile /></RequireLogin>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
