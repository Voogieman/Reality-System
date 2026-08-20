import { useCallback, useEffect, useState } from 'react';
import {
  getClipAudioState,
  setClipVolume,
  subscribeClipAudio,
  triggerClipAudio,
  type ClipAudioState,
} from '../lib/audio/clipAudio';

export function useClipAudio() {
  const [state, setState] = useState<ClipAudioState>(getClipAudioState);

  useEffect(() => subscribeClipAudio(setState), []);

  const trigger = useCallback(() => {
    void triggerClipAudio();
  }, []);

  const setVolume = useCallback((volume: number) => {
    setClipVolume(volume);
  }, []);

  return { ...state, trigger, setVolume };
}
