import React, { useState } from 'react';
import { VALID_ACCOUNTS, User } from '../auth';
import { cn } from '../lib/utils';
import { Lock, User as UserIcon, AlertCircle } from 'lucide-react';

interface Props {
  onLogin: (user: User) => void;
  theme?: 'light' | 'dark';
}

export default function Login({ onLogin, theme = 'light' }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (lockedUntil && new Date() < lockedUntil) {
      const secondsLeft = Math.ceil((lockedUntil.getTime() - new Date().getTime()) / 1000);
      setError(`Tài khoản tạm khóa. Vui lòng thử lại sau ${secondsLeft} giây.`);
      return;
    }

    const user = VALID_ACCOUNTS.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      setAttempts(0);
      setLockedUntil(null);
      if (user.expiresAt) {
        const expiryDate = new Date(user.expiresAt);
        if (new Date() > expiryDate) {
          setError('Tài khoản của bạn đã hết hạn.');
          return;
        }
      }
      
      // Remove password before passing user object
      const { password, ...userWithoutPassword } = user;
      onLogin(userWithoutPassword);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5) {
        const lockTime = new Date(new Date().getTime() + 60000); // Lock for 1 minute
        setLockedUntil(lockTime);
        setError('Bạn đã nhập sai quá 5 lần. Tài khoản tạm khóa 1 phút.');
      } else {
        setError(`Tên đăng nhập hoặc mật khẩu không đúng. Bạn còn ${5 - newAttempts} lần thử.`);
      }
    }
  };

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-4",
      theme === 'dark' ? "bg-slate-900" : "bg-slate-50"
    )}>
      <div className={cn(
        "w-full max-w-md p-8 rounded-2xl shadow-xl border",
        theme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
      )}>
        <div className="text-center mb-8">
          <div className={cn(
            "w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4",
            theme === 'dark' ? "bg-blue-900/30 text-blue-400" : "bg-blue-50 text-blue-600"
          )}>
            <Lock className="w-8 h-8" />
          </div>
          <h1 className={cn(
            "text-2xl font-bold",
            theme === 'dark' ? "text-white" : "text-slate-900"
          )}>
            Đăng nhập
          </h1>
          <p className={cn(
            "text-sm mt-2",
            theme === 'dark' ? "text-slate-400" : "text-slate-500"
          )}>
            Vui lòng đăng nhập để sử dụng ứng dụng
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-red-600 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className={cn(
                "block text-sm font-medium mb-1.5",
                theme === 'dark' ? "text-slate-300" : "text-slate-700"
              )}>
                Tên đăng nhập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={cn(
                    "block w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none",
                    theme === 'dark' 
                      ? "bg-slate-900/50 border-slate-700 text-white placeholder-slate-500" 
                      : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                  )}
                  placeholder="Nhập tên đăng nhập"
                  required
                />
              </div>
            </div>

            <div>
              <label className={cn(
                "block text-sm font-medium mb-1.5",
                theme === 'dark' ? "text-slate-300" : "text-slate-700"
              )}>
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    "block w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none",
                    theme === 'dark' 
                      ? "bg-slate-900/50 border-slate-700 text-white placeholder-slate-500" 
                      : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                  )}
                  placeholder="Nhập mật khẩu"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
}
