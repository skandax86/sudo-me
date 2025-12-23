'use client';

import { ReactNode } from 'react';
import { ToastProvider } from '@/components/ui/Toast';
import { PageTransition } from '@/components/motion';
import { ThemeProvider } from '@/components/theme';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <PageTransition>
          {children}
        </PageTransition>
      </ToastProvider>
    </ThemeProvider>
  );
}
