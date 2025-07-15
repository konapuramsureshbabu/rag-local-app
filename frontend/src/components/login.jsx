import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiLogIn } from "react-icons/fi";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  togglePasswordVisibility,
} from "../features/auth/authSlice";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, showPassword } = useSelector((state) => state.auth);

  // Environment variables for authentication
  const VALID_USERNAME = import.meta.env.VITE_USERNAME;
  const VALID_PASSWORD = import.meta.env.VITE_PASSWORD;

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());
    try {
  
        if (email === VALID_USERNAME && password === VALID_PASSWORD) {
          dispatch(loginSuccess({ username: email }));
          navigate("/chat");
        } 
       else {
        const formData = new URLSearchParams();
        formData.append("username", email); // Adjust to "email" if API expects it
        formData.append("password", password);

        const response = await fetch(`${import.meta.env.VITE_BE_BASE}:${import.meta.env.VITE_BE_PORT}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: formData,
        });

        const data = await response.json(); // Parse the response body

        if (response.ok) {
          // Check if user.email exists in the response
          if (data.user && data.user.email) {
            dispatch(loginSuccess(data.user.email));
            navigate("/chat");
          }
        }
      }
    } catch (err) {
      console.error("Login Error:", err); 
      dispatch(loginFailure("Network error: " + err.message));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 to-purple-900 overflow-hidden relative">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 opacity-30">
        <Canvas>
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />
        </Canvas>
      </div>

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white opacity-10"
          style={{
            width: Math.random() * 10 + 5,
            height: Math.random() * 10 + 5,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, (Math.random() - 0.5) * 100],
            x: [0, (Math.random() - 0.5) * 50],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/20 w-full max-w-md mx-4"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-block mb-4"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto ">
                <span className="font-bold text-indigo-600">RAG</span>
                <FiLogIn className="text-indigo-600 text-2xl" />
              </div>
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-white/80">Sign in to your account</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-red-500/20 text-red-100 rounded-lg text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white/80 mb-2"
              >
                {VALID_USERNAME ? "Username" : "Email Address"}
              </label>
              <motion.div whileFocus={{ scale: 1.01 }}>
                <input
                  type={VALID_USERNAME ? "text" : "email"}
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                  placeholder={
                    VALID_USERNAME ? "Enter username" : "your@email.com"
                  }
                  required
                />
              </motion.div>
            </div>

            <div className="mb-8 relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white/80 mb-2"
              >
                Password
              </label>
              <motion.div whileFocus={{ scale: 1.01 }}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all pr-12"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </motion.div>
              <button
                type="button"
                onClick={() => dispatch(togglePasswordVisibility())}
                className="absolute right-3 top-[42px] text-white/50 hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all ${
                loading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-white text-indigo-600 hover:bg-indigo-50 hover:shadow-lg"
              }`}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <motion.span
                    animate={isHovered ? { x: [0, 2, 0] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <FiLogIn size={18} />
                  </motion.span>
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/70 text-sm">
              Don't have an account?{" "}
              <motion.a
                href="/signup"
                className="text-white font-medium hover:underline"
                whileHover={{ scale: 1.05 }}
              >
                Sign up
              </motion.a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
