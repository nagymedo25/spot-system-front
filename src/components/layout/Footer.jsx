import React from 'react';
import Logo from '../../assets/images/Logo.png';

const Footer = () => {
  return (
    <footer className="relative z-10">
      <div className="footer-waves-container">
        <svg
          className="footer-waves-svg"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 24 150 28"
          preserveAspectRatio="none"
          shapeRendering="auto"
        >
          <defs>
            <path
              id="gentle-wave"
              d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
            />
          </defs>
          <g className="parallax">
            <use xlinkHref="#gentle-wave" x="48" y="0" />
            <use xlinkHref="#gentle-wave" x="48" y="3" />
            <use xlinkHref="#gentle-wave" x="48" y="5" />
            <use xlinkHref="#gentle-wave" x="48" y="7" />
          </g>
        </svg>
      </div>

      <div className="footer-content relative z-10 text-center text-white py-10 px-4 sm:px-6 lg:px-8">
        <img className="h-12 mx-auto mb-4" src={Logo} alt="SPOT Logo" />

        <div className="mb-4">
          <a
            href="#"
            className="text-spot-light/70 hover:text-spot-cyan transition-colors mx-2"
          >
            الشروط والأحكام
          </a>
          <span className="text-spot-light/30 mx-2">|</span>
          <a
            href="#"
            className="text-spot-light/70 hover:text-spot-cyan transition-colors mx-2"
          >
            سياسة الخصوصية
          </a>
        </div>

        <p className="text-spot-light/70 text-sm">
          &copy; 2025 SPOT. جميع الحقوق محفوظة.
        </p>

        <p className="text-spot-light/50 text-xs mt-2">
          Developed by{' '}
          <a
            target='_blank'
            href="https://www.facebook.com/mahmoud.nagy.463807"
            className="text-spot-cyan/70 hover:text-spot-cyan transition-colors"
          >
            Mahmoud Nagy
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;