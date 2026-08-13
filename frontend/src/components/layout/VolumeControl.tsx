import { useLocation } from 'react-router-dom';
import { useBackgroundMusic } from '../../hooks/useBackgroundMusic';
import { useClipAudio } from '../../hooks/useClipAudio';
import { VolumeIcon } from './VolumeIcon';
import './VolumeControl.css';

export function VolumeControl() {
  const isAboutPage = useLocation().pathname === '/about';
  const music = useBackgroundMusic();
  const clip = useClipAudio();
  const active = isAboutPage ? clip : music;
  const percent = Math.round(active.volume * 100);

  return (
    <div className={`volume-control${active.playing ? ' volume-control--playing' : ''}`}>
      <button
        type="button"
        className="volume-control-icon"
        onClick={active.trigger}
        aria-label={
          isAboutPage
            ? active.playing
              ? 'Звук клипа включён'
              : 'Включить звук клипа'
            : active.playing
              ? 'Фоновая музыка играет'
              : 'Включить фоновую музыку'
        }
        title={
          isAboutPage
            ? active.playing
              ? 'Звук клипа'
              : 'Включить звук клипа'
            : active.playing
              ? 'Музыка играет'
              : 'Включить музыку'
        }
      >
        <VolumeIcon volume={active.playing ? active.volume : 0} playing={active.playing} />
      </button>
      <label className="volume-control-slider">
        <span className="sr-only">Громкость {percent}%</span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={percent}
          onChange={(event) => active.setVolume(Number(event.target.value) / 100)}
          aria-label={isAboutPage ? 'Громкость клипа' : 'Громкость музыки'}
        />
      </label>
    </div>
  );
}
