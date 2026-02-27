import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Attendance System",
  description: "Fullstack attendance with geolocation and face detection"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
