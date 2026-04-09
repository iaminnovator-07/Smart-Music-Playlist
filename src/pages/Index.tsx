import { useState, useCallback } from 'react';
import { createQueue, enqueue, getNextIndex, type QueueState, type Song } from '@/lib/circularQueue';
import AddSongForm from '@/components/AddSongForm';
import NowPlaying from '@/components/NowPlaying';
import Playlist from '@/components/Playlist';
import DebugPanel from '@/components/DebugPanel';
import { ListMusic } from 'lucide-react';

const CAPACITY = 10;

const Index = () => {
  const [queue, setQueue] = useState<QueueState>(() => createQueue(CAPACITY));
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleAddSong = useCallback((song: Song) => {
    setQueue((prev) => {
      const next = enqueue(prev, song);
      return next;
    });
  }, []);

  const handleSelect = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsPlaying(true);
  }, []);

  const handleRemove = useCallback((index: number) => {
    setQueue((prev) => {
      const newSongs = [...prev.songs];
      newSongs[index] = null;

      // Recalculate front/rear/size
      let newSize = 0;
      let newFront = -1;
      let newRear = -1;
      for (let i = 0; i < prev.capacity; i++) {
        const ci = (prev.front + i) % prev.capacity;
        if (newSongs[ci] !== null) {
          if (newFront === -1) newFront = ci;
          newRear = ci;
          newSize++;
        }
      }

      return {
        ...prev,
        songs: newSongs,
        front: newFront === -1 ? 0 : newFront,
        rear: newRear === -1 ? -1 : newRear,
        size: newSize,
        lastOperation: `Removed song at index ${index}`,
      };
    });

    if (index === currentIndex) {
      setIsPlaying(false);
      setCurrentIndex(-1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    setQueue((prev) => {
      const nextIdx = getNextIndex(currentIndex, prev);
      if (nextIdx !== -1) {
        setCurrentIndex(nextIdx);
        setIsPlaying(true);
      }
      return { ...prev, lastOperation: `Next → index ${getNextIndex(currentIndex, prev)}` };
    });
  }, [currentIndex]);

  const handleShuffle = useCallback(() => {
    setQueue((prev) => {
      const filled: number[] = [];
      prev.songs.forEach((s, i) => { if (s) filled.push(i); });
      if (filled.length === 0) return prev;
      let rand = filled[Math.floor(Math.random() * filled.length)];
      if (rand === currentIndex && filled.length > 1) {
        rand = filled[(filled.indexOf(rand) + 1) % filled.length];
      }
      setCurrentIndex(rand);
      setIsPlaying(true);
      return { ...prev, lastOperation: `Shuffled to index ${rand}` };
    });
  }, [currentIndex]);

  const handlePlayPause = useCallback(() => {
    if (currentIndex === -1 && queue.size > 0) {
      setCurrentIndex(queue.front);
      setIsPlaying(true);
    } else {
      setIsPlaying((p) => !p);
    }
  }, [currentIndex, queue.front, queue.size]);

  const handleSongEnd = useCallback(() => {
    handleNext();
  }, [handleNext]);

  const currentSong = currentIndex >= 0 ? queue.songs[currentIndex] : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <ListMusic className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Smart Circular Music Playlist</h1>
          </div>
          <p className="text-muted-foreground text-sm">Circular Queue powered music player</p>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            <AddSongForm onAdd={handleAddSong} isFull={queue.size >= queue.capacity} />
            <DebugPanel queue={queue} currentIndex={currentIndex} />
          </div>

          {/* Center column */}
          <div>
            <NowPlaying
              song={currentSong}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onNext={handleNext}
              onShuffle={handleShuffle}
              onSongEnd={handleSongEnd}
            />
          </div>

          {/* Right column */}
          <div>
            <Playlist
              queue={queue}
              currentIndex={currentIndex}
              onSelect={handleSelect}
              onRemove={handleRemove}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
