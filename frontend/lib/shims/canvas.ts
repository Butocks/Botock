export type CanvasContext2D = {
  fillStyle: string;
  fillRect: (x: number, y: number, width: number, height: number) => void;
};

export type CanvasShim = {
  width: number;
  height: number;
  getContext: (type: "2d", options?: { willReadFrequently?: boolean }) => CanvasContext2D | null;
  toBuffer: () => Buffer;
};

export function createCanvas(width: number, height: number): CanvasShim {
  return {
    width,
    height,
    getContext: () => null,
    toBuffer: () => Buffer.alloc(0),
  };
}

export default {
  createCanvas,
};