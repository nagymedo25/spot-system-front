import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/images/Logo.jpeg';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-spot-dark text-white p-4">
      <img className="h-20 mx-auto mb-8" src={Logo} alt="SPOT Logo" />
      <h1 className="text-9xl font-extrabold text-spot-accent tracking-widest">404</h1>
      <div className="bg-spot-darker px-4 py-2 rounded-md text-lg font-medium mb-6">
        الصفحة غير موجودة
      </div>
      <p className="text-xl text-spot-light mb-8 text-center max-w-md">
        عذراً، لا يمكننا العثور على الصفحة التي تبحث عنها.
      </p>
      <Link
        to="/"
        className="py-3 px-6 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-spot-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spot-blue transition-all"
      >
        العودة إلى الرئيسية
      </Link>
    </div>
  );
};

export default NotFound;