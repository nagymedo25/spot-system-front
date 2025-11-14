import React from 'react';
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

  const AdminRoute = ({ children }) => {
    return user && user.role === 'admin' ? children : <Navigate to="/login" />;
  };

  const TeacherRoute = ({ children }) => {
    return user && user.role === 'teacher' ? children : <Navigate to="/login" />;
  };

  return (
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
  );
}

export default App;