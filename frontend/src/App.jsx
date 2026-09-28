import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Editor from './components/Editor'
import Footer from './components/Footer'
import Register from './pages/Register'
import Login from './pages/Login'
import Notes from './pages/Notes'

import './App.css'

function HomeLayout() {
  return (
    <div className="page-container">
      <Header />
      <div className="content">
        <Sidebar />
        <Editor />
      </div>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: 8 }}>
        <Link to="/">Home</Link> | <Link to="/register">Register</Link> | <Link to="/login">Login</Link> | <Link to="/notes">Notes</Link>
      </nav>
      <Routes>
        <Route path="/" element={<HomeLayout />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/notes" element={<Notes />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
