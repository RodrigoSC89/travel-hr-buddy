/**
 * Dexie.js type patch - resolves TS1540 error
 * This file overrides the problematic namespace declaration in dexie's types
 */
declare module 'dexie' {
  import { Dexie as DexieClass, Table as DexieTable } from 'dexie/dist/dexie';
  export default DexieClass;
  export type { DexieTable as Table };
  export = DexieClass;
}
