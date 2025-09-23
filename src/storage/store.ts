import Store from "electron-store";

// Export store với type và method .set
const store = new Store() as Store & {
  set: (key: string, value: any) => void;
  get: <T = any>(key: string) => T;
};

export default store;