import React, { useState } from 'react';
import styles from './FileTitleInput.module.css';

function FileTitleInput() {
    const [title, setTitle] = useState('');

    return (
        <div className={styles.container}>
            <input
                className={styles.input}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled Note"
            />
        </div>
    );
}

export default FileTitleInput;