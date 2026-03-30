import { create } from "zustand";

const useUIStore = create((set) => ({
  isPanelOpen: false,
  selectedDate: new Date(),

  openPanel: () =>
    set({
      isPanelOpen: true,
    }),

  closePanel: () =>
    set({
      isPanelOpen: false,
    }),

  setSelectedDate: (date) =>
    set({
      selectedDate: date,
    }),
}));

export default useUIStore;