import React from 'react'

import FileTitleInput from './FileTitleInput'
import styles from './Header.module.css'

export default function Header({ navigation, children }) {
  return (
    <header className={styles.header}>
      {navigation && <nav className={styles.navigation}>{navigation}</nav>}
      {children && <div className={styles.actions}>{children}</div>}
    </header>
  );
}