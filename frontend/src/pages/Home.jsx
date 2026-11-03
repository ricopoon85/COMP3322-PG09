import { useCallback, useEffect, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Editor from '../components/Editor';
import ShareModal from '../components/ShareModal';
import noteService from '../services/noteService';

import styles from '../components/SearchBar.module.css';

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [shares, setShares] = useState([]);
  const [sharesError, setSharesError] = useState('');

  const handleRequestError = useCallback((requestError) => {
    if (requestError.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return;
    }
    setError(
      requestError.response?.data?.error ||
        'Unable to load your notes. Please try again.'
    );
  }, []);

  const loadNotes = useCallback(async (query = '') => {
    setLoading(true);
    setError('');
    try {
      const loadedNotes = await noteService.listNotes(query);
      setNotes(loadedNotes);
      setSelectedNote((current) =>
        loadedNotes.find((note) => note.id === current?.id) ||
        loadedNotes[0] ||
        null
      );
    } catch (requestError) {
      handleRequestError(requestError);
    } finally {
      setLoading(false);
    }
  }, [handleRequestError]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const createNote = async () => {
    setError('');
    try {
      const newNote = await noteService.createNote({
        title: 'Untitled Note',
        content: '',
      });
      setNotes((previous) => [newNote, ...previous]);
      setSelectedNote(newNote);
    } catch (requestError) {
      handleRequestError(requestError);
    }
  };

  const updateNote = async (id, fields) => {
    setError('');
    setNotes((previous) =>
      previous.map((note) => (note.id === id ? { ...note, ...fields } : note))
    );
    setSelectedNote((previous) =>
      previous?.id === id ? { ...previous, ...fields } : previous
    );
    setSaving(true);
    try {
      const updatedNote = await noteService.updateNote(id, fields);
      setNotes((previous) =>
        previous.map((note) => (note.id === id ? updatedNote : note))
      );
      setSelectedNote((previous) =>
        previous?.id === id ? updatedNote : previous
      );
    } catch (requestError) {
      handleRequestError(requestError);
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (id) => {
    setError('');
    try {
      await noteService.deleteNote(id);
      setNotes((previous) => {
        const remaining = previous.filter((note) => note.id !== id);
        setSelectedNote((current) =>
          current?.id === id ? remaining[0] || null : current
        );
        return remaining;
      });
    } catch (requestError) {
      handleRequestError(requestError);
    }
  };

  const submitSearch = (event) => {
    event.preventDefault();
    loadNotes(search);
  };

  const clearSearch = () => {
    setSearch('');
    loadNotes();
  };

  const loadShares = useCallback(async (noteId) => {
    if (!noteId) {
      setShares([]);
      return;
    }

    try {
      const nextShares = await noteService.listShares(noteId);
      setShares(nextShares);
      setSharesError('');
    } catch (requestError) {
      setSharesError(requestError.response?.data?.error || 'Unable to load shares.');
      setShares([]);
    }
  }, []);

  useEffect(() => {
    loadShares(selectedNote?.id);
  }, [selectedNote?.id, loadShares]);

  const updateSharePermission = async (shareId, permission) => {
    if (!selectedNote) return;

    try {
      const updatedShare = await noteService.updateShare(selectedNote.id, shareId, permission);
      setShares((previous) =>
        previous.map((share) => (share.id === shareId ? { ...share, ...updatedShare } : share))
      );
    } catch (requestError) {
      setSharesError(requestError.response?.data?.error || 'Unable to update permission.');
    }
  };

  const removeShare = async (shareId) => {
    if (!selectedNote) return;

    try {
      await noteService.deleteShare(selectedNote.id, shareId);
      setShares((previous) => previous.filter((share) => share.id !== shareId));
    } catch (requestError) {
      setSharesError(requestError.response?.data?.error || 'Unable to remove access.');
    }
  };

  const renderContent = () => {
    if (loading) return <main style={{ padding: 24 }}><p>Loading notes...</p></main>;
    if (error) {
      return (
        <main style={{ padding: 24 }}>
          <p role="alert">{error}</p>
          <button onClick={() => loadNotes(search)}>Retry</button>
        </main>
      );
    }
    if (!selectedNote) {
      return (
        <main style={{ padding: 24 }}>
          <p>{search ? 'No notes match your search.' : 'No notes yet — create your first one!'}</p>
        </main>
      );
    }
    return (
      <Editor
        note={selectedNote}
        onTitleChange={(title) => updateNote(selectedNote.id, { title })}
        onContentChange={(content) => updateNote(selectedNote.id, { content })}
      />
    );
  };

  return (
    <div className="workspace-page">
      <Header />
      {selectedNote && (
        <div style={{ padding: '0 24px 12px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button type="button" onClick={() => setShowShare(true)}>
            Share This Note
          </button>
          <span style={{ fontSize: 13, color: '#475569' }}>
            {shares.length ? `${shares.length} collaborator${shares.length > 1 ? 's' : ''}` : 'Not shared yet'}
          </span>
        </div>
      )}
      <form className={styles.form} onSubmit={submitSearch}>
        <label className={styles.label}>
          Search notes
          <input
            className={styles.input}
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title or content"
            aria-label="Search notes"
          />
        </label>
        <button type="submit" className={styles.button}>Search</button>
        {search && <button type="button" onClick={clearSearch} className={styles.button}>Clear</button>}
      </form>
      {saving && <p style={{ padding: '0 24px' }}>Saving...</p>}
      {selectedNote && (
        <div style={{ padding: '0 24px 12px' }}>
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: 16,
              maxWidth: 560,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <strong style={{ fontSize: 15 }}>Shared with</strong>
              <button type="button" onClick={() => setShowShare(true)} style={{ padding: '6px 10px' }}>
                + Add
              </button>
            </div>

            {sharesError && <p style={{ color: '#b91c1c', margin: '0 0 8px' }}>{sharesError}</p>}

            {shares.length === 0 ? (
              <p style={{ margin: 0, color: '#64748b' }}>No one has access to this note yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {shares.map((share) => (
                  <div
                    key={share.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 10,
                      padding: '8px 10px',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {share.shared_with_email || share.shared_with_username || 'User'}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        {share.shared_with_username ? `@${share.shared_with_username}` : 'Collaborator'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <select
                        value={share.permission}
                        onChange={(event) => updateSharePermission(share.id, event.target.value)}
                        style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                      >
                        <option value="view">View</option>
                        <option value="edit">Edit</option>
                      </select>
                      <button type="button" onClick={() => removeShare(share.id)} style={{ padding: '6px 8px' }}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {showShare && selectedNote && (
        <ShareModal
          noteId={selectedNote.id}
          onClose={() => setShowShare(false)}
          onShared={() => {
            setShowShare(false);
            loadShares(selectedNote.id);
          }}
        />
      )}
      <div className="content">
        <Sidebar
          notes={notes}
          selectedId={selectedNote?.id}
          onSelect={setSelectedNote}
          onCreate={createNote}
          onDelete={deleteNote}
        />
        {renderContent()}
      </div>
    </div>
  );
}
