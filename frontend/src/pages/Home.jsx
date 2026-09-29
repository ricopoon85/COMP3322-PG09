import { useCallback, useEffect, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Editor from '../components/Editor';
import Footer from '../components/Footer';
import noteService from '../services/noteService';

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

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

  const loadNotes = useCallback(
    async (query = '') => {
      setLoading(true);
      setError('');
      try {
        const loadedNotes = query.trim()
          ? await noteService.searchNotes(query)
          : await noteService.listNotes();
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
    },
    [handleRequestError]
  );

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
      setNotes((prev) => [newNote, ...prev]);
      setSelectedNote(newNote);
    } catch (requestError) {
      handleRequestError(requestError);
    }
  };

  const updateNote = async (id, fields) => {
    setError('');
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...fields } : n))
    );
    setSelectedNote((prev) => (prev?.id === id ? { ...prev, ...fields } : prev));
    setSaving(true);
    try {
      const updatedNote = await noteService.updateNote(id, fields);
      setNotes((prev) =>
        prev.map((note) => (note.id === id ? updatedNote : note))
      );
      setSelectedNote((prev) => (prev?.id === id ? updatedNote : prev));
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
      const remaining = notes.filter((note) => note.id !== id);
      setNotes(remaining);
      if (selectedNote?.id === id) {
        setSelectedNote(remaining[0] || null);
      }
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

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
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
    <div className="page-container">
      <Header onLogout={logout} />
      <form onSubmit={submitSearch} style={{ padding: '12px 24px' }}>
        <label>
          Search notes
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title or content"
            aria-label="Search notes"
          />
        </label>
        <button type="submit">Search</button>
        {search && <button type="button" onClick={clearSearch}>Clear</button>}
      </form>
      {saving && <p style={{ padding: '0 24px' }}>Saving...</p>}
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
      <Footer />
    </div>
  );
}
