import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { SlavicGod } from '../../data/gods';
import { getGodImageByGod, getGodImageFrame, type GodImageFrame } from '../../data/god-images';

type Props = {
  selectedGod: SlavicGod;
};

export function AppBackground({ selectedGod }: Props) {
  const targetSrc = useMemo(() => getGodImageByGod(selectedGod), [selectedGod]);
  const [currentSrc, setCurrentSrc] = useState(targetSrc);
  const [nextSrc, setNextSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [frame, setFrame] = useState<GodImageFrame>(() => getGodImageFrame(selectedGod));

  useEffect(() => {
    setFrame(getGodImageFrame(selectedGod));
    const image = new Image();
    image.onload = () => {
      const ratio = image.naturalWidth / Math.max(1, image.naturalHeight);
      setFrame(getGodImageFrame(selectedGod, ratio));
    };
    image.src = targetSrc;
  }, [selectedGod, targetSrc]);

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
    <div
      className={`app-bg app-bg--${frame.fit}`}
      aria-hidden="true"
      style={{ '--bg-pos': frame.position } as CSSProperties}
    >
      {frame.fit === 'contain' ? (
        <img className="app-bg-fill" src={currentSrc} alt="" decoding="async" />
      ) : null}
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
