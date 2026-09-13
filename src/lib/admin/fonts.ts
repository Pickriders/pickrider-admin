/** Selectable interface fonts; mirrors the storefront's list. Default is Urbanist. */
export const FONTS = [
  { id: "default", label: "Urbanist (default)", family: "var(--font-urbanist), Urbanist, sans-serif" },
  { id: "rubik", label: "Rubik", family: "Rubik, sans-serif" },
  { id: "faktum", label: "Faktum", family: "var(--font-faktum-test), sans-serif" },
  { id: "space-grotesk", label: "Space Grotesk", family: "'Space Grotesk', sans-serif" },
  { id: "inter", label: "Inter", family: "Inter, sans-serif" },
  { id: "barlow", label: "Barlow", family: "Barlow, sans-serif" },
  { id: "quicksand", label: "Quicksand", family: "Quicksand, sans-serif" },
  { id: "saira", label: "Saira", family: "Saira, sans-serif" },
  { id: "poppins", label: "Poppins", family: "Poppins, sans-serif" },
  { id: "montserrat", label: "Montserrat", family: "Montserrat, sans-serif" },
  { id: "work-sans", label: "Work Sans", family: "'Work Sans', sans-serif" },
  { id: "dm-sans", label: "DM Sans", family: "'DM Sans', sans-serif" },
  { id: "roboto", label: "Roboto", family: "Roboto, sans-serif" },
  { id: "karla", label: "Karla", family: "Karla, sans-serif" },
  { id: "pt-sans", label: "PT Sans", family: "'PT Sans', sans-serif" },
  { id: "julius-sans-one", label: "Julius Sans One", family: "'Julius Sans One', sans-serif" },
  { id: "biorhyme", label: "BioRhyme", family: "BioRhyme, serif" },
] as const;

export type FontId = (typeof FONTS)[number]["id"];

export function fontById(id: string | undefined | null) {
  return FONTS.find((entry) => entry.id === id) ?? FONTS[0];
}

export function applyFont(id: string | undefined | null) {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--admin-font", fontById(id).family);
}
