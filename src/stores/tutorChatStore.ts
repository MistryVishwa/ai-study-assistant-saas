import { create } from "zustand";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
};

type ChatState = {
  messages: ChatMessage[];
  pending: boolean;
  addMessage: (m: ChatMessage) => void;
  setPending: (v: boolean) => void;
  reset: () => void;
  hydrate: (messages: ChatMessage[]) => void;
};

export const useTutorChatStore = create<ChatState>((set) => ({
  messages: [],
  pending: false,
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  setPending: (v) => set({ pending: v }),
  reset: () => set({ messages: [], pending: false }),
  hydrate: (messages) => set({ messages }),
}));

