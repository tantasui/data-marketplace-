import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@mysten/dapp-kit/dist/index.css';

const ClientProviders = dynamic(() => import('@/components/common/ClientProviders'), {
  ssr: false,
});

// Create query client
const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ClientProviders>
        <Component {...pageProps} />
      </ClientProviders>
    </QueryClientProvider>
  );
}
