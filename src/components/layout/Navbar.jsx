import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Logo from '../../assets/images/Logo.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (user.role === 'admin') return '/admin';
    if (user.role === 'teacher') return '/teacher';
    return '/';
  };

  return (
    <nav className="navbar-bg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link to="/">
              <img className="h-10" src={Logo} alt="SPOT Logo" />
            </Link>
          </div>
          <div className="flex items-center space-x-4 space-x-reverse">
            {user ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="text-spot-light hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  لوحة التحكم
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-transparent text-spot-cyan border-2 border-spot-cyan font-bold px-5 py-2 rounded-lg text-sm transition-all hover:bg-spot-cyan hover:text-black hover:shadow-cyan-glow"
                >
                  تسجيل الخروج
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-spot-cyan text-black font-bold px-5 py-2 rounded-lg text-sm transition-all border-2 border-transparent hover:bg-transparent hover:border-spot-cyan hover:text-spot-cyan hover:shadow-cyan-glow"
              >
                تسجيل الدخول
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;