
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-indigo-700 text-white shadow-lg py-4 px-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg">
            <svg className="w-8 h-8 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">College Finder <span className="text-indigo-200">India</span></h1>
        </div>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <a href="#" className="hover:text-indigo-200 transition-colors">Search</a>
          <a href="#" className="hover:text-indigo-200 transition-colors">Compare</a>
          <a href="#" className="hover:text-indigo-200 transition-colors">About</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
