import { MAX_QUEUE_SIZE, STORAGE_KEYS } from "@/constants/config";
import { storage } from "@/lib/storage";

export type QueuedSubmission = {
  id: string;
  photoUri: string;
  latitude: number | null;
  longitude: number | null;
  note: string;
  phone: string;
  reporterName: string;
  createdAt: string;
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function readQueue(): Promise<QueuedSubmission[]> {
  const raw = await storage.getItem(STORAGE_KEYS.offlineQueue);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as QueuedSubmission[];
  } catch {
    return [];
  }
}

async function writeQueue(queue: QueuedSubmission[]): Promise<void> {
  await storage.setItem(STORAGE_KEYS.offlineQueue, JSON.stringify(queue));
}

export async function getQueuedSubmissions(): Promise<QueuedSubmission[]> {
  return readQueue();
}

export async function enqueueSubmission(
  submission: Omit<QueuedSubmission, "id" | "createdAt">,
): Promise<QueuedSubmission> {
  const queue = await readQueue();
  if (queue.length >= MAX_QUEUE_SIZE) {
    throw new Error("Offline queue is full");
  }
  const item: QueuedSubmission = {
    ...submission,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  await writeQueue([...queue, item]);
  return item;
}

export async function removeQueuedSubmission(id: string): Promise<void> {
  const queue = await readQueue();
  await writeQueue(queue.filter((item) => item.id !== id));
}

export async function flushQueue(
  handler: (item: QueuedSubmission) => Promise<void>,
): Promise<number> {
  const queue = await readQueue();
  let sent = 0;
  for (const item of queue) {
    await handler(item);
    await removeQueuedSubmission(item.id);
    sent += 1;
  }
  return sent;
}
