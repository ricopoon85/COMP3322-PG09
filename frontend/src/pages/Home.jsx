import { useCallback, useEffect, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Editor from '../components/Editor';
import ShareModal from '../components/ShareModal';
import noteService from '../services/noteService';

import searchStyles from '../components/SearchBar.module.css';
import homeStyles from './Home.module.css';

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
        <div className={homeStyles.toolbar}>
          <button type="button" onClick={() => setShowShare(true)} className={homeStyles.shareButton}>
            Share note
          </button>
          <span className={homeStyles.toolbarMeta}>
            {shares.length ? `${shares.length} collaborator${shares.length > 1 ? 's' : ''}` : 'Not shared yet'}
          </span>
        </div>
      )}
      <form className={searchStyles.form} onSubmit={submitSearch}>
        <label className={searchStyles.label}>
          Search notes
          <input
            className={searchStyles.input}
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title or content"
            aria-label="Search notes"
          />
        </label>
        <button type="submit" className={searchStyles.button}>Search</button>
        {search && <button type="button" onClick={clearSearch} className={searchStyles.button}>Clear</button>}
      </form>
      {saving && <p style={{ padding: '0 24px' }}>Saving...</p>}
      {selectedNote && (
        <div className={homeStyles.sharePanel}>
          <div className={homeStyles.shareCard}>
            <div className={homeStyles.shareHeader}>
              <strong className={homeStyles.shareTitle}>Shared with</strong>
              <button type="button" onClick={() => setShowShare(true)} className={homeStyles.shareAddButton}>
                + Add access
              </button>
            </div>

            {sharesError && <p className={homeStyles.shareError}>{sharesError}</p>}

            {shares.length === 0 ? (
              <p className={homeStyles.shareEmpty}>No collaborators yet. Share this note with someone to begin collaborating.</p>
            ) : (
              <div className={homeStyles.shareList}>
                {shares.map((share) => (
                  <div key={share.id} className={homeStyles.shareItem}>
                    <div className={homeStyles.shareIdentity}>
                      <div className={homeStyles.shareEmail}>
                        {share.shared_with_email || share.shared_with_username || 'User'}
                      </div>
                      <div className={homeStyles.shareHandle}>
                        {share.shared_with_username ? `@${share.shared_with_username}` : 'Collaborator'}
                      </div>
                    </div>

                    <div className={homeStyles.shareControls}>
                      <select
                        value={share.permission}
                        onChange={(event) => updateSharePermission(share.id, event.target.value)}
                        className={homeStyles.shareSelect}
                        aria-label={`Permission for ${share.shared_with_email || 'collaborator'}`}
                      >
                        <option value="view">View</option>
                        <option value="edit">Edit</option>
                      </select>
                      <button type="button" onClick={() => removeShare(share.id)} className={homeStyles.shareRemove}>
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
