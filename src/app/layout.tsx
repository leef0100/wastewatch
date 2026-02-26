import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'WasteWatch — Enterprise Waste & Fraud Detection',
  description:
    'Identify wasteful spending, flag anomalies, and optimize budgets. Enterprise-grade waste detection made simple.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
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
