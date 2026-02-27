/**
 * NAUTI ONE — Supabase Mutation Interceptor
 * 
 * Patches the Supabase client to intercept all mutation results
 * and automatically publish domain events.
 * 
 * This runs once at app startup and makes ALL existing code
 * automatically integrated without changing any components.
 */

import { supabase } from "@/integrations/supabase/client";
import { interceptMutation } from "./auto-integration-interceptor";
import { logger } from "@/lib/logger";

let patched = false;

/**
 * Installs the auto-integration interceptor on the Supabase client.
 * After this, every .from(table).insert/update/delete/upsert that
 * returns data will automatically publish the corresponding domain event.
 */
export function installAutoIntegration(): void {
  if (patched) return;
  patched = true;

  const originalFrom = (supabase.from as Function).bind(supabase);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- monkey-patching supabase.from() for auto-integration
  (supabase as any).from = function interceptedFrom(table: string) {
    const builder = originalFrom(table);

    // Patch insert
    const origInsert = builder.insert.bind(builder);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- interceptor needs flexible typing
    builder.insert = function (values: any, options?: any) {
      const chain = origInsert(values, options);
      return wrapChainWithInterceptor(chain, table, 'insert');
    };

    // Patch update
    const origUpdate = builder.update.bind(builder);
    builder.update = function (values: any, options?: any) {
      const chain = origUpdate(values, options);
      return wrapChainWithInterceptor(chain, table, 'update');
    };

    // Patch delete
    const origDelete = builder.delete.bind(builder);
    builder.delete = function (options?: any) {
      const chain = origDelete(options);
      return wrapChainWithInterceptor(chain, table, 'delete');
    };

    // Patch upsert
    const origUpsert = builder.upsert.bind(builder);
    builder.upsert = function (values: any, options?: any) {
      const chain = origUpsert(values, options);
      return wrapChainWithInterceptor(chain, table, 'upsert');
    };

    return builder;
  };

  logger.info('[AutoIntegration] Interceptor installed — all mutations now publish events');
}

/**
 * Wraps a PostgREST chain's .then() to intercept successful results.
 * This is non-invasive: if the mutation fails, nothing happens.
 */
function wrapChainWithInterceptor(
  chain: any,
  table: string,
  operation: 'insert' | 'update' | 'delete' | 'upsert'
): any {
  const origThen = chain.then?.bind(chain);

  if (origThen) {
    chain.then = function (onFulfilled?: any, onRejected?: any) {
      return origThen(
        (result: any) => {
          // Only intercept successful mutations that return data
          if (result && !result.error && result.data) {
            try {
              interceptMutation(table, operation, result.data);
            } catch (err) {
              // Never let interceptor errors break the app
              logger.warn('[AutoIntegration] Interceptor error', err);
            }
          }
          return onFulfilled ? onFulfilled(result) : result;
        },
        onRejected
      );
    };
  }

  return chain;
}
