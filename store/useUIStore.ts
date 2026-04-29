import { create } from 'zustand';

interface UIState {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  isAddModalVisible: boolean;
  setAddModalVisible: (visible: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeCategory: 'All',
  setActiveCategory: (category) => set({ activeCategory: category }),
  isAddModalVisible: false,
  setAddModalVisible: (visible) => set({ isAddModalVisible: visible }),
}));
