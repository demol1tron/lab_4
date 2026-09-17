import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { TrainTrack, KeyRound, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@railway.ru');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    try {
      const res = await api.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      setAuth(res.data.access_token, res.data.user);
      navigate('/map');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Отказ доступа: неверный табельный номер/пароль');
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#0B0D11] px-4 relative overflow-hidden">
      {/* Декоративная фоновая сетка */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d15_1px,transparent_1px),linear-gradient(to_bottom,#1f293d15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#131722] border border-[#232A38] rounded-2xl p-8 shadow-2xl space-y-6 relative z-10">
        <div className="space-y-2">
          <div className="inline-flex p-3 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/25">
            <TrainTrack size={28} />
          </div>
          <h1 className="text-xl font-black text-white uppercase tracking-wider">Диспетчерский Пульт</h1>
          <p className="text-xs text-slate-400">Система оперативного контроля безопасности движения поездов</p>
        </div>

        {error && (
          <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-mono font-semibold text-slate-300 block mb-1.5 uppercase">Табельный Email</label>
            <div className="relative">
              <UserCheck size={16} className="absolute left-3.5 top-3 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0B0D11] border border-[#232A38] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono font-semibold text-slate-300 block mb-1.5 uppercase">Ключ доступа</label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3.5 top-3 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0B0D11] border border-[#232A38] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/15"
          >
            Авторизовать терминал
          </button>
        </form>
      </div>
    </div>
  );
};
