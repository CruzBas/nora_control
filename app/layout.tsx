import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NÖRA CONTROL — Panel de Gestión",
  description:
    "Sistema integral de gestión empresarial. Controla inventarios, ventas, personal y más desde un solo lugar.",
  keywords: ["gestión", "inventario", "ventas", "restaurante", "control", "NÖRA"],
  authors: [{ name: "NÖRA CONTROL CR" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
