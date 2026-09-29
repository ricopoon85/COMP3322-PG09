import { useCallback, useEffect, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Editor from '../components/Editor';
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
    </div>
  );
}
