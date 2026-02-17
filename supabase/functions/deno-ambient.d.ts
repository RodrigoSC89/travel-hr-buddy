// Ambient declarations to satisfy TypeScript in the monorepo for Deno-based edge functions

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Promise<Response> | Response): void;
};

// Standard Request/Response types for Edge Functions
type EdgeRequest = Request;

declare module 'https://deno.land/std@0.168.0/http/server.ts' {
  export function serve(handler: (req: Request) => Promise<Response> | Response, options?: any): void;
}

declare module 'https://deno.land/std@0.224.0/http/server.ts' {
  export function serve(handler: (req: Request) => Promise<Response> | Response, options?: any): void;
}

declare module 'https://esm.sh/@supabase/supabase-js@2' {
  const supabase: any;
  export function createClient(url: string, key: string, opts?: any): any;
  export default supabase;
}

declare module 'https://esm.sh/@supabase/supabase-js@2.57.4' {
  const supabase: any;
  export function createClient(url: string, key: string, opts?: any): any;
  export default supabase;
}

declare module 'https://esm.sh/@supabase/supabase-js@2.39.0' {
  const supabase: any;
  export function createClient(url: string, key: string, opts?: any): any;
  export default supabase;
}

declare module 'https://esm.sh/@supabase/supabase-js@2.39.1' {
  const supabase: any;
  export function createClient(url: string, key: string, opts?: any): any;
  export default supabase;
}

declare module 'https://esm.sh/@supabase/supabase-js@2.39.3' {
  const supabase: any;
  export function createClient(url: string, key: string, opts?: any): any;
  export default supabase;
}

declare module 'https://esm.sh/@supabase/supabase-js@2.39.7' {
  const supabase: any;
  export function createClient(url: string, key: string, opts?: any): any;
  export default supabase;
}

declare module 'https://esm.sh/@supabase/supabase-js@2.7.1' {
  const supabase: any;
  export function createClient(url: string, key: string, opts?: any): any;
  export default supabase;
}

declare module 'https://esm.sh/@supabase/supabase-js@2.49.1' {
  const supabase: any;
  export function createClient(url: string, key: string, opts?: any): any;
  export default supabase;
}

// Fallback generic esm.sh module (catch common patterns)
declare module 'https://esm.sh/*' {
  const anymod: any;
  export default anymod;
}
