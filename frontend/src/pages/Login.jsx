import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

import styles from './Auth.module.css';

export default function Login() {
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
      const res = await api.post('/auth/login', { email, password });
      const token = res.data.data.token;

      localStorage.setItem('token', token);
      setMsg('Login success');
      setMsgType('success');
      navigate('/notes');
    } catch (err) {
        const errMsg = err?.response?.data?.error || 'Login failed';

        setMsg(errMsg);
        setMsgType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input className={styles.input} value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email" />
      <input className={styles.input} value={password} onChange={e => setPassword(e.target.value)} placeholder="password" type="password" />
      <button className={styles.button} type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      <div className={`${styles.message} ${msgType === 'success' ? styles.success : styles.error}`}>{msg}</div>
      <p>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </form>
  );
}