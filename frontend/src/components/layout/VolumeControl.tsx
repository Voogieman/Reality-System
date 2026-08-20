import { useLanding } from '../../landing/LandingContext';
import { useBackgroundMusic } from '../../hooks/useBackgroundMusic';
import { useClipAudio } from '../../hooks/useClipAudio';
import { VolumeIcon } from './VolumeIcon';
import './VolumeControl.css';

export function VolumeControl() {
  const { active } = useLanding();
  const isAbout = active === 'about';
  const music = useBackgroundMusic();
  const clip = useClipAudio();
  const activeAudio = isAbout ? clip : music;
  const percent = Math.round(activeAudio.volume * 100);

  return (
    <div className={`volume-control${activeAudio.playing ? ' volume-control--playing' : ''}`}>
      <button
        type="button"
        className="volume-control-icon"
        onClick={activeAudio.trigger}
        aria-label={
          isAbout
            ? activeAudio.playing
              ? 'Звук клипа включён'
              : 'Включить звук клипа'
            : activeAudio.playing
              ? 'Фоновая музыка играет'
              : 'Включить фоновую музыку'
        }
        title={
          isAbout
            ? activeAudio.playing
              ? 'Звук клипа'
              : 'Включить звук клипа'
            : activeAudio.playing
              ? 'Музыка играет'
              : 'Включить музыку'
        }
      >
        <VolumeIcon volume={activeAudio.playing ? activeAudio.volume : 0} playing={activeAudio.playing} />
      </button>
      <label className="volume-control-slider">
        <span className="sr-only">Громкость {percent}%</span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={percent}
          onChange={(event) => activeAudio.setVolume(Number(event.target.value) / 100)}
          aria-label={isAbout ? 'Громкость клипа' : 'Громкость музыки'}
        />
      </label>
    </div>
  );
}
