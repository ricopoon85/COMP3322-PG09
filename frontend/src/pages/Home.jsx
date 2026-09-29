import { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Editor from '../components/Editor';

const MOCK_NOTES = [
  {
    id: 1,
    title: 'Test Note',
    content: 'You can edit here.',
    created_at: new Date().toISOString(),
  },
];

export default function Home() {
  const [notes, setNotes] = useState(MOCK_NOTES);
  const [selectedNote, setSelectedNote] = useState(MOCK_NOTES[0]);

  // create locally 
  const createNote = () => {
    const newNote = {
      id: Date.now(),
      title: 'Untitled Note',
      content: '',
      created_at: new Date().toISOString(),
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
  };

  // update locally
  const updateNote = (id, fields) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...fields } : n))
    );
    if (selectedNote?.id === id) {
      setSelectedNote((prev) => ({ ...prev, ...fields }));
    }
  };

  // delete locally
  const deleteNote = (id) => {
    const remaining = notes.filter((n) => n.id !== id);
    setNotes(remaining);
    if (selectedNote?.id === id) {
      setSelectedNote(remaining[0] || null);
    }
  };

  return (
    <div className="workspace-page">
      <Header />
      <div className="content">
        <Sidebar
          notes={notes}
          selectedId={selectedNote?.id}
          onSelect={setSelectedNote}
          onCreate={createNote}
          onDelete={deleteNote}
        />
        {selectedNote ? (
          <Editor
            note={selectedNote}
            onTitleChange={(title) => updateNote(selectedNote.id, { title })}
            onContentChange={(content) =>
              updateNote(selectedNote.id, { content })
            }
          />
        ) : (
          <main style={{ padding: 24 }}>
            <p>No notes yet — create your first one!</p>
          </main>
        )}
      </div>
    </div>
  );
}