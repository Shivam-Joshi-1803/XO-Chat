import type { Metadata } from 'next';
import { Hanken_Grotesk, JetBrains_Mono } from 'next/font/google';
import { SocketProvider } from '@/providers/SocketProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import './globals.css';

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-hanken-grotesk',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'XOChat — Anonymous Real-Time Chat',
  description: 'Private, secure, and completely anonymous conversations without phone numbers or emails.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${hankenGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('xo_theme') || 'light';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans overflow-x-hidden selection:bg-[#FF4F00] selection:text-white" suppressHydrationWarning>
        <ToastProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
