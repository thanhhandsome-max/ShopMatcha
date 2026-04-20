'use client';

import { ReactNode, useEffect, useState } from 'react';
import '../src/index.css';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { loadRuntimeConfig } from '@/lib/config';
import { AuthProvider } from '@/contexts/AuthContext';

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initializeApp() {
      try {
        await loadRuntimeConfig();
      } catch (error) {
        console.warn(
          'Failed to load runtime configuration, using defaults:',
          error
        );
      } finally {
        setIsLoading(false);
      }
    }

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <html lang="en">
        <body>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">Loading...</div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              {children}
            </TooltipProvider>
          </QueryClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
