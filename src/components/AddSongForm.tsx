import { useState, useRef } from 'react';
import { Plus, Upload, Link, Music } from 'lucide-react';
import { extractYoutubeId, type Song } from '@/lib/circularQueue';

interface AddSongFormProps {
  onAdd: (song: Song) => void;
  isFull: boolean;
}

type InputMode = 'file' | 'youtube';

const AddSongForm = ({ onAdd, isFull }: AddSongFormProps) => {
  const [name, setName] = useState('');
  const [artist, setArtist] = useState('');
  const [mode, setMode] = useState<InputMode>('file');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const audioUrlRef = useRef<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = URL.createObjectURL(file);
    setFileName(file.name);
    if (!name) setName(file.name.replace(/\.[^.]+$/, ''));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !artist.trim()) {
      setError('Song name and artist are required.');
      return;
    }

    if (mode === 'file' && !audioUrlRef.current) {
      setError('Please upload an audio file.');
      return;
    }

    if (mode === 'youtube') {
      const ytId = extractYoutubeId(youtubeUrl);
      if (!ytId) {
        setError('Invalid YouTube URL.');
        return;
      }
      onAdd({
        id: Date.now() + Math.floor(Math.random() * 1000),
        name: name.trim(),
        artist: artist.trim(),
        type: 'youtube',
        youtubeId: ytId,
      });
    } else {
      onAdd({
        id: Date.now() + Math.floor(Math.random() * 1000),
        name: name.trim(),
        artist: artist.trim(),
        type: 'file',
        audioUrl: audioUrlRef.current!,
      });
      audioUrlRef.current = null;
    }

    setName('');
    setArtist('');
    setYoutubeUrl('');
    setFileName('');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="glass rounded-2xl p-6 animate-fade-in">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Plus className="w-5 h-5 text-primary" />
        Add Song
      </h2>

      {isFull && (
        <div className="mb-4 px-4 py-2 rounded-lg bg-destructive/20 text-destructive text-sm font-medium border border-destructive/30">
          Queue Full — remove a song first
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setMode('file')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'file'
              ? 'bg-primary/20 text-primary border border-primary/40'
              : 'bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80'
          }`}
        >
          <Upload className="w-4 h-4" /> File
        </button>
        <button
          type="button"
          onClick={() => setMode('youtube')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'youtube'
              ? 'bg-primary/20 text-primary border border-primary/40'
              : 'bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80'
          }`}
        >
          <Link className="w-4 h-4" /> YouTube
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Song name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
        <input
          type="text"
          placeholder="Artist"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />

        {mode === 'file' ? (
          <div
            onClick={() => fileRef.current?.click()}
            className="w-full px-4 py-4 rounded-lg bg-secondary border border-dashed border-border text-muted-foreground text-sm cursor-pointer hover:border-primary/50 transition-all flex items-center justify-center gap-2"
          >
            <Music className="w-4 h-4" />
            {fileName || 'Click to upload MP3/WAV'}
            <input
              ref={fileRef}
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          <input
            type="text"
            placeholder="https://youtube.com/watch?v=..."
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        )}

        {error && <p className="text-destructive text-xs">{error}</p>}

        <button
          type="submit"
          disabled={isFull}
          className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed glow-primary"
        >
          Add to Queue
        </button>
      </form>
    </div>
  );
};

export default AddSongForm;
