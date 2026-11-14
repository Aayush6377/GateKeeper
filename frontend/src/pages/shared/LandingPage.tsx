import { HeroSection } from '../../components/landing/HeroSection';
import { FeaturesGrid } from '../../components/landing/FeaturesGrid';
import { ArchitectureFlow } from '../../components/landing/ArchitectureFlow';
import { LivePolicySimulator } from '../../components/landing/LivePolicySimulator';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export default function LandingPage() {
    const location = useLocation();

    useEffect(() => {
        if (location.hash) {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
            setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
        } else {
        window.scrollTo(0, 0);
        }
    }, [location]);
    
    return (
        <div className="selection:bg-emerald-500 selection:text-slate-950">
            <main className="flex-1">
                <HeroSection />
                <FeaturesGrid />
                <ArchitectureFlow />
                <LivePolicySimulator />
            </main>
        </div>
    );
}