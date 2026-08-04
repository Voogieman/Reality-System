import type { SlavicGod } from '../../data/gods';
import { getGodImageByGod } from '../../data/god-images';

type Props = {
  selectedGod: SlavicGod;
};

export function AppBackground({ selectedGod }: Props) {
  const imageSrc = getGodImageByGod(selectedGod);

  return (
    <div className="app-bg" aria-hidden="true">
      <img
        className="app-bg-image"
        src={imageSrc}
        alt=""
        fetchPriority="high"
        decoding="async"
      />
      <div className="app-bg-overlay" />
    </div>
  );
}
