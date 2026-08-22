import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Mic, Sliders, Menu, X, LogOut, ShieldCheck, User as UserIcon, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { SUPPORTED_LANGUAGES, type SupportedLanguageCode } from '../../config/languages';


export const Navbar: React.FC<{ onOpenAccessibility: () => void }> = ({ onOpenAccessibility }) => {
  const { user, logout, token } = useAuth();
  const { settings, setLanguage } = useAccessibility();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-navbar transition-all duration-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          to={token ? '/dashboard' : '/'}
          className="focus-ring flex items-center gap-2.5 rounded-xl font-bold text-xl text-zinc-900"
          aria-label="Sahayak Home"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#6D5DFB] to-[#4F8CFF] text-white shadow-md shadow-[#6D5DFB]/20">
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <span className="tracking-tight text-2xl font-semibold">
            Sahayak<span className="text-[#6D5DFB]">.ai</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav aria-label="Main Navigation" className="hidden items-center gap-1 md:flex">
          {!token ? (
            <>
              <NavLink to="/how-it-works" className={({ isActive }) => `focus-ring rounded-xl px-4 py-2 font-medium transition ${isActive ? 'bg-zinc-100 text-zinc-900 font-bold' : 'text-zinc-600 hover:text-zinc-900'}`}>
                How it works
              </NavLink>
              <a href="/#features" className="focus-ring rounded-xl px-4 py-2 font-medium text-zinc-600 hover:text-zinc-900 transition">
                Features
              </a>
              <NavLink to="/security" className={({ isActive }) => `focus-ring rounded-xl px-4 py-2 font-medium transition ${isActive ? 'bg-zinc-100 text-zinc-900 font-bold' : 'text-zinc-600 hover:text-zinc-900'}`}>
                Security
              </NavLink>
              <NavLink to="/accessibility" className={({ isActive }) => `focus-ring rounded-xl px-4 py-2 font-medium transition ${isActive ? 'bg-zinc-100 text-zinc-900 font-bold' : 'text-zinc-600 hover:text-zinc-900'}`}>
                Accessibility
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `focus-ring rounded-xl px-4 py-2 font-semibold transition ${
                    isActive ? 'bg-[#6D5DFB] text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/send"
                className={({ isActive }) =>
                  `focus-ring rounded-xl px-4 py-2 font-semibold transition ${
                    isActive ? 'bg-[#6D5DFB] text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                  }`
                }
              >
                Send Money
              </NavLink>
              <NavLink
                to="/payees"
                className={({ isActive }) =>
                  `focus-ring rounded-xl px-4 py-2 font-semibold transition ${
                    isActive ? 'bg-[#6D5DFB] text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                  }`
                }
              >
                Payees
              </NavLink>
              <NavLink
                to="/transactions"
                className={({ isActive }) =>
                  `focus-ring rounded-xl px-4 py-2 font-semibold transition ${
                    isActive ? 'bg-[#6D5DFB] text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                  }`
                }
              >
                Transactions
              </NavLink>
              <NavLink
                to="/translator"
                className={({ isActive }) =>
                  `focus-ring rounded-xl px-4 py-2 font-semibold transition ${
                    isActive ? 'bg-[#6D5DFB] text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                  }`
                }
              >
                SMS Translator
              </NavLink>
              <NavLink
                to="/voice"
                className={({ isActive }) =>
                  `focus-ring rounded-xl px-4 py-2 font-semibold transition flex items-center gap-1.5 ${
                    isActive ? 'bg-[#6D5DFB] text-white' : 'text-[#6D5DFB] hover:bg-[#6D5DFB]/10'
                  }`
                }
              >
                <Mic className="h-4 w-4" />
                Voice Center
              </NavLink>
            </>
          )}
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector Dropdown */}

          <div className="flex items-center">
            <select
              value={settings.language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguageCode)}
              className="focus-ring rounded-xl bg-zinc-100 px-2.5 py-1.5 text-xs font-bold text-zinc-800 border border-zinc-200 cursor-pointer hover:bg-zinc-200/60 transition"
              aria-label="Select language"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.nativeName} ({l.name})
                </option>
              ))}
            </select>
          </div>


          {/* Accessibility Controls Button */}
          <button
            onClick={onOpenAccessibility}
            className="focus-ring flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 transition"
            aria-label="Open Accessibility Controls"
            title="Accessibility Controls"
          >
            <Sliders className="h-4 w-4" />
          </button>

          {/* Auth State Actions */}
          {!token ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                to="/login"
                className="focus-ring rounded-xl px-4 py-2 font-semibold text-zinc-800 hover:bg-zinc-100 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="focus-ring rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#4F8CFF] px-5 py-2.5 font-semibold text-white shadow-md shadow-[#6D5DFB]/25 hover:opacity-95 transition"
              >
                Get Started
              </Link>
            </div>
          ) : (
            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex items-center gap-2 rounded-xl bg-zinc-100/80 px-3 py-1.5 border border-zinc-200">
                <UserIcon className="h-4 w-4 text-[#6D5DFB]" />
                <span className="text-sm font-semibold text-zinc-800">
                  {user?.full_name?.split(' ')[0] || 'User'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="focus-ring flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 hover:bg-red-50 hover:text-red-600 transition"
                aria-label="Log Out"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="focus-ring flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-800 md:hidden"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-zinc-200 bg-white/95 backdrop-blur-xl px-4 pb-6 pt-3 md:hidden">
          <nav aria-label="Mobile Navigation" className="flex flex-col gap-2">
            {!token ? (
              <>
                <Link
                  to="/how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-3 font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  How it works
                </Link>
                <Link
                  to="/security"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-3 font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  Security
                </Link>
                <Link
                  to="/accessibility"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-3 font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  Accessibility
                </Link>
                <div className="mt-4 flex flex-col gap-2 border-t pt-4">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex justify-center rounded-xl border border-zinc-300 py-3 font-semibold text-zinc-800"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex justify-center rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#4F8CFF] py-3 font-semibold text-white shadow-md"
                  >
                    Get Started
                  </Link>
                </div>
              </>
            ) : (
              <>
                <NavLink
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-3 font-semibold text-zinc-800 hover:bg-zinc-100"
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/send"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-3 font-semibold text-zinc-800 hover:bg-zinc-100"
                >
                  Send Money
                </NavLink>
                <NavLink
                  to="/payees"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-3 font-semibold text-zinc-800 hover:bg-zinc-100"
                >
                  Payees
                </NavLink>
                <NavLink
                  to="/transactions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-3 font-semibold text-zinc-800 hover:bg-zinc-100"
                >
                  Transactions
                </NavLink>
                <NavLink
                  to="/translator"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-3 font-semibold text-zinc-800 hover:bg-zinc-100"
                >
                  SMS Translator
                </NavLink>
                <NavLink
                  to="/voice"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-3 font-semibold text-[#6D5DFB] bg-[#6D5DFB]/10"
                >
                  Voice Center
                </NavLink>
                <NavLink
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-3 font-semibold text-zinc-800 hover:bg-zinc-100"
                >
                  Settings & Accessibility
                </NavLink>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-3 font-semibold text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
