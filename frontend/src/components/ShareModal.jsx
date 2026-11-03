import { useState } from 'react';
import noteService from '../services/noteService';

import styles from './ShareModal.module.css';

export default function ShareModal({ noteId, onClose, onShared }) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('view');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleShare = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      await noteService.createShare(noteId, email, permission);
      setMsg('Access granted successfully.');
      if (typeof onShared === 'function') {
        onShared();
      } else {
        setTimeout(() => onClose(), 700);
      }
    } catch (error) {
      setMsg(error.response?.data?.error || 'Unable to share this note.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>Share note</h3>
          <button type="button" onClick={onClose} aria-label="Close share panel" className={styles.closeButton}>
            ×
          </button>
        </div>

        <form onSubmit={handleShare} className={styles.form}>
          <label className={styles.field}>
            Collaborator email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              required
              className={styles.input}
            />
          </label>

          <label className={styles.field}>
            Permission
            <select
              value={permission}
              onChange={(event) => setPermission(event.target.value)}
              className={styles.select}
            >
              <option value="view">View only</option>
              <option value="edit">Can edit</option>
            </select>
          </label>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.secondaryButton}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className={styles.primaryButton}>
              {loading ? 'Sharing...' : 'Share'}
            </button>
          </div>
        </form>

        {msg && (
          <p className={`${styles.message} ${msg.includes('success') ? styles.success : styles.error}`}>
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}
