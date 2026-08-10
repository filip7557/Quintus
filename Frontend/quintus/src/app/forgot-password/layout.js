export const metadata = {
  title: "Zaboravljena lozinka | Quintus",
  description:
    "Zatražite link za reset lozinke i vratite pristup svom Quintus korisničkom računu.",
  alternates: {
    canonical: "/forgot-password",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordLayout({ children }) {
  return children;
}
