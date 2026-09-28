import React from 'react'

import FileTitleInput from './FileTitleInput'
import styles from './Header.module.css'

export default function Header() {
    return (
        <header className={styles.header}>
            <h1 className={styles.title}>Note taking app</h1>
            <FileTitleInput />
        </header>
    )
}