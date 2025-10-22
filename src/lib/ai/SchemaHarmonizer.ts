// src/lib/ai/SchemaHarmonizer.ts
/**
 * Este módulo intercepta respostas do Supabase e normaliza campos
 * com tipagem inconsistente (null, undefined, unknown).
 */
export const harmonizeSchema = <T extends Record<string, any>>(data: T[]): T[] => {
  return data.map((item) => {
    const safe: Record<string, any> = {};
    for (const [key, value] of Object.entries(item)) {
      if (value === null || value === undefined) {
        safe[key] = "";
      } else if (typeof value === "object" && !Array.isArray(value)) {
        safe[key] = harmonizeSchema([value])[0];
      } else {
        safe[key] = value;
      }
    }
    return safe as T;
  });
};

// Uso recomendado: antes de setState ou render
// setFeedback(harmonizeSchema(data));
