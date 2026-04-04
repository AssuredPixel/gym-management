import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "BoxOS — Gym Management Platform",
  description: "The ultimate SaaS platform for CrossFit boxes.",
};

import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'rounded-xl font-bold bg-[#1A1A2E] text-white',
              duration: 4000,
              style: {
                borderRadius: '12px',
                background: '#1A1A2E',
                color: '#fff',
                fontSize: '12px',
                padding: '12px 20px',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}

