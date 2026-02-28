import "./globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import AppChrome from "./AppChrome";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat"
});

export const metadata: Metadata = {
  title: "Attendance System",
  description: "Fullstack attendance with geolocation and face detection"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="font-sans min-h-screen bg-no-repeat bg-cover">
        <AppChrome />
        <div className="app-page">{children}</div>
      </body>
    </html>
  );
}
