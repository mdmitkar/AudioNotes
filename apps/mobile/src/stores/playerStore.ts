import { create } from "zustand";
import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
} from "expo-audio";
import { progressApi } from "../api";

export interface Episode {
  _id: string;
  title: string;
  description: string;
  audioUrl: string | null;
  thumbnailUrl: string | null;
  duration: number;
  isPremium: boolean;
  creator?: { name: string };
  exam?: { name: string; color?: string };
  subject?: { name: string };
  topic?: { name: string };
}

interface PlayerState {
  episode: Episode | null;
  isPlaying: boolean;
  isLoading: boolean;
  position: number;
  duration: number;
  speed: number;
  soundObject: AudioPlayer | null;
  showFullPlayer: boolean;

  loadEpisode: (episode: Episode, startPosition?: number) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  togglePlay: () => Promise<void>;
  seekTo: (positionSeconds: number) => Promise<void>;
  seekForward: (seconds?: number) => Promise<void>;
  seekBackward: (seconds?: number) => Promise<void>;
  setSpeed: (speed: number) => Promise<void>;
  setShowFullPlayer: (show: boolean) => void;
  unload: () => Promise<void>;
  saveProgress: () => Promise<void>;
}

let progressInterval: ReturnType<typeof setInterval> | null = null;
let statusSubscription: { remove: () => void } | null = null;

export const usePlayerStore = create<PlayerState>((set, get) => ({
  episode: null,
  isPlaying: false,
  isLoading: false,
  position: 0,
  duration: 0,
  speed: 1,
  soundObject: null,
  showFullPlayer: false,

  loadEpisode: async (episode, startPosition = 0) => {
    const { soundObject, saveProgress } = get();

    // Save current episode progress before switching
    if (soundObject) {
      await saveProgress();

      if (statusSubscription) {
        statusSubscription.remove();
        statusSubscription = null;
      }

      soundObject.remove();

      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
    }

    if (!episode.audioUrl) {
      set({
        episode,
        soundObject: null,
        isPlaying: false,
        isLoading: false,
      });
      return;
    }

    set({
      episode,
      isLoading: true,
      position: startPosition,
      isPlaying: false,
    });

    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: "duckOthers",
      });

      const player = createAudioPlayer({
        uri: episode.audioUrl,
      });

      // expo-audio works in seconds, unlike expo-av's milliseconds
      if (startPosition > 0) {
        await player.seekTo(startPosition);
      }

      player.playbackRate = get().speed;

      statusSubscription = player.addListener(
        "playbackStatusUpdate",
        (status) => {
          set({
            position: Math.floor(status.currentTime || 0),
            duration: Math.floor(status.duration || 0),
            isPlaying: status.playing,
            isLoading: !status.isLoaded,
          });

          if (status.didJustFinish) {
            get().saveProgress();
          }
        }
      );

      set({
        soundObject: player,
        isLoading: false,
      });

      player.play();

      set({ isPlaying: true });

      // Auto-save progress every 10 seconds
      progressInterval = setInterval(() => {
        get().saveProgress();
      }, 10000);
    } catch (err) {
      console.error("Failed to load audio:", err);

      set({
        isLoading: false,
        isPlaying: false,
      });
    }
  },

  play: async () => {
    const { soundObject } = get();

    if (soundObject) {
      soundObject.play();
      set({ isPlaying: true });
    }
  },

  pause: async () => {
    const { soundObject } = get();

    if (soundObject) {
      soundObject.pause();
      set({ isPlaying: false });

      await get().saveProgress();
    }
  },

  togglePlay: async () => {
    const { isPlaying } = get();

    if (isPlaying) {
      await get().pause();
    } else {
      await get().play();
    }
  },

  seekTo: async (positionSeconds) => {
    const { soundObject } = get();

    if (soundObject) {
      await soundObject.seekTo(positionSeconds);
      set({ position: positionSeconds });
    }
  },

  seekForward: async (seconds = 30) => {
    const { position, duration } = get();

    const newPos = Math.min(position + seconds, duration);

    await get().seekTo(newPos);
  },

  seekBackward: async (seconds = 15) => {
    const { position } = get();

    const newPos = Math.max(position - seconds, 0);

    await get().seekTo(newPos);
  },

  setSpeed: async (speed) => {
    const { soundObject } = get();

    set({ speed });

    if (soundObject) {
      soundObject.playbackRate = speed;
    }
  },

  setShowFullPlayer: (show) => {
    set({ showFullPlayer: show });
  },

  saveProgress: async () => {
    const { episode, position, duration } = get();

    if (!episode || position <= 0) return;

    try {
      const completed =
        duration > 0 && position >= duration * 0.9;

      await progressApi.save(
        episode._id,
        position,
        completed
      );
    } catch {
      // Silently fail - do not interrupt playback
    }
  },

  unload: async () => {
    const { soundObject, saveProgress } = get();

    if (soundObject) {
      await saveProgress();

      if (statusSubscription) {
        statusSubscription.remove();
        statusSubscription = null;
      }

      soundObject.remove();

      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
    }

    set({
      episode: null,
      soundObject: null,
      isPlaying: false,
      position: 0,
      duration: 0,
    });
  },
}));