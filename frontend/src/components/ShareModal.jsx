import { useState } from 'react';
import noteService from '../services/noteService';

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
      setMsg('Shared successfully!');
      if (typeof onShared === 'function') {
        onShared();
      } else {
        setTimeout(() => onClose(), 800);
      }
    } catch (error) {
      setMsg(error.response?.data?.error || 'Failed to share note.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.35)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: 'min(420px, 90vw)',
          background: '#fff',
          border: '1px solid #dfe7ee',
          borderRadius: 16,
          boxShadow: '0 22px 55px rgba(15, 23, 42, 0.22)',
          padding: 22,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 22 }}>Share note</h3>
          <button type="button" onClick={onClose} aria-label="Close share panel" style={{ padding: '6px 10px' }}>
            ✕
          </button>
        </div>

        <form onSubmit={handleShare} style={{ display: 'grid', gap: 14 }}>
          <label style={{ display: 'grid', gap: 6, fontWeight: 600 }}>
            Collaborator email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              required
              style={{
                padding: '12px 14px',
                border: '1px solid #cbd5e1',
                borderRadius: 10,
                fontSize: 15,
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: 6, fontWeight: 600 }}>
            Permission
            <select
              value={permission}
              onChange={(event) => setPermission(event.target.value)}
              style={{
                padding: '12px 14px',
                border: '1px solid #cbd5e1',
                borderRadius: 10,
                fontSize: 15,
              }}
            >
              <option value="view">View only</option>
              <option value="edit">Can edit</option>
            </select>
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 14px' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ padding: '10px 16px' }}>
              {loading ? 'Sharing...' : 'Share'}
            </button>
          </div>
        </form>

        {msg && (
          <p
            style={{
              margin: '14px 0 0',
              color: msg.includes('success') ? '#15803d' : '#b91c1c',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}
