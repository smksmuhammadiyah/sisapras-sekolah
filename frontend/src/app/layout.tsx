import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { NetworkStatus } from "@/components/ui/network-status";
import { FeatureFlagProvider } from "@/context/feature-flag-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SIM-SAPRAS",
  description: "Sistem Informasi Manajemen Sarana Prasarana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <FeatureFlagProvider>
            <NetworkStatus />
            {children}
          </FeatureFlagProvider>
          <Toaster position="top-center" toastOptions={{ className: 'z-[9999]' }} />
        </AuthProvider>
      </body>
    </html>
  );
}
