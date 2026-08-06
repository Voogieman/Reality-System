import { useEffect, useMemo, useState } from 'react';
import type { SlavicGod } from '../../data/gods';
import { getGodImageByGod } from '../../data/god-images';

type Props = {
  selectedGod: SlavicGod;
};

export function AppBackground({ selectedGod }: Props) {
  const targetSrc = useMemo(() => getGodImageByGod(selectedGod), [selectedGod]);
  const [currentSrc, setCurrentSrc] = useState(targetSrc);
  const [nextSrc, setNextSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (targetSrc === currentSrc) return;
    setLoading(true);

    const image = new Image();
    image.onload = () => {
      setNextSrc(targetSrc);
      window.setTimeout(() => {
        setCurrentSrc(targetSrc);
        setNextSrc(null);
        setLoading(false);
      }, 420);
    };
    image.onerror = () => {
      setCurrentSrc(targetSrc);
      setNextSrc(null);
      setLoading(false);
    };
    image.src = targetSrc;
  }, [currentSrc, targetSrc]);

  return (
    <div className="app-bg" aria-hidden="true">
      <img
        className="app-bg-image app-bg-image--current"
        src={currentSrc}
        alt=""
        fetchPriority="high"
        decoding="async"
      />
      {nextSrc ? <img className="app-bg-image app-bg-image--next" src={nextSrc} alt="" decoding="async" /> : null}
      {loading ? <div className="app-bg-loader" /> : null}
      <div className="app-bg-overlay" />
    </div>
  );
}
