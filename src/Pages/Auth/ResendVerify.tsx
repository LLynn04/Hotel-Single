import React, { useState } from 'react';

const ResendVerify: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleResend = async () => {
    setStatus('');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus(data.message || 'Verification email sent. Please check your inbox.');
        setTimeout(() => {
          window.location.href = '/verify-notice';
        }, 3000);
      } else {
        setStatus(data.message || 'Something went wrong.');
      }
    } catch {
      setStatus('Network error while resending verification email.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-6">
      <h2 className="text-2xl font-bold mb-4">Didn't get the email?</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        className="px-4 py-2 rounded bg-gray-800 text-white mb-4"
      />
      <button
        onClick={handleResend}
        className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700"
      >
        Resend Verification Email
      </button>
      {status && <p className="mt-4 text-sm text-green-400">{status}</p>}
    </div>
  );
};

export default ResendVerify;
