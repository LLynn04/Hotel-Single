import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const VerifyNotice = () => {
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const checkVerification = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const data = await res.json();

        if (res.ok && data.email_verified_at) {
          localStorage.setItem("role", data.role);
          localStorage.removeItem("pendingVerificationEmail");
          navigate(data.role === "admin" ? "/admin" : "/");
        }
      } catch (err) {
        console.error("Error checking verification status:", err);
      }
    };

    checkVerification();
    intervalId = setInterval(checkVerification, 5000);

    return () => clearInterval(intervalId);
  }, [navigate, token]);

  const resendVerification = async () => {
    try {
      const email = localStorage.getItem("pendingVerificationEmail");
      const res = await fetch("http://127.0.0.1:8000/api/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setInfo(data.message || "Verification email resent.");
      } else {
        setError(data.message || "Failed to resend verification email.");
      }
    } catch {
      setError("Network error while resending verification email.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-6">
      <h1 className="text-3xl font-bold mb-4">Verify Your Email</h1>
      <p className="text-center text-lg max-w-md mb-6">
        A verification link has been sent to your email. Please check your inbox
        and spam folder.
        <br />
        After verifying, this page will automatically redirect you.
      </p>

      <button
        onClick={resendVerification}
        className="text-indigo-400 hover:text-indigo-600 font-semibold"
      >
        Resend Verification Email
      </button>
      <p className="mt-8 text-center text-gray-400">
        <a
          href="/sign-in"
          className="text-indigo-400 hover:text-indigo-600 font-semibold"
        >
          Go to Login
        </a>
      </p>

      {info && <p className="mt-4 text-green-400">{info}</p>}
      {error && <p className="mt-4 text-red-400">{error}</p>}
    </div>
  );
};

export default VerifyNotice;
