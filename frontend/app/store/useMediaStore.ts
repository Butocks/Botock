import { create } from "zustand";

export interface MediaItem {
  id: string;
  title: string;
  type: "video" | "image";
  url: string;
  blob?: Blob;
  blobUrl?: string;
  createdAt: string;
  expiresAt: string;
  prompt: string;
}

interface MediaState {
  // Current media being edited in studio
  activeMedia: MediaItem | null;
  // Local user library
  library: MediaItem[];
  // Actions
  setActiveMedia: (media: MediaItem) => void;
  clearActiveMedia: () => void;
  addToLibrary: (item: MediaItem) => void;
  removeFromLibrary: (id: string) => void;
}

export const useMediaStore = create<MediaState>((set, get) => ({
  activeMedia: null,
  library: [],

  setActiveMedia: (media: MediaItem) => {
    // If a previous blobUrl was created and replaced, revoke it to prevent memory leaks
    const current = get().activeMedia;
    if (current?.blobUrl && current.blobUrl !== media.blobUrl) {
      try {
        URL.revokeObjectURL(current.blobUrl);
      } catch (e) {
        // ignore
      }
    }
    set({ activeMedia: media });
  },

  clearActiveMedia: () => {
    const current = get().activeMedia;
    if (current?.blobUrl) {
      try {
        URL.revokeObjectURL(current.blobUrl);
      } catch (e) {
        // ignore
      }
    }
    set({ activeMedia: null });
  },

  addToLibrary: (item: MediaItem) => {
    set((state) => {
      // Avoid duplicate entries
      const filtered = state.library.filter((i) => i.id !== item.id);
      return { library: [item, ...filtered] };
    });
  },

  removeFromLibrary: (id: string) => {
    set((state) => {
      const item = state.library.find((i) => i.id === id);
      if (item?.blobUrl) {
        try {
          URL.revokeObjectURL(item.blobUrl);
        } catch (e) {
          // ignore
        }
      }
      return { library: state.library.filter((i) => i.id !== id) };
    });
  },
}));
