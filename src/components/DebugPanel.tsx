import { Bug } from 'lucide-react';
import type { QueueState } from '@/lib/circularQueue';

interface DebugPanelProps {
  queue: QueueState;
  currentIndex: number;
}

const DebugPanel = ({ queue, currentIndex }: DebugPanelProps) => {
  return (
    <div className="glass rounded-2xl p-6 animate-fade-in">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Bug className="w-5 h-5 text-warning" />
        Debug Panel
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: 'Front', value: queue.front, color: 'text-success' },
          { label: 'Rear', value: queue.rear, color: 'text-destructive' },
          { label: 'Size', value: queue.size, color: 'text-primary' },
          { label: 'Capacity', value: queue.capacity, color: 'text-accent' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-secondary/50 rounded-lg px-3 py-2">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className={`block text-lg font-bold ${color}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* Array visualization */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-2">Array Slots</p>
        <div className="flex gap-1.5 flex-wrap">
          {queue.songs.map((song, i) => {
            const isFront = i === queue.front && queue.size > 0;
            const isRear = i === queue.rear && queue.size > 0;
            const isCurrent = i === currentIndex;

            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="flex gap-0.5 text-[10px] font-bold h-4">
                  {isFront && <span className="text-success">F</span>}
                  {isRear && <span className="text-destructive">R</span>}
                </div>
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-mono transition-all ${
                    song
                      ? isCurrent
                        ? 'bg-primary/30 border border-primary text-primary'
                        : 'bg-secondary border border-border text-foreground'
                      : 'bg-muted/30 border border-border/30 text-muted-foreground'
                  }`}
                  title={song ? `${song.name} - ${song.artist}` : 'Empty'}
                >
                  {song ? i : '—'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Last operation */}
      <div className="bg-secondary/50 rounded-lg px-3 py-2">
        <span className="text-xs text-muted-foreground">Last Operation</span>
        <p className="text-sm text-foreground mt-0.5 font-mono">{queue.lastOperation}</p>
      </div>
    </div>
  );
};

export default DebugPanel;
