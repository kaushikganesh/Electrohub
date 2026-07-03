import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ElectroHub | Premium Electronics Marketplace",
  description: "Discover premium technology and electronics hand-picked for the discerning buyer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-background text-foreground">
        <header className="flex items-center justify-between p-4 bg-gray-900 text-white shadow-md">
          <nav className="flex space-x-4">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/profile" className="hover:underline">Profile</Link>
          <Link href="/settings" className="hover:underline">Settings</Link>
</nav>
        </header>
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
