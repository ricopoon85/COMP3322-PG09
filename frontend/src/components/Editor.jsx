import { useEffect, useState } from 'react';
import styles from './Editor.module.css';

export default function Editor({ note, onTitleChange, onContentChange }) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');

  useEffect(() => {
    setTitle(note?.title || '');
    setContent(note?.content || '');
  }, [note?.id]);

  useEffect(() => {
    if (!note) return;
    const timer = setTimeout(() => {
      if (title !== note.title) onTitleChange(title);
    }, 500);
    return () => clearTimeout(timer);
  }, [title]);

  useEffect(() => {
    if (!note) return;
    const timer = setTimeout(() => {
      if (content !== note.content) onContentChange(content);
    }, 500);
    return () => clearTimeout(timer);
  }, [content]);

  if (!note) return null;

  return (
    <main className={styles.editor}>
      <input
        className={styles.titleInput}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Untitled Note"
        aria-label="Note title"
      />
      <textarea
        className={styles.textarea}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing your note..."
        aria-label="Note content"
      />
    </main>
  );
}