import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import noteService from '../services/noteService';
import Header from '../components/Header';
import homeStyles from './Home.module.css';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [noteCount, setNoteCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [isLightMode, setIsLightMode] = useState(() => !document.body.classList.contains('dark-mode'));

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [userResponse, notes] = await Promise.all([
          api.get('/auth/me'),
          noteService.listNotes(),
        ]);
        setUser(userResponse.data.data);
        setNoteCount(notes.length);

        const totalWords = notes.reduce((total, note) => {
          const html = document.createElement('div');
          html.innerHTML = note.content || '';
          const words = (html.textContent || '').trim().match(/\S+/g);
          return total + (words ? words.length : 0);
        }, 0);
        setWordCount(totalWords);
      } catch (err) {
        setError(err?.response?.data?.error || 'Failed to fetch user');
      }
    };
    fetchProfile();
  }, []);

  const toggleTheme = () => {
    const nextLightMode = !isLightMode;
    setIsLightMode(nextLightMode);
    document.body.classList.toggle('dark-mode', !nextLightMode);
  };

  const logout = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('auth-changed'));
    window.location.href = '/login';
  };

  return (
    <div className="workspace-page">
      <Header navigation={<><Link to="/">Home</Link><span>|</span><Link to="/profile">Profile</Link></>}>
        <button type="button" className={homeStyles.themeToggle} onClick={toggleTheme} title="Toggle light/dark mode">
          {isLightMode ? '🌙 Dark' : '☀️ Light'}
        </button>
        <button type="button" className={homeStyles.logoutButton} onClick={logout}>
          Logout
        </button>
      </Header>
      <main className={homeStyles.profilePage}>
        <section className={homeStyles.profileCard}>
          <h2>Profile</h2>
          {error && <p role="alert" className={homeStyles.shareError}>{error}</p>}
          {user ? (
            <>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <div className={homeStyles.profileStats}>
                <div className={homeStyles.profileStat}>
                  <strong>{noteCount}</strong>
                  <span>{noteCount === 1 ? 'Note' : 'Notes'}</span>
                </div>
                <div className={homeStyles.profileStat}>
                  <strong>{wordCount}</strong>
                  <span>{wordCount === 1 ? 'Word' : 'Words'}</span>
                </div>
              </div>
            </>
          ) : (
            !error && <p>Loading user...</p>
          )}
        </section>
      </main>
    </div>
  );
}
