import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import FormField from '../components/FormField';
import { showToast } from '../lib/toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  useEffect(() => {
    if (location.state && location.state.registered) {
      setRegisteredSuccess(true);
      // Clear the navigation state so refresh doesn't keep message
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  function validate() {
    const errs = {};
    if (!email) errs.email = 'Email is required';
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setGeneralError('');
    try {
      await login(email, password);
      showToast({ type: 'success', message: 'Logged in' });
      navigate('/', { replace: true });
    } catch (err) {
      if (err && err.status === 401) {
        setGeneralError('Invalid email or password');
        showToast({ type: 'error', message: 'Invalid email or password' });
      } else {
        setGeneralError(err.message || 'Login failed');
        showToast({ type: 'error', message: err.message || 'Login failed' });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Log in</h1>

        {registeredSuccess && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 border border-green-200" role="status">
            Account created successfully. You can now log in.
          </div>
        )}

        <form onSubmit={onSubmit} noValidate>
          <FormField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            error={errors.email}
            required
            autoComplete="email"
          />
          <FormField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            error={errors.password}
            required
            autoComplete="current-password"
          />

          {generalError && <div className="mb-4 text-sm text-red-600" role="alert">{generalError}</div>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Signing in...' : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Need an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  );
}
