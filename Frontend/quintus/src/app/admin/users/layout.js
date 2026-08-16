export const metadata = {
  title: "Korisnici | Quintus",
  description: "Upravljanje korisnicima i korisničkim ovlastima unutar Quintus sustava.",
  alternates: {
    canonical: "/admin/users",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminUsersLayout({ children }) {
  return children;
}
