import React from 'react'
import styles from './Sidebar.module.css'

export default function Sidebar() {
    return (
        <aside className={styles.sidebar}>
            <p className={styles.heading}>Your notes</p>
            <ul className={styles.noteList} />
        </aside>
    )
}