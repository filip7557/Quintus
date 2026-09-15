export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_PATTERN = /^\+?[0-9\s().-]+$/;

export function getEmailWarning(value, { required = true } = {}) {
  const email = String(value ?? "").trim();
  if (!email) return required ? "Unesite email adresu." : "";
  if (email.length > 254) return "Email adresa može imati najviše 254 znaka.";
  if (!EMAIL_PATTERN.test(email)) return "Unesite ispravnu email adresu.";
  return "";
}

export function getPhoneWarning(value) {
  const phone = String(value ?? "").trim();
  if (!phone) return "";
  if (phone.length > 32) return "Broj telefona može imati najviše 32 znaka.";
  if (!PHONE_PATTERN.test(phone)) return "Broj telefona sadrži nedopuštene znakove.";
  return "";
}

export function getPasswordWarning(value, { requireComplexity = false } = {}) {
  const password = String(value ?? "");
  if (password.length < 8) return "Lozinka mora imati najmanje 8 znakova.";
  if (password.length > 128) return "Lozinka može imati najviše 128 znakova.";
  if (!requireComplexity) return "";
  if (!/[A-Z]/.test(password)) return "Lozinka mora sadržavati veliko slovo.";
  if (!/[a-z]/.test(password)) return "Lozinka mora sadržavati malo slovo.";
  if (!/[0-9]/.test(password)) return "Lozinka mora sadržavati broj.";
  if (!/[!@#$%^&*()_\-=+[\]{}|;:'",.<>?/`~]/.test(password))
    return "Lozinka mora sadržavati poseban znak.";
  return "";
}
