import React, { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';

// import AdminDashboard from './pages/admin/AdminDashboard';
// import ManageTeachers from './pages/admin/ManageTeachers';
// import TeacherDashboard from './pages/teacher/TeacherDashboard';
// import MyStudents from './pages/teacher/MyStudents';
// import CreateReport from './pages/teacher/CreateReport';
import HomePage from './pages/parent/HomePage';
import ReportView from './pages/parent/ReportView';
import Login from './pages/Auth/Login';
import NotFound from './pages/NotFound';

function App() {
  const { user } = useAuth();
  const cursorRef = useRef(null);

  useEffect(() => {
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) {
      return;
    }

    const cursor = cursorRef.current;
    if (!cursor) return;

    const onMouseMove = (e) => {
      cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    };

    const onMouseDown = (e) => {
      if (e.button === 0) {
        cursor.classList.add('clicking');
        let ripple = document.createElement('div');
        ripple.className = 'click-ripple';
        document.body.appendChild(ripple);
        ripple.style.left = `${e.clientX}px`;
        ripple.style.top = `${e.clientY}px`;
        setTimeout(() => {
          ripple.remove();
        }, 600);
      }
    };

    const onMouseUp = (e) => {
      if (e.button === 0) {
        cursor.classList.remove('clicking');
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);

    const links = document.querySelectorAll('a, button, .details-button, .teacher-container');
    const onLinkEnter = () => cursor.classList.add('hover');
    const onLinkLeave = () => cursor.classList.remove('hover');

    const observer = new MutationObserver(() => {
      const newLinks = document.querySelectorAll('a, button, .details-button, .teacher-container');
      newLinks.forEach((link) => {
        link.removeEventListener('mouseenter', onLinkEnter);
        link.removeEventListener('mouseleave', onLinkLeave);
        link.addEventListener('mouseenter', onLinkEnter);
        link.addEventListener('mouseleave', onLinkLeave);
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    links.forEach((link) => {
      link.addEventListener('mouseenter', onLinkEnter);
      link.addEventListener('mouseleave', onLinkLeave);
    });

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      links.forEach((link) => {
        link.removeEventListener('mouseenter', onLinkEnter);
        link.removeEventListener('mouseleave', onLinkLeave);
      });
      observer.disconnect();
    };
  }, []);


  const AdminRoute = ({ children }) => {
    return user && user.role === 'admin' ? children : <Navigate to="/login" />;
  };

  const TeacherRoute = ({ children }) => {
    return user && user.role === 'teacher' ? children : <Navigate to="/login" />;
  };

  return (
    <>
      <div className="custom-cursor" ref={cursorRef}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 2.99l.71-.71L12 2z" />
        </svg>
      </div>
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/report-view" element={<ReportView />} />
        
        <Route path="/login" element={!user ? <Login /> : (user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/teacher" />)} />

        {/* <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>}>
          <Route index element={<ManageTeachers />} />
        </Route>

        <Route path="/teacher" element={<TeacherRoute><TeacherDashboard /></TeacherRoute>}>
          <Route index element={<MyStudents />} />
          <Route path="report" element={<CreateReport />} />
        </Route> */}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;