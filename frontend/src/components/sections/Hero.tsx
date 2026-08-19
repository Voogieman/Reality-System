import { godVoiceTitle, getGodVoice } from '../../data/god-voices';
import type { SlavicGod } from '../../data/gods';
import './Hero.css';

type Props = {
  selectedGod: SlavicGod;
};

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function Hero({ selectedGod }: Props) {
  const voice = getGodVoice(selectedGod);

  return (
    <section className="hero">
      <div className="hero-content">
        <p className="hero-epigraph">{godVoiceTitle(selectedGod)}</p>
        <h1 className="hero-title">{selectedGod.name}</h1>
        <p className="hero-subtitle">{voice.when}</p>
        <p className="hero-tagline">{voice.promise}</p>
        <div className="hero-actions">
          <button type="button" className="btn-primary" onClick={() => scrollToSection('oracle')}>
            {godVoiceTitle(selectedGod)}
          </button>
          <button type="button" className="btn-secondary" onClick={() => scrollToSection('gods')}>
            Выбрать голос
          </button>
        </div>
        <div className="hero-realms">
          <span>Явь</span>
          <span className="hero-dot">◆</span>
          <span>Навь</span>
          <span className="hero-dot">◆</span>
          <span>Правь</span>
        </div>
      </div>
    </section>
  );
}
