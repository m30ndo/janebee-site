import "server-only";

/** Settings for "you left something in your basket" emails (Studio → Messages → Basket reminders). */
export type BasketReminderSettings = { enabled: boolean; firstAfterHours: number; secondAfterHours: number; subject: string; intro: string };

export const BASKET_DEFAULTS: BasketReminderSettings = {
  enabled: true,
  firstAfterHours: 1,
  secondAfterHours: 24,
  subject: "You left something in your basket",
  intro: "Still thinking about it? Good taste takes a minute. Your basket is saved, but originals are one of one, so if someone else falls for it first, it's gone.",
};

export function normaliseBasketSettings(v: unknown): BasketReminderSettings {
  const o = (v && typeof v === "object" ? v : {}) as Partial<BasketReminderSettings>;
  const h = (n: unknown, d: number, min: number, max: number) => (typeof n === "number" && n >= min && n <= max ? n : d);
  return {
    enabled: typeof o.enabled === "boolean" ? o.enabled : BASKET_DEFAULTS.enabled,
    firstAfterHours: h(o.firstAfterHours, BASKET_DEFAULTS.firstAfterHours, 1, 72),
    secondAfterHours: o.secondAfterHours === 0 ? 0 : h(o.secondAfterHours, BASKET_DEFAULTS.secondAfterHours, 2, 168),
    subject: typeof o.subject === "string" && o.subject.trim() ? o.subject.trim().slice(0, 120) : BASKET_DEFAULTS.subject,
    intro: typeof o.intro === "string" && o.intro.trim() ? o.intro.trim().slice(0, 1000) : BASKET_DEFAULTS.intro,
  };
}
