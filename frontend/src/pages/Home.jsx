import { useCallback, useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Editor from '../components/Editor';
import ShareModal from '../components/ShareModal';
import noteService from '../services/noteService';
import { Link } from 'react-router-dom';
import birglDog from '../assets/birgl-dog.jpg';

import searchStyles from '../components/SearchBar.module.css';
import homeStyles from './Home.module.css';

const formattingGuide = {
  clientId: 'formatting-guide',
  title: 'Formatting Guide',
  isFormattingGuide: true,
  canEdit: false,
  content: `
    <h1>Welcome to Web Note Hub</h1>
    <p>Use this note to explore every formatting function available.</p>

    <h2>Text styles</h2>
    <p><b>Bold</b> · <i>Italic</i> · <u>Underline</u> · <s>Strikethrough</s></p>
    <p>
      <span style="font-family: system-ui, sans-serif">Sans-serif</span> ·
      <span style="font-family: Georgia, serif">Serif</span> ·
      <span style="font-family: monospace">Monospace</span>
    </p>

    <h2>Headings and body text</h2>
    <h1>Heading 1</h1>
    <h2>Heading 2</h2>
    <h3>Heading 3</h3>
    <p>Body text</p>

    <h2>Lists</h2>
    <ul>
      <li>Bullet one</li>
      <li>Bullet two</li>
    </ul>
    <ol>
      <li>Numbered one</li>
      <li>Numbered two</li>
    </ol>
    <p>Type <b>-</b> or <b>*</b> then Space to create a bullet list. Type a number and . followed by Space to create a numbered list.</p>

    <h2>Tasks</h2>
    <p><input type="checkbox"> Try checking this box</p>
    <p>Type <b>[ ]</b> then Space to create a task list.</p>

    <h2>Highlights</h2>
    <p>
      <span style="background-color: rgba(255, 235, 59, 0.5)">Yellow</span> ·
      <span style="background-color: rgba(76, 175, 80, 0.5)">Green</span> ·
      <span style="background-color: rgba(0, 188, 212, 0.5)">Cyan</span> ·
      <span style="background-color: rgba(233, 30, 99, 0.5)">Pink</span> ·
      <span style="background-color: rgba(244, 67, 54, 0.5)">Red</span>
    </p>

    <h2>Separator</h2>
    <p>Type <b>---</b> then Enter to insert a horizontal line:</p>
    <hr>

    <h2>Other controls</h2>
    <p>Use Tab to indent.</p>

    <h2>Images</h2>
    <img src="${birglDog}" alt="A cute puppy" width="320">
    <p>Here's a cute puppy for you &lt;:</p>
  `.replace(/\s*\n\s*/g, '').trim(),
};

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [shares, setShares] = useState([]);
  const [sharesError, setSharesError] = useState('');
  const [showSharedWith, setShowSharedWith] = useState(false);
  const [isLightMode, setIsLightMode] = useState(() => !document.body.classList.contains('dark-mode'));
  const importInputRef = useRef(null);

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

  const openImportPicker = () => {
    setShowImport(true);
  };

  const chooseImportFile = () => {
    importInputRef.current?.click();
  };

  const importNoteFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setShowImport(false);

    if (file.size > 1024 * 1024) {
      setError('Imported file must be at most 1 MB.');
      return;
    }

    try {
      setError('');
      const imageTypes = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp']);
      let mimeType = file.type;
      if (!mimeType) {
        if (/\.md$/i.test(file.name)) mimeType = 'text/markdown';
        else if (/\.json$/i.test(file.name)) mimeType = 'application/json';
        else mimeType = 'text/plain';
      }

      let content;
      if (imageTypes.has(mimeType)) {
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });
        content = dataUrl.split(',')[1];
      } else {
        content = await file.text();
      }

      const importedNote = await noteService.importNote({
        filename: file.name,
        mimeType,
        content,
      });
      setNotes((previous) => [importedNote, ...previous]);
      setSelectedNote(importedNote);
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
      return noteToStore;
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
        onOpenGuide={() => setSelectedNote(formattingGuide)}
      />
    );
  };

  return (
    <div className="workspace-page">
      <Header navigation={<><Link to="/">Home</Link><span>|</span><Link to="/profile">Profile</Link></>}>
        {selectedNote && (
          <>
            {!selectedNote.isFormattingGuide && (
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
            )}
          </>
        )}
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
      <input
        ref={importInputRef}
        type="file"
        accept=".txt,.md,.json"
        onChange={importNoteFile}
        hidden
      />
      {showImport && (
        <div className={homeStyles.importOverlay} onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowImport(false);
        }}>
          <div className={homeStyles.importModal} role="dialog" aria-modal="true" aria-labelledby="import-title">
            <div className={homeStyles.importHeader}>
              <h3 id="import-title">Import note</h3>
              <button
                type="button"
                className={homeStyles.importClose}
                onClick={() => setShowImport(false)}
                aria-label="Close import dialog"
              >
                ×
              </button>
            </div>
            <p>Choose a file to create a new note.</p>
            <p className={homeStyles.importFormats}>
              Accepted formats: TXT, Markdown (.md), JSON.
            </p>
            <p className={homeStyles.importFormats}>Maximum file size: 1 MB</p>
            <div className={homeStyles.importActions}>
              <button type="button" className={homeStyles.importCancel} onClick={() => setShowImport(false)}>
                Cancel
              </button>
              <button type="button" className={homeStyles.importChoose} onClick={chooseImportFile}>
                Choose file
              </button>
            </div>
          </div>
        </div>
      )}
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
          onImport={openImportPicker}
          onDelete={deleteNote}
        />
        {renderContent()}
      </div>
    </div>
  );
}
