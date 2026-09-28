import React, { useState } from 'react'
import './App.css'

function App() {
  return (
    <div className="page-container">
      <header>
        <h1>Note taking app</h1>
      </header>
      <div className="content">
        <aside>
          <p>Navigation</p>
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
