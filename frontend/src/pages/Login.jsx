import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
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
      navigate('/notes');
    } catch (err) {
        const errMsg = err?.response?.data?.error || 'Login failed';
        setMsg(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email" />
      <input value={password} onChange={e => setPassword(e.target.value)} placeholder="password" type="password" />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      <div>{msg}</div>
      <p>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </form>
  );
}