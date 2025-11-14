import React, { useState, useEffect, useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ParticlesBackground from '../../components/common/ParticlesBackground';

import Logo from '../../assets/images/Logo.png';
import heroBg from '../../assets/images/image3.jpeg';
import teacherAvatar1 from '../../assets/images/image4.jpeg';
import teacherAvatar2 from '../../assets/images/image2.jpeg';

const HomePage = () => {
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const lightningOptions = {
    fpsLimit: 60,
    particles: {
      number: { value: 30, density: { enable: true } },
      color: { value: '#00f0ff' },
      shape: { type: 'circle' },
      opacity: { value: 0.5, random: true },
      size: { value: 1, max: 2 },
      move: {
        enable: true,
        speed: 4,
        direction: 'none',
        random: true,
        straight: true,
        outModes: 'out',
      },
      links: {
        enable: true,
        distance: 120,
        color: '#00f0ff',
        opacity: 0.4,
        width: 1,
        triangles: { enable: true, opacity: 0.1 },
      },
    },
    interactivity: { events: { onHover: { enable: false }, onClick: { enable: false } } },
    background: { color: 'transparent' },
    detectRetina: true,
  };

  return (
    <div className="antialiased">
      <ParticlesBackground />
      <Navbar />

      <section id="hero">
        <div
          className="hero-background"
          style={{ backgroundImage: `url(${heroBg})` }}
        ></div>
        <div className="hero-content px-4">
          <img
            src={Logo}
            alt="SPOT Logo"
            className={`h-24 fade-in-up ${heroVisible ? 'visible' : ''}`}
            style={{ transitionDelay: '0.2s' }}
          />
          <h1
            className={`text-5xl md:text-7xl font-extrabold text-white [text-shadow:_0_0_15px_rgba(0,240,255,0.5)] fade-in-up hero-title-glow ${
              heroVisible ? 'visible' : ''
            }`}
            style={{ transitionDelay: '0.4s' }}
          >
            SPOT THE DIFFERENCE
          </h1>
          <p
            className={`text-xl md:text-2xl text-spot-light font-light max-w-2xl mx-auto fade-in-up ${
              heroVisible ? 'visible' : ''
            }`}
            style={{ transitionDelay: '0.6s' }}
          >
            النظام التعليمي المتكامل لمتابعة التقارير الأسبوعية وتطور أداء الطلاب.
          </p>
          <a
            href="#teachers-section"
            className={`bg-spot-cyan text-black font-bold px-8 py-3 rounded-lg text-lg transition-all border-2 border-transparent hover:bg-transparent hover:border-spot-cyan hover:text-spot-cyan hover:shadow-cyan-glow fade-in-up ${
              heroVisible ? 'visible' : ''
            }`}
            style={{ transitionDelay: '0.8s' }}
          >
            اكتشف المعلمين
          </a>
        </div>
        <a href="#teachers-section" className="scroll-down-arrow">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 5.25l-7.5 7.5-7.5-7.5m15 6l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </a>
      </section>

      <section
        id="teachers-section"
        className="py-24 bg-spot-dark relative z-10"
      >
        <Particles
          id="lightning-bg"
          init={particlesInit}
          options={lightningOptions}
          className="absolute top-0 left-0 w-full h-full z-0"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl font-bold text-white text-center mb-4 title-pulse-glow">
            المعلمون المتاحون
          </h2>
          <p className="text-xl text-spot-light/80 text-center max-w-2xl mx-auto mb-16">
            تصفح قائمة المعلمين الخبراء لدينا. تم تصميم هذا النظام لكسر حواجز
            التواصل وتقديم تقارير أسبوعية شفافة تساعدك على متابعة تطور الأداء
            خطوة بخطوة.
          </p>
          <div className="teacher-grid">
            <a href="#" className="teacher-container">
              <img
                src={teacherAvatar1}
                alt="أفاتار المعلم"
                className="teacher-avatar"
              />
              <img
                src={teacherAvatar1}
                alt="صورة غلاف المعلم"
                className="info-cover-image"
              />
              <div className="info-content">
                <h3>أ. محمود ناجي</h3>
                <p>تخصص فيزياء وكيمياء</p>
                <span className="details-button">عرض التقارير</span>
              </div>
            </a>
            <a href="#" className="teacher-container">
              <img
                src={teacherAvatar2}
                alt="أفاتار المعلم"
                className="teacher-avatar"
              />
              <img
                src={teacherAvatar2}
                alt="صورة غلاف المعلم"
                className="info-cover-image"
              />
              <div className="info-content">
                <h3>أ. أحمد علي</h3>
                <p>تخصص رياضيات</p>
                <span className="details-button">عرض التقارير</span>
              </div>
            </a>
            <a href="#" className="teacher-container">
              <img
                src={teacherAvatar1}
                alt="أفاتار المعلم"
                className="teacher-avatar"
              />
              <img
                src={teacherAvatar1}
                alt="صورة غلاف المعلم"
                className="info-cover-image"
              />
              <div className="info-content">
                <h3>أ. سارة محمد</h3>
                <p>تخصص لغة إنجليزية</p>
                <span className="details-button">عرض التقارير</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;