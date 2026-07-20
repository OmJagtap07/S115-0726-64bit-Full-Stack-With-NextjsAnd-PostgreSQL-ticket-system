export const redis = {
  get: async (key: string) => null,
  setex: async (key: string, time: number, val: string) => null,
  on: (event: string, cb: any) => null
} as any;
