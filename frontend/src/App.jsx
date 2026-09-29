import React from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import Notes from './pages/Notes'

import './App.css'

function RequireLogin({ children }) {
  const token = localStorage.getItem('token')

  return token ? children : <Navigate to="/login" replace />
}

function App() {
  const isLoggedIn = Boolean(localStorage.getItem('token'))

  return (
    <BrowserRouter>
      <nav style={{ padding: 8 }}>
        <Link to="/">Home</Link> |  <Link to="/notes">Notes</Link>{' '}
        {isLoggedIn ? (
          <button onClick={() => {
            localStorage.removeItem('token')
            window.location.href = '/login'
          }}>
            Logout
          </button>
        ) : (
          <>
            <Link to="/login">Login</Link>
          </>
        )} 
      </nav>
      <Routes>
        <Route path="/" element={<RequireLogin><Home /></RequireLogin>} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/notes" element={<RequireLogin><Notes /></RequireLogin>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
