type Props = {
  volume: number;
  playing: boolean;
};

export function VolumeIcon({ volume, playing }: Props) {
  const waves = volume <= 0.01 ? 0 : volume < 0.4 ? 1 : volume < 0.75 ? 2 : 3;

  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d="M4 9.5h3.2L12 5.8v12.4L7.2 14.5H4V9.5Z" fill="currentColor" />
      {waves >= 1 ? (
        <path
          d="M15.1 9.2a3.2 3.2 0 0 1 0 5.6"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          opacity={playing ? 1 : 0.55}
        />
      ) : null}
      {waves >= 2 ? (
        <path
          d="M17.4 7.2a6 6 0 0 1 0 9.6"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          opacity={playing ? 1 : 0.55}
        />
      ) : null}
      {waves >= 3 ? (
        <path
          d="M19.7 5.2a8.8 8.8 0 0 1 0 13.6"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          opacity={playing ? 1 : 0.55}
        />
      ) : null}
      {waves === 0 ? (
        <path d="M15.2 9.2 20 14m0-4.8-4.8 4.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      ) : null}
    </svg>
  );
}
