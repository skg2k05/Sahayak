import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Send, History, Mic, Settings } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-zinc-200 bg-white/90 px-2 py-2 backdrop-blur-xl md:hidden"
    >
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 rounded-xl px-3 py-1 text-xs font-semibold transition ${
            isActive ? 'text-[#6D5DFB]' : 'text-zinc-500 hover:text-zinc-900'
          }`
        }
      >
        <Home className="h-5 w-5" />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/send"
        className={({ isActive }) =>
          `flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 rounded-xl px-3 py-1 text-xs font-semibold transition ${
            isActive ? 'text-[#6D5DFB]' : 'text-zinc-500 hover:text-zinc-900'
          }`
        }
      >
        <Send className="h-5 w-5" />
        <span>Payments</span>
      </NavLink>

      {/* Primary Voice Action Center Button */}
      <NavLink
        to="/voice"
        className={({ isActive }) =>
          `relative -mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#6D5DFB] to-[#4F8CFF] text-white shadow-lg shadow-[#6D5DFB]/40 transition active:scale-95 ${
            isActive ? 'ring-4 ring-[#6D5DFB]/30' : ''
          }`
        }
        aria-label="Voice Assistant Center"
      >
        <Mic className="h-7 w-7" />
      </NavLink>

      <NavLink
        to="/transactions"
        className={({ isActive }) =>
          `flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 rounded-xl px-3 py-1 text-xs font-semibold transition ${
            isActive ? 'text-[#6D5DFB]' : 'text-zinc-500 hover:text-zinc-900'
          }`
        }
      >
        <History className="h-5 w-5" />
        <span>Activity</span>
      </NavLink>

      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 rounded-xl px-3 py-1 text-xs font-semibold transition ${
            isActive ? 'text-[#6D5DFB]' : 'text-zinc-500 hover:text-zinc-900'
          }`
        }
      >
        <Settings className="h-5 w-5" />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};
