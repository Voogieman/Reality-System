import { AppBackground } from './components/layout/AppBackground';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { AuthSection } from './components/sections/AuthSection';
import { CabinetSection } from './components/sections/CabinetSection';
import { GodOracleForm } from './components/sections/GodOracleForm';
import { GodsGallery } from './components/sections/GodsGallery';
import { Hero } from './components/sections/Hero';
import { RitualForm } from './components/sections/RitualForm';
import { SupportSection } from './components/sections/SupportSection';
import { DEFAULT_GOD, type SlavicGod } from './data/gods';
import { useState } from 'react';

export default function App() {
  const [selectedGod, setSelectedGod] = useState<SlavicGod>(DEFAULT_GOD);

  const handleSelectGod = (god: SlavicGod) => {
    setSelectedGod(god);
    document.getElementById('oracle')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <AppBackground selectedGod={selectedGod} />
      <Header />
      <main className="app-main">
        <Hero selectedGod={selectedGod} />
        <GodsGallery selectedGod={selectedGod} onSelectGod={handleSelectGod} />
        <GodOracleForm selectedGod={selectedGod} />
        <RitualForm selectedGod={selectedGod} onSelectGod={handleSelectGod} />
        <AuthSection />
        <CabinetSection />
        <SupportSection />
      </main>
      <Footer />
    </>
  );
}
