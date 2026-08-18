import type { SlavicGod } from '../../data/gods';
import './Hero.css';

type Props = {
  selectedGod: SlavicGod;
};

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function Hero({ selectedGod }: Props) {
  return (
    <section className="hero">
      <div className="hero-content">
        <p className="hero-epigraph">{selectedGod.title}</p>
        <h1 className="hero-title">{selectedGod.name}</h1>
        <p className="hero-subtitle">{selectedGod.domain}</p>
        <p className="hero-tagline">{selectedGod.description}</p>
        <div className="hero-actions">
          <button type="button" className="btn-primary" onClick={() => scrollToSection('gods')}>
            Пантеон
          </button>
          <button type="button" className="btn-secondary" onClick={() => scrollToSection('oracle')}>
            ИИ-оракул
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
