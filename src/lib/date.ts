const MONTHS_SHORT = [
  "січ", "лют", "бер", "квіт", "трав", "черв",
  "лип", "серп", "вер", "жовт", "лист", "груд",
];

export function formatDeadline(deadline: string | null): string | null {
  if (!deadline) return null;
  const parsed = new Date(`${deadline}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return deadline;
  return `до ${parsed.getDate()} ${MONTHS_SHORT[parsed.getMonth()]}`;
}
