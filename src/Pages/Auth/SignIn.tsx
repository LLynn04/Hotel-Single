import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const bgImageUrl =
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';

const SignIn: React.FC = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [showResend, setShowResend] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setInfo('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setShowResend(false);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      // Debug: Log the entire response to see what we're getting
      console.log('Login response data:', data);
      console.log('User object:', data.user);
      console.log('User object keys:', Object.keys(data.user));
      console.log('Full user object stringified:', JSON.stringify(data.user, null, 2));

      if (res.ok && data.access_token) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('role', data.user.role);

        // Admin bypass verification, redirect immediately
        if (data.user.role === 'admin') {
          navigate('/admin');
          return;
        }

        // For normal users: check email verification status
        const isVerified = data.user.email_verified_at || data.user.is_verified;

        console.log('Verification check results:');
        console.log('email_verified_at:', data.user.email_verified_at);
        console.log('is_verified:', data.user.is_verified);
        console.log('Final isVerified:', isVerified);

        if (isVerified) {
          console.log('User is verified, redirecting to homepage');
          localStorage.removeItem('pendingVerificationEmail');
          navigate('/');
        } else {
          console.log('User is NOT verified, redirecting to verify-notice');
          localStorage.setItem('pendingVerificationEmail', form.email);
          navigate('/verify-notice');
        }
      } else if (data.message) {
        setError(data.message);
        // Check for verification-related messages
        const needsVerification = data.message.toLowerCase().includes('verify') ||
                                data.message.toLowerCase().includes('unverified') ||
                                data.message.toLowerCase().includes('confirm');
        
        if (needsVerification) {
          setShowResend(true);
          localStorage.setItem('pendingVerificationEmail', form.email);
        }
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please check your connection and try again.');
    }
  };

  const handleResendVerification = async () => {
    setInfo('');
    setError('');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();

      if (res.ok) {
        setInfo(data.message || 'Verification email sent. Please check your inbox.');
        setShowResend(false);
      } else {
        setError(data.message || 'Failed to resend verification email.');
      }
    } catch (err) {
      console.error('Resend verification error:', err);
      setError('Network error when resending verification email.');
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-700 via-indigo-800 to-blue-900 text-white font-sans">
      <div
        className="hidden md:block md:w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${bgImageUrl})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center px-10">
          <h1 className="text-5xl font-extrabold mb-4 tracking-wide drop-shadow-lg">
            Welcome Back!
          </h1>
          <p className="max-w-sm text-lg font-light drop-shadow">
            Sign in to continue your journey with us.
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-10 bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-900 rounded-l-3xl shadow-2xl">
        <div className="w-full max-w-md">
          <h2 className="text-4xl font-bold mb-8 tracking-tight text-center">Sign In</h2>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-xl text-lg font-semibold hover:brightness-110 transition duration-300"
            >
              Sign In
            </button>
          </form>

          {error && (
            <div className="mt-4 text-center text-red-400">
              <p>{error}</p>
              {showResend && (
                <>
                  <button
                    onClick={handleResendVerification}
                    className="mt-2 underline text-indigo-400 hover:text-indigo-600"
                  >
                    Resend Verification Email
                  </button>
                  <div className="mt-2">
                    <a
                      href="/verify-notice"
                      className="underline text-sm text-gray-300 hover:text-indigo-400"
                    >
                      Go to verification instructions
                    </a>
                  </div>
                </>
              )}
            </div>
          )}

          {info && <p className="mt-4 text-center text-green-400">{info}</p>}

          <p className="mt-8 text-center text-gray-400">
            Don't have an account?{' '}
            <a href="/sign-up" className="text-indigo-400 hover:text-indigo-600 font-semibold">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;