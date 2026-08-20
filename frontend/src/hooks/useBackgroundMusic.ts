import { useCallback, useEffect, useState } from 'react';
import {
  getBackgroundMusicState,
  setBackgroundVolume,
  subscribeBackgroundMusic,
  triggerBackgroundMusic,
  type BackgroundMusicState,
} from '../lib/audio/backgroundMusic';

export function useBackgroundMusic() {
  const [state, setState] = useState<BackgroundMusicState>(getBackgroundMusicState);

  useEffect(() => subscribeBackgroundMusic(setState), []);

  const trigger = useCallback(() => {
    void triggerBackgroundMusic();
  }, []);

  const setVolume = useCallback((volume: number) => {
    setBackgroundVolume(volume);
    void triggerBackgroundMusic();
  }, []);

  return { ...state, trigger, setVolume };
}
