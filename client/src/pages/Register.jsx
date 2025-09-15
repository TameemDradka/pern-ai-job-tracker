import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import FormField from '../components/FormField';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');

  function validate() {
    const errs = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address';
    if (!password || password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (confirm !== password) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setGeneralError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      await register(email, password); // note: auth provider already redirects, but we want success message using navigate
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      if (err && err.status === 409) {
        setErrors(prev => ({ ...prev, email: 'Email already registered' }));
      } else {
        setGeneralError(err.message || 'Registration failed');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Create your account</h1>
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
            autoComplete="new-password"
          />
          <FormField
            id="confirm"
            label="Confirm Password"
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            error={errors.confirm}
            required
            autoComplete="new-password"
          />

          {generalError && <div className="mb-4 text-sm text-red-600" role="alert">{generalError}</div>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}
