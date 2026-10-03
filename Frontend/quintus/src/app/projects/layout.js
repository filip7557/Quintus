import GalleryAccessGate from "./GalleryAccessGate";

export const metadata = {
  title: "Galerija projekata | Quintus",
  robots: { index: false, follow: false },
};

export default function ProjectsLayout({ children }) {
  return <GalleryAccessGate>{children}</GalleryAccessGate>;
}