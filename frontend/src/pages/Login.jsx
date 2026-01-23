import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);

  // 🔐 Send OTP (Demo)
  const sendOtp = () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setStep(2);
    setTimer(30);

    alert(`Demo OTP: ${newOtp}`); // demo only
  };

  // ⏳ OTP Timer
  useEffect(() => {
    if (step === 2 && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  // 🔁 Resend OTP
  const resendOtp = () => {
    if (timer === 0) {
      sendOtp();
    }
  };

  // ✅ Verify OTP + BACKEND LOGIN
  const verifyOtp = async () => {
    if (otp !== generatedOtp) {
      alert("Invalid OTP ❌");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      // 🔥 SAVE TOKEN (THIS WAS MISSING)
      localStorage.setItem("token", data.token);

      alert("Login Successful ✅");

      // 🔁 Force reload so navbar updates
      const payload = JSON.parse(atob(data.token.split(".")[1]));

      if (payload.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/events";
      }
    } catch (err) {
      alert("Server error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="page min-h-screen bg-cover bg-center relative flex items-center justify-center px-4"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1497032628192-86f99bcd76bc')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* Login Card */}
      <div className="relative z-10 bg-zinc-900/90 backdrop-blur-xl p-8 rounded-2xl w-full max-w-md shadow-2xl border border-white/10">
        <h2 className="text-3xl font-bold text-center mb-6">
          Login to <span className="text-orange-500">Eventify</span>
        </h2>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mb-4 bg-black/60 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            />

            <div className="relative mb-6">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-black/60 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 cursor-pointer text-gray-400 text-sm"
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>

            <button
              onClick={sendOtp}
              className="w-full bg-orange-500 text-black py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
            >
              Send OTP
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-3 mb-4 bg-black/60 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            />

            <button
              onClick={verifyOtp}
              disabled={loading}
              className="w-full bg-orange-500 text-black py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify OTP & Login"}
            </button>

            <p className="text-sm text-gray-400 text-center mt-4">
              {timer > 0 ? (
                <>
                  Resend OTP in{" "}
                  <span className="text-orange-500">{timer}s</span>
                </>
              ) : (
                <button
                  onClick={resendOtp}
                  className="text-orange-500 hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </p>
          </>
        )}

        {/* Signup Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-orange-500 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
