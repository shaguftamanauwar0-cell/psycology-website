import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Shagufta Manauwar",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-surface-soft/40">{children}</div>;
}
