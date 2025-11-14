import React from 'react';
import Logo from '../../assets/images/Logo.jpeg';

const Footer = () => {
  return (
    <footer className="mt-20 border-t border-spot-blue/30 relative z-10 bg-spot-darker">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 text-center">
        <img className="h-12 mx-auto mb-4" src={Logo} alt="SPOT Logo" />
        <p className="text-spot-light/70 text-sm">
          &copy; 2025 SPOT. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
};

export default Footer;