import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

/* ================= PASSWORD STRENGTH ================= */
const PasswordStrength = ({ password }) => {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  const levels = ["Very Weak", "Weak", "Medium", "Strong", "Very Strong"];
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
  ];

  return (
    password && (
      <div className="mb-4">
        <div className="flex gap-1 mb-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded ${
                strength > i ? colors[strength - 1] : "bg-gray-700"
              }`}
            ></div>
          ))}
        </div>

        <p className="text-xs text-gray-400">
          Strength: <span className="font-semibold">{levels[strength]}</span>
        </p>
      </div>
    )
  );
};

/* ================= CAPTCHA ================= */
const generateCaptcha = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let text = "";
  for (let i = 0; i < 5; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
};

/* ================= SIGNUP ================= */
const Signup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [captchaText, setCaptchaText] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCaptchaText(generateCaptcha());
  }, []);

  const refreshCaptcha = () => {
    setCaptchaText(generateCaptcha());
    setCaptchaInput("");
  };

  const handleSignup = async () => {
    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    if (captchaInput !== captchaText) {
      alert("Captcha incorrect ❌");
      refreshCaptcha();
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
  `${import.meta.env.VITE_API_URL}/api/auth/signup`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  }
);

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Signup failed");
        return;
      }

      // ✅ OPTIONAL: auto-login after signup
      if (data?.token) {
        localStorage.setItem("token", data.token);
      } else if (data?.accessToken) {
        localStorage.setItem("token", data.accessToken);
      }

      alert("Signup successful ✅");

      // Redirect
      window.location.href = "/events";
      // OR: navigate("/login");
    } catch (err) {
      alert("Server error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page min-h-screen flex items-center justify-center px-4 bg-black">
      <div className="bg-zinc-900/90 backdrop-blur-md p-8 rounded-xl w-full max-w-md shadow-xl">
        <h2 className="text-3xl font-bold text-center mb-6">
          Create <span className="text-orange-500">Account</span>
        </h2>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 mb-4 bg-black rounded outline-none focus:ring-2 focus:ring-orange-500"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 bg-black rounded outline-none focus:ring-2 focus:ring-orange-500"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-2 bg-black rounded outline-none focus:ring-2 focus:ring-orange-500"
        />

        <PasswordStrength password={password} />

        {/* CAPTCHA */}
        <div className="mb-4">
          <div className="flex items-center justify-between bg-black p-3 rounded mb-2">
            <span className="tracking-widest font-mono select-none">
              {captchaText}
            </span>
            <button
              onClick={refreshCaptcha}
              className="text-sm text-orange-500 hover:underline"
            >
              Refresh
            </button>
          </div>

          <input
            type="text"
            placeholder="Enter captcha"
            value={captchaInput}
            onChange={(e) => setCaptchaInput(e.target.value)}
            className="w-full p-3 bg-black rounded outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-orange-500 text-black py-3 rounded font-semibold hover:bg-orange-600 disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p className="text-sm text-gray-400 text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-orange-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
