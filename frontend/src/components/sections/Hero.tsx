import type { SlavicGod } from '../../data/gods';
import { Link } from 'react-router-dom';
import './Hero.css';

type Props = {
  selectedGod: SlavicGod;
};

export function Hero({ selectedGod }: Props) {
  return (
    <section className="hero">
      <div className="hero-content">
        <p className="hero-epigraph">{selectedGod.title}</p>
        <h1 className="hero-title">{selectedGod.name}</h1>
        <p className="hero-subtitle">{selectedGod.domain}</p>
        <p className="hero-tagline">{selectedGod.description}</p>
        <div className="hero-actions">
          <Link to="/pantheon" className="btn-primary">
            Пантеон
          </Link>
          <Link to="/oracle" className="btn-secondary">
            ИИ-оракул
          </Link>
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
