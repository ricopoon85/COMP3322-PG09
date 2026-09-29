import React, { useState } from 'react'
import styles from './Editor.module.css'



export default function Editor() {
    const [content, setContent] = useState('')

    return (
        <main className={styles.editor}>
            <textarea
                className={styles.textarea}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Start writing your note..."
                aria-label="Note content"
            />
        </main>
    )
}