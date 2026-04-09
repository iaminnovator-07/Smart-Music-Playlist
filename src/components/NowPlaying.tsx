import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, SkipForward, Shuffle, Disc3 } from 'lucide-react';
import type { Song } from '@/lib/circularQueue';

interface NowPlayingProps {
  song: Song | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onShuffle: () => void;
  onSongEnd: () => void;
}

const NowPlaying = ({ song, isPlaying, onPlayPause, onNext, onShuffle, onSongEnd }: NowPlayingProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Cleanup and setup audio for file-based songs
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current = null;
    }

    if (song?.type === 'file' && song.audioUrl) {
      const audio = new Audio(song.audioUrl);
      audioRef.current = audio;

      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration || 0);
        setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
      });

      audio.addEventListener('ended', onSongEnd);
      audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));

      if (isPlaying) audio.play().catch(() => {});
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song?.id]);

  // Sync play/pause
  useEffect(() => {
    if (song?.type !== 'file' || !audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, song?.type]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * duration;
  }, [duration]);

  const formatTime = (t: number) => {
    if (!t || !isFinite(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-strong rounded-2xl p-6 animate-fade-in">
      {/* Disc visualization */}
      <div className="flex justify-center mb-6">
        <div className={`relative w-32 h-32 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center border-2 border-primary/30 ${isPlaying ? 'animate-spin-slow' : ''}`}>
          <div className="w-12 h-12 rounded-full bg-background border-2 border-border" />
          <Disc3 className="absolute w-8 h-8 text-primary/60" />
        </div>
      </div>

      {/* Song info */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-foreground truncate">
          {song ? song.name : 'No song selected'}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {song ? song.artist : 'Add songs to get started'}
        </p>
      </div>

      {/* Progress bar (file only) */}
      {song?.type === 'file' && (
        <div className="mb-4">
          <div
            className="w-full h-1.5 bg-secondary rounded-full cursor-pointer group"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      )}

      {/* YouTube embed */}
      {song?.type === 'youtube' && song.youtubeId && (
        <div className="mb-4 rounded-lg overflow-hidden aspect-video">
          <iframe
            key={song.id + (isPlaying ? '-play' : '-pause')}
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${song.youtubeId}?autoplay=${isPlaying ? 1 : 0}&enablejsapi=1`}
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="border-0"
          />
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onShuffle}
          className="p-2 rounded-full text-muted-foreground hover:text-accent transition-colors"
          title="Shuffle"
        >
          <Shuffle className="w-5 h-5" />
        </button>
        <button
          onClick={onPlayPause}
          disabled={!song}
          className="p-4 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-all disabled:opacity-40 glow-primary"
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>
        <button
          onClick={onNext}
          disabled={!song}
          className="p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
          title="Next"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default NowPlaying;
