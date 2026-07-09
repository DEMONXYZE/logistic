import type { Metadata } from "next";
import { K2D } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const k2d = K2D({
  variable: "--font-k2d",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "WeMove × BOTNOI",
  description: "ระบบจัดการรถขนส่งและตรวจสอบความเสี่ยงคนขับ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${k2d.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body className="min-h-full font-[family-name:var(--font-k2d)]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
