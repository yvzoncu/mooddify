// app/layout.tsx
import './globals.css';
import './scrollbar.css';
import { Geist, Geist_Mono } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Moodify',
  description: 'Publish your mood...',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased bg-gray-800">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
