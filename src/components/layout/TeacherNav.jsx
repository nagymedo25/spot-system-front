import { NavLink } from 'react-router-dom';

const TeacherNav = () => {
  const linkStyle = "py-3 px-5 rounded-lg font-medium transition-colors";
  const activeStyle = "bg-spot-cyan text-black shadow-cyan-glow";
  const inactiveStyle = "text-spot-light hover:bg-spot-darker";

  return (
    <nav className="flex justify-center items-center gap-4 mb-8 bg-spot-dark/50 border border-spot-blue/30 rounded-lg p-2 max-w-lg mx-auto">
      <NavLink 
        to="/teacher" 
        end // 'end' prop is crucial for NavLink to not match nested routes
        className={({ isActive }) => `${linkStyle} ${isActive ? activeStyle : inactiveStyle}`}
      >
        طلابي
      </NavLink>
      <NavLink 
        to="/teacher/report" 
        className={({ isActive }) => `${linkStyle} ${isActive ? activeStyle : inactiveStyle}`}
      >
        إنشاء تقرير أسبوعي
      </NavLink>
      <NavLink 
        to="/teacher/reports/manage" 
        className={({ isActive }) => `${linkStyle} ${isActive ? activeStyle : inactiveStyle}`}
      >
        إدارة التقارير
      </NavLink>
    </nav>
  );
};

export default TeacherNav;