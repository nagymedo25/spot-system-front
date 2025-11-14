import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Logo from '../../assets/images/Logo.jpeg';

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
    <nav className="bg-spot-darker/80 backdrop-blur-sm shadow-lg sticky top-0 z-50">
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
                  className="bg-spot-accent hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  تسجيل الخروج
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-spot-blue hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
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