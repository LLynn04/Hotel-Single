import React from 'react';

const bgImageUrl =
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';

const SignIn: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-700 via-indigo-800 to-blue-900 text-white font-sans">
      {/* Left Image Panel */}
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

      {/* Right Form Panel */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-10 bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-900 rounded-l-3xl shadow-2xl">
        <div className="w-full max-w-md">
          <h2 className="text-4xl font-bold mb-8 tracking-tight text-center">Sign In</h2>

          <form className="space-y-6">
            <input
              type="email"
              placeholder="Email Address"
              required
              className="w-full px-5 py-3 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <input
              type="password"
              placeholder="Password"
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

          <p className="mt-8 text-center text-gray-400">
            Don't have an account?{' '}
            <a href="/signup" className="text-indigo-400 hover:text-indigo-600 font-semibold">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
