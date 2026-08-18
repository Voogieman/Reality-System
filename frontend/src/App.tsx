import { AppBackground } from './components/layout/AppBackground';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { SectionOverlay } from './components/layout/SectionOverlay';
import { AuthSection } from './components/sections/AuthSection';
import { CabinetSection } from './components/sections/CabinetSection';
import { GodOracleForm } from './components/sections/GodOracleForm';
import { GodsGallery } from './components/sections/GodsGallery';
import { Hero } from './components/sections/Hero';
import { SupportSection } from './components/sections/SupportSection';
import { DEFAULT_GOD, type SlavicGod } from './data/gods';
import { useLanding, type LandingSection } from './landing/LandingContext';
import { useState } from 'react';
import './components/ui/Section.css';
import './components/gods/GodCard.css';
import './components/layout/SectionOverlay.css';

const SECTION_TITLES: Record<LandingSection, string> = {
  pantheon: 'Пантеон',
  knowledge: 'База знаний',
  oracle: 'ИИ-Оракул',
  rituals: 'Ритуалы',
  auth: 'Вход',
  cabinet: 'Личный кабинет',
  support: 'Поддержка',
};

export default function App() {
  const [selectedGod, setSelectedGod] = useState<SlavicGod>(DEFAULT_GOD);
  const { active, closeSection } = useLanding();

  return (
    <>
      <AppBackground selectedGod={selectedGod} />
      <Header />
      <main className="app-main">
        <Hero selectedGod={selectedGod} />
        <div className="landing-promo">
          <GodsGallery selectedGod={selectedGod} onSelectGod={setSelectedGod} />
          <GodOracleForm selectedGod={selectedGod} />
        </div>
      </main>
      <Footer />

      <SectionOverlay open={Boolean(active)} title={active ? SECTION_TITLES[active] : ''} onClose={closeSection}>
        {active === 'auth' ? <AuthSection /> : null}
        {active === 'cabinet' ? <CabinetSection /> : null}
        {active === 'support' ? <SupportSection /> : null}
      </SectionOverlay>
    </>
  );
}
