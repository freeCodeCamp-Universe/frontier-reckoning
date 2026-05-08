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
