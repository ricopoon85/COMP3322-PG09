import { useCallback, useEffect, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Editor from '../components/Editor';
import ShareModal from '../components/ShareModal';
import noteService from '../services/noteService';
import { Link } from 'react-router-dom';

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
  const [showSharedWith, setShowSharedWith] = useState(false);
  const [isLightMode, setIsLightMode] = useState(() => !document.body.classList.contains('dark-mode'));

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
      const sharedNotes = query ? [] : await noteService.listSharedNotes();
      const ownedNotesWithShares = await Promise.all(
        loadedNotes.map(async (note) => {
          if (query) return { ...note, sharedWith: [] };
          try {
            return {
              ...note,
              sharedWith: await noteService.listShares(note.id),
            };
          } catch {
            return { ...note, sharedWith: [] };
          }
        })
      );
      const combinedNotes = [
        ...ownedNotesWithShares.map((note) => ({ ...note, shared: false })),
        ...sharedNotes,
      ];
      setNotes(combinedNotes);
      setSelectedNote((current) =>
        combinedNotes.find((note) =>
          note.shared
            ? note.clientId === current?.clientId
            : note.id === current?.id
        ) ||
        combinedNotes[0] ||
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
      const currentNote = selectedNote?.id === id ? selectedNote : notes.find((note) => note.id === id);
      const updatedNote = currentNote?.shared
        ? await noteService.updateSharedNote(id, fields)
        : await noteService.updateNote(id, fields);
      const noteToStore = currentNote?.shared
        ? {
            ...currentNote,
            ...updatedNote,
            shared: true,
            canEdit: currentNote.canEdit,
            permission: currentNote.permission,
          }
        : updatedNote;
      setNotes((previous) =>
        previous.map((note) => (note.id === id ? noteToStore : note))
      );
      setSelectedNote((previous) =>
        previous?.id === id ? noteToStore : previous
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

  const toggleTheme = () => {
    const nextLightMode = !isLightMode;
    setIsLightMode(nextLightMode);
    document.body.classList.toggle('dark-mode', !nextLightMode);
  };

  const clearSearch = () => {
    setSearch('');
    loadNotes();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadNotes(search);
    }, 150);

    return () => clearTimeout(timer);
  }, [search, loadNotes]);

  const loadShares = useCallback(async (noteId) => {
    if (!noteId) {
      setShares([]);
      return;
    }

    try {
      const nextShares = await noteService.listShares(noteId);
      setShares(nextShares);
      setNotes((previous) =>
        previous.map((note) =>
          note.id === noteId && !note.shared
            ? { ...note, sharedWith: nextShares }
            : note
        )
      );
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
      setNotes((previous) =>
        previous.map((note) =>
          note.id === selectedNote.id && !note.shared
            ? {
                ...note,
                sharedWith: (note.sharedWith || []).map((share) =>
                  share.id === shareId ? { ...share, ...updatedShare } : share
                ),
              }
            : note
        )
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
      setNotes((previous) =>
        previous.map((note) =>
          note.id === selectedNote.id && !note.shared
            ? {
                ...note,
                sharedWith: (note.sharedWith || []).filter((share) => share.id !== shareId),
              }
            : note
        )
      );
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
        searchQuery={search}
        onTitleChange={(title) => updateNote(selectedNote.id, { title })}
        onContentChange={(content) => updateNote(selectedNote.id, { content })}
      />
    );
  };

  return (
    <div className="workspace-page">
      <Header navigation={<><Link to="/">Home</Link><span>|</span><Link to="/profile">Profile</Link></>}>
        {selectedNote && (
          <>
            <div className={homeStyles.sharedWithWrap}>
            <button
              type="button"
              className={homeStyles.sharedWithPreview}
              onClick={() => setShowSharedWith((open) => !open)}
              aria-expanded={showSharedWith}
            >
              <span className={homeStyles.sharedWithLabel}>Shared with</span>
              <strong>{shares.length ? `${shares.length} people` : 'No one yet'}</strong>
              <span aria-hidden="true">{showSharedWith ? '⌃' : '⌄'}</span>
            </button>
            {showSharedWith && (
              <div className={homeStyles.sharedWithPopover}>
                <div className={homeStyles.shareHeader}>
                  <strong>Manage access</strong>
                  <button type="button" onClick={() => setShowShare(true)} className={homeStyles.shareAddButton}>
                    + Add access
                  </button>
                </div>
                {sharesError && <p className={homeStyles.shareError}>{sharesError}</p>}
                {shares.length === 0 ? (
                  <p className={homeStyles.shareEmpty}>No collaborators yet.</p>
                ) : (
                  <div className={homeStyles.shareList}>
                    {shares.map((share) => (
                      <div key={share.id} className={homeStyles.shareItem}>
                        <span className={homeStyles.shareEmail}>
                          {share.shared_with_email || share.shared_with_username || 'User'}
                        </span>
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
            )}
          </div>
          <button type="button" className={homeStyles.themeToggle} onClick={toggleTheme} title="Toggle light/dark mode">
            {isLightMode ? '🌙 Dark' : '☀️ Light'}
          </button>
          <button
            type="button"
            className={homeStyles.logoutButton}
            onClick={() => {
              localStorage.removeItem('token');
              window.dispatchEvent(new Event('auth-changed'));
              window.location.href = '/login';
            }}
          >
            Logout
          </button>
          </>
        )}
      </Header>
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
          selectedId={selectedNote?.clientId || selectedNote?.id}
          onSelect={setSelectedNote}
          onCreate={createNote}
          onDelete={deleteNote}
        />
        {renderContent()}
      </div>
    </div>
  );
}
