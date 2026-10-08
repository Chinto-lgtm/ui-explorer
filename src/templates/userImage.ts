/**
 * The one image a visitor can drop into the templates. It lives only in this
 * tab's memory as an object URL: nothing is uploaded or stored, and a reload
 * (or "Remove") forgets it.
 */

import { useSyncExternalStore } from 'react';

export interface UserImage {
  url: string;
  name: string;
}

let current: UserImage | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

export const userImageStore = {
  get: (): UserImage | null => current,
  set(file: File) {
    if (!file.type.startsWith('image/')) return false;
    if (current) URL.revokeObjectURL(current.url);
    current = { url: URL.createObjectURL(file), name: file.name };
    emit();
    return true;
  },
  clear() {
    if (current) URL.revokeObjectURL(current.url);
    current = null;
    emit();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }
};

export const useUserImage = (): UserImage | null =>
  useSyncExternalStore(userImageStore.subscribe, userImageStore.get, userImageStore.get);
