import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MGLAB — Make Ideas Real",
  description: "MGLAB turns ideas into visible, usable products through strategy, design and experimentation.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
