import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { TrainTrack, KeyRound, Mail, UserPlus, LogIn, User, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'dispatcher' | 'viewer'>('dispatcher');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        // 1. Регистрация сотрудника с выбранной ролью (dispatcher / viewer)
        await api.post('/auth/register', {
          email,
          password,
          full_name: fullName,
          role: role,
        });
        setSuccessMsg(`Учетная запись (${role === 'viewer' ? 'Наблюдатель' : 'Диспетчер'}) создана! Войдите в систему.`);
        setIsRegister(false);
        setPassword('');
      } else {
        // 2. Авторизация
        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);

        const res = await api.post('/auth/login', params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        setAuth(res.data.access_token, res.data.user);
        navigate('/map');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка соединения с диспетчерским сервером.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#0B0D11] px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d15_1px,transparent_1px),linear-gradient(to_bottom,#1f293d15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#131722] border border-[#232A38] rounded-2xl p-8 shadow-2xl space-y-6 relative z-10">
        <div className="space-y-2">
          <div className="inline-flex p-3 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/25">
            <TrainTrack size={28} />
          </div>
          <h1 className="text-xl font-black text-white uppercase tracking-wider">
            {isRegister ? 'Регистрация персонала' : 'Диспетчерский Пульт'}
          </h1>
          <p className="text-xs text-slate-400">
            {isRegister
              ? 'Создание учетной записи сотрудника Ж/Д мониторинга'
              : 'Система оперативного контроля безопасности движения поездов'}
          </p>
        </div>

        {error && (
          <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="text-xs font-mono font-semibold text-slate-300 block mb-1.5 uppercase">
                  ФИО Сотрудника
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Иванов И. И."
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#0B0D11] border border-[#232A38] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono font-semibold text-slate-300 block mb-1.5 uppercase">
                  Должность / Уровень доступа
                </label>
                <div className="relative">
                  <ShieldCheck size={16} className="absolute left-3.5 top-3 text-slate-500" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'dispatcher' | 'viewer')}
                    className="w-full bg-[#0B0D11] border border-[#232A38] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition"
                  >
                    <option value="dispatcher">Дежурный диспетчер (Ввод и контроль ЧП)</option>
                    <option value="viewer">Инспектор / Аудитор (Только чтение)</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-mono font-semibold text-slate-300 block mb-1.5 uppercase">
              Служебный Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3 text-slate-500" />
              <input
                type="email"
                required
                placeholder="dispatcher@railway.ru"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0B0D11] border border-[#232A38] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono font-semibold text-slate-300 block mb-1.5 uppercase">
              Ключ доступа / Пароль
            </label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3.5 top-3 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0B0D11] border border-[#232A38] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/15 disabled:opacity-50"
          >
            {isRegister ? <UserPlus size={16} /> : <LogIn size={16} />}
            {loading ? 'Обработка запроса...' : isRegister ? 'Зарегистрировать профиль' : 'Авторизовать терминал'}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-[#232A38]">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setSuccessMsg('');
            }}
            className="text-xs text-slate-400 hover:text-amber-400 transition"
          >
            {isRegister
              ? 'Уже есть доступ? Войти по табельному номеру'
              : 'Первичный доступ? Регистрация сотрудника'}
          </button>
        </div>
      </div>
    </div>
  );
};
