"use client";

import { useSyncExternalStore } from "react";
import type { CollectionKey, CollectionType, Profile } from "./schemas";
import { profileStore, Store, stores } from "./storage";

/** Live-reactive view of a collection. Re-renders on any write, including from other tabs. */
export function useCollection<K extends CollectionKey>(key: K): CollectionType[K][] {
  const store = stores[key] as Store<K>;
  return useSyncExternalStore(store.subscribe, store.snapshot, store.serverSnapshot);
}

export function useProfile(): Profile {
  return useSyncExternalStore(profileStore.subscribe, profileStore.snapshot, profileStore.serverSnapshot);
}

/** True once we're hydrated on the client and localStorage-backed data is live. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}
