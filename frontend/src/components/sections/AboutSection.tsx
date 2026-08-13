import { useEffect, useRef } from 'react';
import {
  resumeBackgroundMusicAfterVideo,
  setBackgroundMusicBlocked,
} from '../../lib/audio/backgroundMusic';
import { muteClipAudio, registerClipVideo } from '../../lib/audio/clipAudio';
import { useClipAudio } from '../../hooks/useClipAudio';
import { VolumeIcon } from '../layout/VolumeIcon';
import './AboutSection.css';

const CLIP_SRC = '/video/dikij-hak.mp4';

export function AboutSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { playing, volume, trigger } = useClipAudio();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setBackgroundMusicBlocked(true);
    registerClipVideo(video);

    const startClip = () => {
      void video.play().catch(() => undefined);
    };
    startClip();
    video.addEventListener('canplay', startClip);

    return () => {
      video.removeEventListener('canplay', startClip);
      muteClipAudio();
      registerClipVideo(null);
      setBackgroundMusicBlocked(false);
      void resumeBackgroundMusicAfterVideo();
    };
  }, []);

  return (
    <section className="about-section" aria-labelledby="about-title">
      <div className="about-stage" aria-hidden="true">
        <video
          ref={videoRef}
          className="about-video"
          src={CLIP_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        <div className="about-shadows">
          <span className="about-shadow about-shadow--veil" />
          <span className="about-shadow about-shadow--wisp" />
          <span className="about-shadow about-shadow--rune" />
          <span className="about-shadow about-shadow--ember" />
          <span className="about-shadow about-shadow--vignette" />
        </div>
      </div>

      <div className="about-content">
        <div className="about-content-head">
          <h1 id="about-title" className="about-title">
            ДИКИЙ ХАК
          </h1>
          <button
            type="button"
            className={`volume-control-icon about-sound${playing ? ' about-sound--on' : ''}`}
            onClick={trigger}
            aria-label={playing ? 'Выключить звук клипа' : 'Включить звук клипа'}
            title={playing ? 'Звук клипа включён' : 'Включить звук клипа'}
          >
            <VolumeIcon volume={playing ? volume : 0} playing={playing} />
          </button>
        </div>
        <p className="about-lead">
          Велес — портал славянской реальности. Здесь пантеон, ритуалы и голос ИИ-оракула сходятся в одном контуре.
        </p>
      </div>
    </section>
  );
}
