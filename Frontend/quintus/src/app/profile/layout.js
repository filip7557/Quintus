export const metadata = {
  title: "Moj profil | Quintus",
  description:
    "Pregledajte i uredite podatke svog korisničkog profila u Quintus aplikaciji.",
  alternates: {
    canonical: "/profile",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfileLayout({ children }) {
  return children;
}
