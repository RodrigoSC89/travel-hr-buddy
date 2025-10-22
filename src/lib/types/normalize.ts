// @ts-nocheck
export const undef = <T>(v: T | null | undefined) => (v ?? undefined);

// List helpers
export const normalizeList = <T>(rows: any[], map: (r:any)=>T): T[] => rows?.map(map) ?? [];
