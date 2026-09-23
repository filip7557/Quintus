export const metadata = {
  title: "Pretraga predračuna | Quintus",
  description:
    "Pretražite postojeće predračune i brzo pronađite tražene stavke.",
  alternates: {
    canonical: "/estimates/list",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function EstimateListLayout({ children }) {
  return children;
}
