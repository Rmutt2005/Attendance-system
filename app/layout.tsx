import "./globals.css";
import type { Metadata } from "next";
import AppChrome from "./AppChrome";

export const metadata: Metadata = {
  title: "Attendance System",
  description: "Fullstack attendance with geolocation and face detection"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-no-repeat bg-cover">
        <AppChrome />
        <div className="app-page">{children}</div>
      </body>
    </html>
  );
}
