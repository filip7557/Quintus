export const metadata = {
  title: "Vlasnici | Quintus",
  description:
    "Administracija vlasničkih računa i ovlasti unutar Quintus sustava.",
  alternates: {
    canonical: "/admin/owners",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminOwnersLayout({ children }) {
  return children;
}
