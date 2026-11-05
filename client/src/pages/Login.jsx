import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../api/auth';
import { useAuth, markLoggedIn } from '../context/AuthContext';
import { validateLogin } from '../utils/validators';
import { getApiError, getFieldErrors } from '../utils/errors';

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors]       = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading]     = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const clientErrors = validateLogin(form);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }
    setErrors({});
    setServerError('');
    setLoading(true);
    try {
      const res = await apiLogin({ email: form.email.trim(), password: form.password });
      setUser(res.data.user);
      markLoggedIn();
      navigate('/todos');
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      } else {
        setServerError(getApiError(err));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1>Welcome back</h1>
        <p className="subtitle">Log in to your account</p>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email" name="email" type="email" autoComplete="email"
              value={form.email} onChange={handleChange}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password" name="password" type="password" autoComplete="current-password"
              value={form.password} onChange={handleChange}
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading && <span className="spinner" />}
            Log in
          </button>
        </form>

        <p className="auth-link">
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

