import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillPath AI — Calibration Instrument & Engineering Drafting Notebook",
  description: "Skill discovery, diagnostic validation, and adaptive learning roadmap.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--paper)] text-[var(--ink)] antialiased font-sans selection:bg-[var(--viridian)] selection:text-[var(--surface)]">
        {children}
      </body>
    </html>
  );
}
