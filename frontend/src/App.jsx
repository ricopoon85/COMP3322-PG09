import React, { useState } from 'react'
import './App.css'

function App() {
  return (
    <div className="page-container">
      <header className="horizontal-layout">
        <h1 className="app-name">Note taking app</h1>
        <p>Note Name</p>
      </header>

      <div className="content">
        <aside>
          <p>Navigation</p>
          <ul>
            <li>Home</li>
            <li>Notes</li>
            <li>Settings</li>
          </ul>
        </aside>
        <main>
          <p>Welcome to the Note taking app</p>
        </main>
      </div>

      <footer>
        <p>COMP3322 Group 9</p>
      </footer>
    </div>
  )
}

export default App
