import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'WasteWatch — Government-Grade Fraud Detection & Waste Analysis',
  description:
    'Upload financial data. Detect fraud, waste, and anomalies automatically. Government-grade analysis powered by statistical forensics.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: 'bg-card text-card-foreground border border-border',
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
