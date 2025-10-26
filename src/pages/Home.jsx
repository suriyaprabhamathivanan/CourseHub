import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, ArrowRight } from 'lucide-react';

// --- NavBar Component ---
const NavBar = () => {
  const navItems = ['Home', 'Services', 'About', 'Contact', 'FAQ'];
  const navigate = useNavigate(); // ✅ Hook for navigation

  return (
    <header className="fixed w-full z-30 top-0 left-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4 md:py-6 backdrop-blur bg-white/5 rounded-b-2xl shadow-lg">
        {/* Logo + Dots */}
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-pink-500 rounded-full shadow" />
          <div className="w-3 h-3 bg-green-400 rounded-full shadow" />
          <div className="w-3 h-3 bg-blue-500 rounded-full shadow" />
          <span className="text-white font-extrabold text-lg md:text-xl tracking-wide">
            COURSEHUB
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <button
              key={item}
              className="text-white text-sm font-medium hover:text-white/90 transition duration-200"
            >
              {item}
            </button>
          ))}
        </nav>

        {/* Right Icons + Button */}
        <div className="flex items-center gap-4">
          <Search className="text-white w-5 h-5 cursor-pointer hover:text-white/90 transition" />

          {/* ✅ Now navigates to /login */}
          <button
            onClick={() => navigate('/login')}
            className="hidden md:inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white px-5 py-2 rounded-full font-semibold shadow hover:scale-105 transition"
          >
            Get Started
          </button>

          <Menu className="text-white w-6 h-6 cursor-pointer md:hidden" />
        </div>
      </div>
    </header>
  );
};

// --- HeroHeading Component ---
const HeroHeading = () => (
  <div className="flex flex-col max-w-lg md:pl-12">
    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.1] text-white">
      Design Your Future
      <br />
      Learning Path With
      <br />
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500 whitespace-nowrap">
        Confidence & Clarity
      </span>
    </h1>
  </div>
);

// --- CircleContent Component ---
const CircleContent = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center text-center gap-8 p-10">
      <p className="text-white text-base md:text-lg opacity-90 leading-relaxed">
        Generate personalized study plans, track progress, and discover curated
        learning paths — built for busy learners who want results.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* ✅ Navigate to /login on click */}
        <button
          onClick={() => navigate('/login')}
          className="inline-flex items-center gap-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-semibold py-4 px-8 md:px-10 rounded-full hover:scale-[1.02] transition shadow-lg text-lg"
        >
          Get Started <ArrowRight className="w-5 h-5" />
        </button>

        <button className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white py-4 px-8 md:px-10 rounded-full font-medium hover:scale-[1.02] transition shadow-lg text-lg">
          Learn More
        </button>
      </div>

      <div className="flex gap-8 mt-4 text-white text-sm font-medium">
        <div className="flex items-center gap-2">✨ Structured Paths</div>
        <div className="flex items-center gap-2">⚡ Fast Outcomes</div>
      </div>
    </div>
  );
};

// --- HeroBlob Component ---
const HeroBlob = () => (
  <div className="flex items-center justify-center w-full md:w-1/2 h-full relative">
    <div
      className="w-[450px] h-[450px] md:w-[600px] md:h-[600px]
                 rounded-[50%_40%_50%_60%_/_50%_60%_50%_40%]
                 bg-gradient-to-br from-[#1c3d9a] to-[#172554]
                 border-4 border-white/5 shadow-[0_0_100px_rgba(30,64,175,0.4)]
                 flex items-center justify-center p-8"
    >
      <CircleContent />
    </div>
  </div>
);

// --- Feature Boxes Component ---
const FeatureBoxes = () => (
  <div className="absolute bottom-0 left-0 right-0 max-w-6xl mx-auto px-6 mb-8 z-20">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {[
        { title: 'Personalized Paths', desc: 'Tailored study plans for your goals.' },
        { title: 'Track Progress', desc: 'Monitor your learning journey easily.' },
        { title: 'Save & Resume', desc: 'Keep your courses and pick up anytime.' },
      ].map((item, idx) => (
        <div
          key={idx}
          className="bg-gradient-to-r from-sky-500 to-indigo-600 
                     p-6 rounded-2xl shadow-xl transition hover:scale-[1.02] duration-300 border border-white/5"
        >
          <h3 className="text-white font-semibold mb-2">{item.title}</h3>
          <p className="text-white text-sm">{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

// --- Home Component ---
const Home = () => {
  return (
    <div className="min-h-screen bg-[#060c14] font-sans flex flex-col relative overflow-hidden">
      <NavBar />

      <main
        className="relative flex-1 flex flex-col md:flex-row items-center justify-center px-6 pt-32 md:pt-0 
        gap-24 min-h-screen"
      >
        <div className="flex flex-col justify-center md:w-5/12">
          <HeroHeading />
        </div>

        <HeroBlob />
        <FeatureBoxes />
      </main>
    </div>
  );
};

export default Home;
