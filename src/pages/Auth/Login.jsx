import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Logo from '../../assets/images/Logo.jpeg';
import LoginBg from '../../assets/images/image3.jpeg';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'teacher') {
        navigate('/teacher');
      }
    } catch (err) {
      setError('فشل تسجيل الدخول. يرجى التحقق من البريد الإلكتروني أو كلمة المرور.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-spot-dark p-4" style={{ backgroundImage: `url(${LoginBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <motion.div 
        className="bg-spot-darker/90 backdrop-blur-md p-8 md:p-12 rounded-2xl shadow-2xl w-full max-w-md border border-spot-blue/30"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/">
          <img className="h-16 mx-auto mb-6" src={Logo} alt="SPOT Logo" />
        </Link>
        <h2 className="text-3xl font-bold text-center text-white mb-8">تسجيل الدخول</h2>
        
        {error && <p className="bg-red-900/50 text-red-300 p-3 rounded-md text-center mb-4">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-spot-light mb-2">
              البريد الإلكتروني
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-spot-dark text-white border border-spot-blue/50 rounded-lg focus:ring-2 focus:ring-spot-accent focus:border-spot-accent outline-none transition-all"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-spot-light mb-2">
              كلمة المرور
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-spot-dark text-white border border-spot-blue/50 rounded-lg focus:ring-2 focus:ring-spot-accent focus:border-spot-accent outline-none transition-all"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-spot-accent hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spot-accent transition-all disabled:opacity-50"
            >
              {loading ? 'جارِ الدخول...' : 'تسجيل الدخول'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;