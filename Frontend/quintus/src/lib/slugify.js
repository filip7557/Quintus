const DIACRITIC_MAP = {
  č: "c",
  ć: "c",
  đ: "dj",
  š: "s",
  ž: "z",
  Č: "c",
  Ć: "c",
  Đ: "dj",
  Š: "s",
  Ž: "z",
};

export function slugify(text) {
  const input = String(text ?? "");
  const replacedDiacritics = input.replace(/[čćđšžČĆĐŠŽ]/g, (char) => DIACRITIC_MAP[char] ?? char);

  return replacedDiacritics
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default slugify;
