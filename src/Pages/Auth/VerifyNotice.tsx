// import React from 'react';
import { Link } from 'react-router-dom';

const VerifyNotice = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-6">
      <h1 className="text-3xl font-bold mb-4">Verify Your Email</h1>
      <p className="text-center text-lg max-w-md mb-8">
        A verification link has been sent to your email. Please check your inbox (and spam folder).
      </p>

      <div className="space-x-4">
        <Link to="/sign-in" className="text-indigo-400 hover:text-indigo-600 font-semibold">
          Go to Login
        </Link>
        <Link to="/resend-verification" className="text-indigo-400 hover:text-indigo-600 font-semibold">
          Resend Verification Email
        </Link>
      </div>
    </div>
  );
};

export default VerifyNotice;
