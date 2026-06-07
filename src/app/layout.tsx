import "./globals.css";

export const metadata = {
  title: "Clinic Management System",
  description: "Next.js frontend for a Python/FastAPI clinic management system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
