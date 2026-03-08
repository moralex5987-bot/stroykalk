import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, Plus, FileText, Book, Settings, LogOut } from 'lucide-react';
import { useStore } from '../store';

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { currentUser, logout } = useStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Новый расчёт', icon: Plus, href: '/calculator', all: true },
    { label: 'Все расчёты', icon: FileText, href: '/calculations', all: true },
    { label: 'Справочник', icon: Book, href: '/catalog', admin: true },
    { label: 'Настройки', icon: Settings, href: '/settings', admin: true },
  ];

  const visibleItems = menuItems.filter((item) => {
    if (item.admin && currentUser?.role !== 'admin') return false;
    return true;
  });

  return (
    <div className="flex h-screen bg-gray-100">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold">СтройКальк</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-2">
          {visibleItems.map((item) => (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className={`${sidebarOpen ? 'block' : 'hidden'} mb-3`}>
            <p className="text-sm text-gray-400">Вход как:</p>
            <p className="font-medium">{currentUser?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Выход</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
