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
    <aside className={`scroll-container ${styles.sidebar}`}>
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
              key={note.clientId || note.id}
              className={
                (note.clientId || note.id) === selectedId
                  ? `${styles.noteItem} ${styles.active}`
                  : styles.noteItem
              }
              onClick={() => onSelect(note)}
            >
              <span className={styles.noteText}>
                <span className={styles.noteTitle}>
                  {note.title || 'Untitled Note'}
                </span>
                {note.shared && (
                  <span className={styles.sharedNoteMeta}>
                    <span>Shared by {note.owner_username || 'another user'}</span>
                    <span>{note.permission === 'edit' ? 'Can edit' : 'View only'}</span>
                  </span>
                )}
                {!note.shared && note.sharedWith?.map((share) => (
                  <span className={styles.sharedNoteMeta} key={share.id}>
                    <span>
                      Shared with {share.shared_with_username || share.shared_with_email || 'another user'}
                    </span>
                    <span>{share.permission === 'edit' ? 'Can edit' : 'View only'}</span>
                  </span>
                ))}
              </span>
              {!note.shared && <button
                className={styles.deleteButton}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(note.id);
                }}
              >
                ×
              </button>}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}