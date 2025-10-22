import { vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  IntlProvider: ({ children }: any) => children,
}));

process.setMaxListeners(30);
