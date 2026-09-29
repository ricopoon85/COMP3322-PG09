import React from 'react'
import styles from './Sidebar.module.css';

export default function Sidebar({
  notes,
  selectedId,
  onSelect,
  onCreate,
  onDelete,
}) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.headingRow}>
        <p className={styles.heading}>Your notes</p>
        <button className={styles.newButton} onClick={onCreate}>
          + New
        </button>
      </div>

      {notes.length === 0 ? (
        <p className={styles.empty}>No notes yet</p>
      ) : (
        <ul className={styles.noteList}>
          {notes.map((note) => (
            <li
              key={note.id}
              className={
                note.id === selectedId
                  ? `${styles.noteItem} ${styles.active}`
                  : styles.noteItem
              }
              onClick={() => onSelect(note)}
            >
              <span className={styles.noteTitle}>
                {note.title || 'Untitled Note'}
              </span>
              <button
                className={styles.deleteButton}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(note.id);
                }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}