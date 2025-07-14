import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCamera, FiX, FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import {
  registerStart,
  registerSuccess,
  registerFailure,
  togglePasswordVisibility,
} from '../features/auth/authSlice';

const SignupPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, showPassword } = useSelector((state) => state.auth);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        dispatch(registerFailure('Please select a valid image file (JPEG, PNG, GIF)'));
        return;
      }

      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        dispatch(registerFailure('Image size should be less than 2MB'));
        return;
      }

      setAvatar(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      dispatch(registerFailure("Passwords don't match"));
      return;
    }

    dispatch(registerStart());

    try {
      // Prepare JSON payload
      const payload = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
      };

      // Convert avatar to base64 if present
      if (avatar) {
        const reader = new FileReader();
        const base64Promise = new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(avatar);
        });
        payload.avatar = await base64Promise; // Add base64 string to payload
      }

      const response = await fetch('http://localhost:8002/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        dispatch(registerSuccess(data));
        navigate('/chat');
      } else {
        dispatch(registerFailure(data.detail || 'Registration failed'));
      }
    } catch (err) {
      dispatch(registerFailure('Network error. Please try again.'));
    }
  };

  // Password strength indicator
  const calculateStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const strength = calculateStrength();
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  const reviews = [
    {
      id: 1,
      name: 'Suresh Babu',
      role: 'Data Scientist',
      avatar: '/photos/Screenshot 2025-03-29 141410.png',
      rating: 5,
      comment: 'RAG Assistance has transformed how I work with documents. The AI suggestions save me hours every week!',
    },
    {
      id: 2,
      name: 'Rajesh Babu',
      role: 'Research Analyst',
      avatar: '/photos/Screenshot 2025-03-29 142639.png',
      rating: 4,
      comment: 'Incredible accuracy when summarizing complex reports. The voice input feature is a game-changer.',
    },
    {
      id: 3,
      name: 'Jagadeesh Patel',
      role: 'Content Manager',
      avatar: '/photos/WhatsApp Image 2025-06-21 at 13.13.20_38d995b0.jpg',
      rating: 5,
      comment: 'The document analysis is spot-on every time. Our team productivity has increased by 40%.',
    },
    {
      id: 4,
      name: 'Dr. James Ramana',
      role: 'Medical Researcher',
      avatar: '/photos/Screenshot 2025-03-29 142016.png',
      rating: 5,
      comment: 'Extracting insights from medical papers has never been easier. Reduced my literature review time by 60%.',
    },
    {
      id: 5,
      name: 'Emma Rodriguez',
      role: 'Legal Consultant',
      avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
      rating: 5,
      comment: 'The contract analysis features are incredibly precise. Found clauses I would have missed manually.',
    },
    {
      id: 6,
      name: 'Thomas Kim',
      role: 'Financial Analyst',
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
      rating: 4,
      comment: 'Game-changing for quarterly reports. The financial data extraction is 95% accurate in our tests.',
    },
    {
      id: 7,
      name: 'Olivia Smith',
      role: 'Academic Researcher',
      avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
      rating: 5,
      comment: 'Revolutionized my research workflow. The citation suggestions alone are worth the subscription.',
    },
    {
      id: 8,
      name: 'David Z',
      role: 'Product Manager',
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
      rating: 5,
      comment: 'Our teams go-to for competitive analysis. Extracts key insights from lengthy reports instantly.',
    },
    {
      id: 9,
      name: 'Aisha Mohammed',
      role: 'Journalist',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      rating: 4,
      comment: 'Fact-checking takes half the time now. The source verification tools are incredibly helpful.',
    },
    {
      id: 10,
      name: 'Daniel Brown',
      role: 'HR Director',
      avatar: 'https://randomuser.me/api/portraits/men/82.jpg',
      rating: 5,
      comment: 'Transformed our hiring process. Resume analysis is 3x faster with the same quality of candidate selection.',
    }
  ];

  const [currentReview, setCurrentReview] = useState(0);

  const nextReview = () => {
    setCurrentReview((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  const prevReview = () => {
    setCurrentReview((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  // Auto-rotate reviews
  useEffect(() => {
    const interval = setInterval(() => {
      nextReview();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center  bg-gradient-to-br from-dark-.dtd bg-blue-900 to-purple-900   overflow-hidden relative">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 opacity-30">
        <Canvas>
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
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
            repeatType: 'reverse',
          }}
        />
      ))}

      {/* Reviews Section (Left Side) */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="hidden lg:flex flex-col items-center justify-center w-full lg:w-1/2 p-8 z-10"
      >
        <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Trusted by Professionals</h3>
          
          <div className="relative h-64">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: index === currentReview ? 1 : 0,
                  scale: index === currentReview ? 1 : 0.9
                }}
                transition={{ duration: 0.5 }}
                className={`absolute inset-0 p-6 ${index === currentReview ? 'z-10' : 'z-0'}`}
              >
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 h-full flex flex-col">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <FiStar 
                        key={i} 
                        className={`${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} w-5 h-5`}
                      />
                    ))}
                  </div>
                  <p className="text-white italic mb-6 flex-grow">"{review.comment}"</p>
                  <div className="flex items-center mt-auto">
                    <img 
                      src={review.avatar} 
                      alt={review.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                    />
                    <div className="ml-4">
                      <h4 className="font-semibold text-white">{review.name}</h4>
                      <p className="text-sm text-white/80">{review.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center mt-6 space-x-2">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentReview(index)}
                className={`w-3 h-3 rounded-full transition-colors ${currentReview === index ? 'bg-white' : 'bg-white/30'}`}
              />
            ))}
          </div>

          <div className="flex justify-between mt-8">
            <button 
              onClick={prevReview}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <FiChevronLeft className="text-white text-xl" />
            </button>
            <button 
              onClick={nextReview}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <FiChevronRight className="text-white text-xl" />
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/20 w-full max-w-md mx-4 my-8 lg:my-0"
      >
        <div className="p-5 h-150 overflow-y-auto scrollbar-hide">

          <div className="text-center mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-block mb-4"
            >
              <div className="relative w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto ">
                {avatarPreview ? (
                  <>
                    <img 
                      src={avatarPreview} 
                      alt="Avatar preview" 
                      className="w-full h-full rounded-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1 text-white hover:bg-red-600 transition-colors"
                    >
                      <FiX size={12} />
                    </button>
                  </>
                ) : (
                  <span className='font-bold text-indigo-600'>RAG</span>
                )}
              </div>
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
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
            {/* Avatar Upload */}
            <div className="mb-6 flex justify-center">
              <label className="cursor-pointer">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  className="hidden"
                />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center px-4 py-2 bg-indigo-600/30 text-white rounded-lg border border-indigo-400/50 hover:bg-indigo-600/40 transition-colors"
                >
                  <FiCamera className="mr-2" />
                  {avatarPreview ? 'Change Avatar' : 'Upload Avatar'}
                </motion.div>
              </label>
            </div>

            {/* Rest of your form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-white/80 mb-2">
                  First Name
                </label>
                <motion.div whileFocus={{ scale: 1.01 }} className="relative">
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all pl-10"
                    placeholder="John"
                    required
                  />
                  <FiUser className="absolute left-3 top-3.5 text-white/50" />
                </motion.div>
              </div>
              
              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-white/80 mb-2">
                  Last Name
                </label>
                <motion.div whileFocus={{ scale: 1.01 }}>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                    placeholder="Doe"
                    required
                  />
                </motion.div>
              </div>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                Email Address
              </label>
              <motion.div whileFocus={{ scale: 1.01 }} className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all pl-10"
                  placeholder="your@email.com"
                  required
                />
                <FiMail className="absolute left-3 top-3.5 text-white/50" />
              </motion.div>
            </div>

            {/* Password */}
            <div className="mb-4 relative">
              <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                Password
              </label>
              <motion.div whileFocus={{ scale: 1.01 }} className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all pl-10 pr-12"
                  placeholder="••••••••"
                  required
                />
                <FiLock className="absolute left-3 top-3.5 text-white/50" />
                <button
                  type="button"
                  onClick={() => dispatch(togglePasswordVisibility())}
                  className="absolute right-3 top-3.5 text-white/50 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </motion.div>
              
              {/* Password strength meter */}
              {password && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2"
                >
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div 
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i <= strength ? strengthColors[strength - 1] : 'bg-gray-500/20'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs mt-1 text-white/70">
                    {strength < 3 ? 'Weak' : strength < 5 ? 'Good' : 'Strong'} password
                  </p>
                </motion.div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-6 relative">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80 mb-2">
                Confirm Password
              </label>
              <motion.div whileFocus={{ scale: 1.01 }} className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all pl-10"
                  placeholder="••••••••"
                  required
                />
                <FiLock className="absolute left-3 top-3.5 text-white/50" />
              </motion.div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all ${
                loading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-white text-blue-600 hover:bg-blue-50 hover:shadow-lg'
              }`}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Sign Up</span>
                  <motion.span
                    animate={isHovered ? { rotate: [0, 10, -10, 0] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <FiUser size={18} />
                  </motion.span>
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/70 text-sm">
              Already have an account?{' '}
              <motion.a 
                href="/login" 
                className="text-white font-medium hover:underline"
                whileHover={{ scale: 1.05 }}
              >
                Sign in
              </motion.a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;