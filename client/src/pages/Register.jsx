import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as apiRegister } from '../api/auth';
import { useAuth, markLoggedIn } from '../context/AuthContext';
import { validateRegister } from '../utils/validators';
import { getApiError, getFieldErrors } from '../utils/errors';

export default function Register() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors]       = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading]     = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear field error on change
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const clientErrors = validateRegister(form);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }
    setErrors({});
    setServerError('');
    setLoading(true);
    try {
      const res = await apiRegister({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
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
        <h1>Create account</h1>
        <p className="subtitle">Join to manage your todos</p>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name" name="name" type="text" autoComplete="name"
              value={form.name} onChange={handleChange}
              className={errors.name ? 'error' : ''}
              maxLength={50}
            />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>

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
              id="password" name="password" type="password" autoComplete="new-password"
              value={form.password} onChange={handleChange}
              className={errors.password ? 'error' : ''}
              maxLength={72}
            />
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password"
              value={form.confirmPassword} onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
              maxLength={72}
            />
            {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading && <span className="spinner" />}
            Create account
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

