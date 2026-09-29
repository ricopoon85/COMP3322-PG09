import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

import styles from './Auth.module.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { username, email, password });
      setMsg('Registered: ' + res.data.data.username);
      setMsgType('success');
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      const errMsg = err?.response?.data?.error || 'Register failed';
      setMsg(errMsg);
      setMsgType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2>Register</h2>
        <input className={styles.input} value={username} onChange={e => setUsername(e.target.value)} placeholder="Your username" />
        <input className={styles.input} value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email" />
        <input className={styles.input} value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" type="password" />
        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
        <div className={`${styles.message} ${msgType === 'success' ? styles.success : styles.error}`}>{msg}</div>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}