import { createRandomRealtimeEvent, type RealtimeEvent } from '@/features/realtime/model/events';

type Listener = (event: RealtimeEvent) => void;

const listeners = new Set<Listener>();

export function subscribeToRealtimeEvents(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitRealtimeEvent(event: RealtimeEvent) {
  listeners.forEach((listener) => {
    listener(event);
  });
}

export function emitRandomRealtimeEvent() {
  emitRealtimeEvent(createRandomRealtimeEvent());
}
