import { type ReactElement, useState } from 'react';
import { Navigate, Route, Routes, Link } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { AppBackground } from './components/layout/AppBackground';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { AuthSection } from './components/sections/AuthSection';
import { CabinetSection } from './components/sections/CabinetSection';
import { GodOracleForm } from './components/sections/GodOracleForm';
import { GodsGallery } from './components/sections/GodsGallery';
import { Hero } from './components/sections/Hero';
import { KnowledgeBaseSection } from './components/sections/KnowledgeBaseSection';
import { RitualForm } from './components/sections/RitualForm';
import { SupportSection } from './components/sections/SupportSection';
import { DEFAULT_GOD, type SlavicGod } from './data/gods';
import './components/ui/Section.css';

function PortalHome() {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Портал практик</h2>
        <p className="section-subtitle">
          Многофункциональный центр: пантеон, база знаний, оракул, ритуалы, кабинет, поддержка
        </p>
        <div className="section-divider">ᛉ ◆ ᛉ</div>
        <div className="gods-grid">
          <Link className="god-card panel-glass" to="/pantheon">
            <h3 className="god-card-name">Пантеон</h3>
            <p className="god-card-domain">Выбор божества и образов</p>
          </Link>
          <Link className="god-card panel-glass" to="/oracle">
            <h3 className="god-card-name">ИИ-Оракул</h3>
            <p className="god-card-domain">Пророчества и вопросы</p>
          </Link>
          <Link className="god-card panel-glass" to="/knowledge-base">
            <h3 className="god-card-name">База знаний</h3>
            <p className="god-card-domain">Карточки богов как энциклопедия</p>
          </Link>
          <Link className="god-card panel-glass" to="/rituals">
            <h3 className="god-card-name">Ритуалы</h3>
            <p className="god-card-domain">Отправка на модерацию 30-60 минут</p>
          </Link>
          <Link className="god-card panel-glass" to="/cabinet">
            <h3 className="god-card-name">Кабинет</h3>
            <p className="god-card-domain">Статусы и история</p>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Protected({ children }: { children: ReactElement }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <p className="section-subtitle">Проверяю доступ к кабинету...</p>
        </div>
      </section>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

export default function App() {
  const [selectedGod, setSelectedGod] = useState<SlavicGod>(DEFAULT_GOD);
  const handleSelectGod = (god: SlavicGod) => {
    setSelectedGod(god);
  };

  return (
    <>
      <AppBackground selectedGod={selectedGod} />
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Hero selectedGod={selectedGod} />} />
          <Route path="/portal" element={<PortalHome />} />
          <Route
            path="/pantheon"
            element={<GodsGallery selectedGod={selectedGod} onSelectGod={handleSelectGod} />}
          />
          <Route
            path="/knowledge-base"
            element={<KnowledgeBaseSection selectedGod={selectedGod} onSelectGod={handleSelectGod} />}
          />
          <Route path="/oracle" element={<GodOracleForm selectedGod={selectedGod} />} />
          <Route
            path="/rituals"
            element={<RitualForm selectedGod={selectedGod} onSelectGod={handleSelectGod} />}
          />
          <Route path="/auth" element={<AuthSection />} />
          <Route
            path="/cabinet"
            element={
              <Protected>
                <CabinetSection />
              </Protected>
            }
          />
          <Route path="/support" element={<SupportSection />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

