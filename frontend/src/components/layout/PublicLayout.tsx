import { Outlet } from 'react-router-dom';
import { LandingNavbar } from './LandingNavbar';
import { Footer } from './Footer';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#060b16] text-slate-100 flex flex-col font-sans">
      <LandingNavbar />

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}