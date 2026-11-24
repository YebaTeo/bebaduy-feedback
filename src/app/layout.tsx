import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BeBaduy · Suara Huma & Feedback",
  description:
    "Ruang masukan untuk aplikasi BeBaduy — bantu kami merawat pengalaman mengenal tradisi Ngahuma masyarakat Baduy.",
  openGraph: {
    title: "BeBaduy · Suara Huma & Feedback",
    description:
      "Bagikan cerita, temuan bug, dan saranmu untuk aplikasi iOS BeBaduy.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#d8c3b6" },
    { media: "(prefers-color-scheme: dark)", color: "#2c1e14" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased selection:bg-[#f5a640]/30 selection:text-[#fff6ed]">
        {children}
      </body>
    </html>
  );
}
