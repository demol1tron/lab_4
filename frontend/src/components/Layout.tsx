import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { TrainTrack, MapPinned, ListTree, Power, User, Radio } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const Layout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B0D11] text-slate-200">
      {/* Сайдбар диспетчера */}
      <aside className="w-64 border-r border-[#232A38] bg-[#121620] flex flex-col justify-between p-4">
        <div className="space-y-6">
          {/* Логотип ж/д поста */}
          <div className="flex items-center gap-3 px-2 py-1 border-b border-[#232A38]/80 pb-4">
            <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/30">
              <TrainTrack size={22} />
            </div>
            <div>
              <div className="font-black text-sm tracking-wider text-slate-100 uppercase">АСУ-ТРАНСПОРТ</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">СЦБ В НОРМЕ</span>
              </div>
            </div>
          </div>

          {/* Навигация */}
          <nav className="space-y-1.5">
            <NavLink
              to="/map"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`
              }
            >
              <MapPinned size={17} /> Интерактивный радар
            </NavLink>

            <NavLink
              to="/incidents"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`
              }
            >
              <ListTree size={17} /> Реестр сбоев и ЧП
            </NavLink>
          </nav>
        </div>

        {/* Профиль оператора поста */}
        <div className="border-t border-[#232A38] pt-4 space-y-3">
          <div className="bg-[#181E2C] p-2.5 rounded-xl border border-[#232A38] flex items-center gap-3">
            <div className="p-1.5 bg-slate-800 rounded-lg text-amber-400">
              <User size={16} />
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">{user?.full_name || 'Дежурный по парку'}</div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-tight">{user?.role}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition border border-transparent hover:border-red-500/20"
          >
            <Power size={14} /> Завершить смену
          </button>
        </div>
      </aside>

      {/* Контентная зона */}
      <main className="flex-1 overflow-y-auto bg-[#0B0D11]">
        <Outlet />
      </main>
    </div>
  );
};
