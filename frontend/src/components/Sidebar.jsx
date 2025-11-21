import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { to: '/', icon: '🏠', text: 'Bosh sahifa' },
    { to: '/products', icon: '📦', text: 'Mahsulotlar' },
    { to: '/rentals', icon: '📅', text: 'Ijaralar' },
    { to: '/active-rentals', icon: '⏱️', text: 'Aktiv ijaralar' },
    { to: '/history', icon: '📜', text: 'Tarix' },
    { to: '/report', icon: '📊', text: 'Hisobot' },
  ];

  const handleLogout = () => {
    // Add your logout logic here
    console.log('Logging out...');
  };

  return (
    <>
      {/* Desktop Sidebar - Always visible on desktop, hidden on mobile */}
      <div className="hidden md:block">
        <div className="fixed top-0 left-0 h-full w-64 bg-gray-900 text-white z-40 transform transition-transform duration-300 ease-in-out translate-x-0">
          <div className="flex flex-col h-full">
            {/* Logo/Brand */}
            <div className="flex items-center justify-center h-16 px-4 border-b border-gray-800">
              <h1 className="text-xl font-bold">Rentacloud</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-2 px-4">
                {menuItems.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                        location.pathname === item.to
                          ? 'bg-indigo-700 text-white'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <span className="mr-3 text-xl">{item.icon}</span>
                      <span className="text-sm font-medium">{item.text}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-800">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <span className="mr-3 text-xl">🚪</span>
                <span className="text-sm font-medium">Chiqish</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
