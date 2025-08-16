import { create } from "zustand";
import { type UniversityARWU, type UniversityCategoriesARWU, type HMTUniversityARWU } from "../api";
import { persist } from "zustand/middleware";

export type UniversityStore = {
  univList: UniversityARWU[];
  categoryData: UniversityCategoriesARWU;
  // 是否完成初始化, 理论上 App.tsx 会在首次加载获取数据以后设置该属性
  initialized: boolean;

  setUnivList: (list: UniversityARWU[]) => void;
  setCategoryData: (data: UniversityCategoriesARWU) => void;
  setInitialized: (initialized: boolean) => void;
};

// 高校 store, 由于数据量大使用 zustand 暂时缓存
export const useUniversityStore = create<UniversityStore>()((set) => ({
  initialized: false,
  univList: [],
  categoryData: {
    provinces: [],
    univCategories: [],

    univLevels: [],
    eduLevels: [],
  },

  setUnivList: (list) => set(() => ({ univList: list })),
  setCategoryData: (data) => set(() => ({ categoryData: data })),
  setInitialized: (isInitialized) => set(() => ({ initialized: isInitialized })),
}));

// 港澳台高校的 store
export type HMTUniversityStore = {
  hmtUnivList: HMTUniversityARWU[];
  setHMTUnivList: (list: HMTUniversityARWU[]) => void;
};

export const useHMTUniversityStore = create<HMTUniversityStore>()((set) => ({
  hmtUnivList: [],
  setHMTUnivList: (list) => set(() => ({ hmtUnivList: list })),
}));

// 设置的 store
export type SettingsStore = {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
};

export const useSettingsStore = create<SettingsStore>()((set) => ({
  theme: "light",
  setTheme: (theme) => set(() => ({ theme })),
}));

export type FavoriteUnivStore = {
  // 存高校的 ups, 如果 hmt 为 true, 代表是港澳台高校, 否则是大陆高校
  favoriteUps: { up: string; hmt?: boolean }[];
  addFavorite: (up: string, hmt?: boolean) => void;
  removeFavorite: (up: string) => void;
};

// 使用 zustand 的持久化存储来保存用户收藏的高校
export const useFavoriteUnivStore = create<FavoriteUnivStore>()(
  persist(
    (set) => ({
      favoriteUps: [],
      addFavorite: (up: string, hmt: boolean = false) =>
        set((state) => ({ favoriteUps: [...state.favoriteUps, { up, hmt }] })),
      removeFavorite: (up: string) => set((state) => ({ favoriteUps: state.favoriteUps.filter((u) => u.up !== up) })),
    }),
    {
      name: "favorite-universities",
    }
  )
);
