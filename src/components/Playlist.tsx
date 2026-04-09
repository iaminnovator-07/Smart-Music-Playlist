import { Music, Trash2, Youtube } from 'lucide-react';
import { getOrderedSongs, type QueueState } from '@/lib/circularQueue';

interface PlaylistProps {
  queue: QueueState;
  currentIndex: number;
  onSelect: (index: number) => void;
  onRemove: (index: number) => void;
}

const Playlist = ({ queue, currentIndex, onSelect, onRemove }: PlaylistProps) => {
  const songs = getOrderedSongs(queue);

  return (
    <div className="glass rounded-2xl p-6 animate-fade-in">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Music className="w-5 h-5 text-accent" />
        Playlist
        <span className="text-xs text-muted-foreground ml-auto">{queue.size}/{queue.capacity}</span>
      </h2>

      {songs.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No songs in queue</p>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {songs.map(({ song, index }) => (
            <div
              key={song.id}
              onClick={() => onSelect(index)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all group ${
                index === currentIndex
                  ? 'bg-primary/15 border border-primary/30 glow-primary'
                  : 'bg-secondary/50 border border-transparent hover:border-border hover:bg-secondary'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                index === currentIndex ? 'bg-primary/20' : 'bg-muted'
              }`}>
                {song.type === 'youtube' ? (
                  <Youtube className="w-4 h-4 text-destructive" />
                ) : (
                  <Music className="w-4 h-4 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${index === currentIndex ? 'text-primary' : 'text-foreground'}`}>
                  {song.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
              </div>

              {index === currentIndex && (
                <div className="flex gap-0.5">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-0.5 bg-primary rounded-full animate-pulse-slow" style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              )}

              <button
                onClick={(e) => { e.stopPropagation(); onRemove(index); }}
                className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Playlist;
