import { vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  IntlProvider: ({ children }: { children: React.ReactNode }) => children,
}));

process.setMaxListeners(30);
