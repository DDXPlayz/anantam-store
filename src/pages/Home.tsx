import { useState, useEffect } from 'react';
import { GarageShowcase } from '../components/GarageShowcase';
import { MobileShowcase } from '../components/MobileShowcase';

export function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check initial width
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="w-full bg-carbon text-white overflow-hidden">
      {isMobile ? <MobileShowcase /> : <GarageShowcase />}
    </div>
  );
}
