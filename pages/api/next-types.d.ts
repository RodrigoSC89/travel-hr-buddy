/**
 * Type definitions for Next.js API routes
 * These types are provided for reference/compatibility when this code is used in a Next.js environment
 * This project currently uses Vite + Supabase Edge Functions
 */

import type { IncomingMessage, ServerResponse } from "http";

export interface NextApiRequest extends IncomingMessage {
  query: Partial<{
    [key: string]: string | string[];
  }>;
  cookies: Partial<{
    [key: string]: string;
  }>;
  body: any;
  env: any;
  preview?: boolean;
  previewData?: any;
}

export type NextApiResponse<T = any> = ServerResponse & {
  status: (statusCode: number) => NextApiResponse<T>;
  json: (body: T) => void;
  send: (body: T) => void;
  redirect: (statusOrUrl: number | string, url?: string) => NextApiResponse<T>;
  setPreviewData: (
    data: object | string,
    options?: {
      maxAge?: number;
      path?: string;
    }
  ) => NextApiResponse<T>;
  clearPreviewData: () => NextApiResponse<T>;
  end: () => void;
};
