export const metadata = {
  title: "Prijava | Quintus",
  description:
    "Prijavite se u Quintus korisnički račun za pregled zahtjeva i upravljanje ponudama.",
  alternates: {
    canonical: "/auth",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({ children }) {
  return children;
}
