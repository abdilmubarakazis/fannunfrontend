import "./globals.css";
import Toaster from "@/components/Toaster";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#F9FAFB] text-[#111827]">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
