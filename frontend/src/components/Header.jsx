import React from 'react'

import FileTitleInput from './FileTitleInput'
import styles from './Header.module.css'

export default function Header({ onLogout }) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Note Taking App</h1>
      <button className={styles.logoutButton} onClick={onLogout}>
        Logout
      </button>
    </header>
  );
}