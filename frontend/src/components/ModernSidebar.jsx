import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  Calendar, 
  Clock, 
  FileText, 
  LogOut, 
  Menu, 
  X,
  LayoutDashboard
} from 'lucide-react';

export default function ModernSidebar() {
  const location = useLocation();
  
  // Menu items configuration
  const menuItems = [
    { to: '/', icon: <Home className="w-5 h-5" />, text: 'Bosh sahifa' },
    { to: '/products', icon: <Package className="w-5 h-5" />, text: 'Mahsulotlar' },
    { to: '/rentals', icon: <Calendar className="w-5 h-5" />, text: 'Ijaralar' },
    { to: '/active-rentals', icon: <Clock className="w-5 h-5" />, text: 'Aktiv ijaralar' },
    { to: '/history', icon: <FileText className="w-5 h-5" />, text: 'Tarix' },
    { to: '/report', icon: <FileText className="w-5 h-5" />, text: 'Hisobot' },
  ];
  
  // Handle logout
  const handleLogout = () => {
    // Add your logout logic here
    console.log('Logging out...');
  };

  return (
    <>
      {/* Top Bar - Always Visible */}
      <nav className="flex items-center justify-between bg-[#0b1d38] text-white px-4 py-3 shadow-md md:px-6">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <LayoutDashboard className="w-6 h-6" />
          <h1 className="text-xl font-bold">Rentacloud</h1>
        </div>
        
        {/* Desktop Logout */}
        <div className="hidden md:block">
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Chiqish</span>
          </button>
        </div>
      </nav>

      {/* Desktop Sidebar - Always visible on desktop, hidden on mobile */}
      <div className="hidden md:block">
        <aside className="fixed top-0 left-0 h-full w-64 bg-[#0b1d38] text-white z-50 transform transition-transform duration-300 ease-in-out translate-x-0">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-center h-16 px-4 border-b border-gray-700">
              <h1 className="text-xl font-bold">Rentacloud</h1>
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-2 px-3">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-gray-800'
                        }`}
                      >
                        <span className={`mr-3 ${isActive ? 'text-white' : 'text-gray-400'}`}>
                          {item.icon}
                        </span>
                        <span className="text-sm font-medium">{item.text}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="p-4 border-t border-gray-700">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                <span className="text-sm font-medium">Chiqish</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
