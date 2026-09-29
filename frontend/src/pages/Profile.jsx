import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.data);
      } catch (err) {
        setError(err?.response?.data?.error || 'Failed to fetch user');
      }
    };
    fetchMe();
  }, []);

  return (
    <div>
      <h2>Profile</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {user ? (
        <div>
          <p>Logged in as: {user.username} ({user.email})</p>
          <p>Notes feature not implemented yet.</p>
        </div>
      ) : (
        <p>Loading user...</p>
      )}
    </div>
  );
}
