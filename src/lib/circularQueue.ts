export interface Song {
  id: number;
  name: string;
  artist: string;
  type: 'file' | 'youtube';
  audioUrl?: string;
  youtubeId?: string;
}

export interface QueueState {
  songs: (Song | null)[];
  front: number;
  rear: number;
  size: number;
  capacity: number;
  lastOperation: string;
}

export function createQueue(capacity: number): QueueState {
  return {
    songs: new Array(capacity).fill(null),
    front: 0,
    rear: -1,
    size: 0,
    capacity,
    lastOperation: 'Queue initialized',
  };
}

export function enqueue(state: QueueState, song: Song): QueueState {
  if (state.size >= state.capacity) {
    return { ...state, lastOperation: 'Queue Full — cannot add' };
  }
  const newRear = (state.rear + 1) % state.capacity;
  const newSongs = [...state.songs];
  newSongs[newRear] = song;
  return {
    ...state,
    songs: newSongs,
    rear: newRear,
    size: state.size + 1,
    lastOperation: `Enqueued "${song.name}" at index ${newRear}`,
  };
}

export function dequeue(state: QueueState): { state: QueueState; song: Song | null } {
  if (state.size === 0) {
    return { state: { ...state, lastOperation: 'Queue Empty — nothing to dequeue' }, song: null };
  }
  const song = state.songs[state.front];
  const newSongs = [...state.songs];
  newSongs[state.front] = null;
  const newFront = (state.front + 1) % state.capacity;
  return {
    state: {
      ...state,
      songs: newSongs,
      front: newFront,
      size: state.size - 1,
      lastOperation: `Dequeued "${song?.name}" from index ${state.front}`,
    },
    song,
  };
}

export function getNextIndex(current: number, state: QueueState): number {
  if (state.size === 0) return -1;
  // Find next non-null song circularly
  let idx = (current + 1) % state.capacity;
  let attempts = 0;
  while (state.songs[idx] === null && attempts < state.capacity) {
    idx = (idx + 1) % state.capacity;
    attempts++;
  }
  return state.songs[idx] !== null ? idx : -1;
}

export function getOrderedSongs(state: QueueState): { song: Song; index: number }[] {
  const result: { song: Song; index: number }[] = [];
  if (state.size === 0) return result;
  let idx = state.front;
  for (let i = 0; i < state.size; i++) {
    const song = state.songs[idx];
    if (song) result.push({ song, index: idx });
    idx = (idx + 1) % state.capacity;
  }
  return result;
}

export function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}
