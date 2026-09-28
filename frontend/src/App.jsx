import React from 'react'
import Header from './components/Header'

import './App.css'

function App() {
  return (
    <div className="page-container">
      <Header />
      <div className="content">
        <aside className="sidebar">
          <p>Your notes</p>
          <ul className="note-list">
            {}
          </ul>
        </aside>
        <main className="main-content">
          <p>Welcome to the Note taking app</p>
        </main>
      </div>

      <footer className="footer">
        <p>COMP3322 Group Project - Group 9</p>
      </footer>
    </div>
  )
}

export default App
