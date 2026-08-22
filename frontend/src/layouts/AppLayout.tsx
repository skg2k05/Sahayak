import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/navigation/Navbar';
import { MobileBottomNav } from '../components/navigation/MobileBottomNav';
import { FloatingVoiceOrb } from '../components/voice/FloatingVoiceOrb';
import { AccessibilityPanel } from '../components/accessibility/AccessibilityPanel';
import { Footer } from '../components/layout/Footer';

export const AppLayout: React.FC = () => {
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#F8FAFC] text-slate-900 selection:bg-[#6D5DFB]/20 selection:text-[#6D5DFB]">
      {/* Subtle Futuristic Ambient Light Blobs */}
      <div className="ambient-blob-1 top-0 left-10 opacity-30" />
      <div className="ambient-blob-2 top-96 right-10 opacity-30" />

      {/* Main Glass Navbar */}
      <Navbar onOpenAccessibility={() => setAccessibilityOpen(true)} />

      {/* Page Content Container */}
      <main className="relative z-10 flex-1 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-28 md:pb-16">
        <div key={location.pathname} className="page-enter">
          <Outlet />
        </div>
      </main>

      {/* Premium Dark Footer */}
      <Footer />

      {/* Persistent 3D Sahayak Floating Voice Assistant Orb */}
      <FloatingVoiceOrb />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Global Accessibility Preferences Modal */}
      <AccessibilityPanel isOpen={accessibilityOpen} onClose={() => setAccessibilityOpen(false)} />
    </div>
  );
};
