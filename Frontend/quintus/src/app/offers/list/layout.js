export const metadata = {
  title: "Pretraga ponuda | Quintus",
  description:
    "Pretražite postojeće ponude i brzo pronađite tražene stavke.",
  alternates: {
    canonical: "/offers/list",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function OfferListLayout({ children }) {
  return children;
}
