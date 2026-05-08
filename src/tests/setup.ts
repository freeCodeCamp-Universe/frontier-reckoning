import '@testing-library/jest-dom/vitest';

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value() {
    return {
      canvas: this,
      clearRect: () => undefined,
      createImageData: () => ({ data: [0, 0, 0, 0] }),
      fillRect: () => undefined,
      fillStyle: '',
      getImageData: () => ({ data: [0, 0, 0, 0] }),
      putImageData: () => undefined,
    };
  },
});

const localStorageMap = new Map<string, string>();

Object.defineProperty(window, 'localStorage', {
  value: {
    clear: () => localStorageMap.clear(),
    getItem: (key: string) => localStorageMap.get(key) ?? null,
    removeItem: (key: string) => localStorageMap.delete(key),
    setItem: (key: string, value: string) => localStorageMap.set(key, value),
  },
});
