import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ReactQueryProvider } from "./query-provider";
import { ClusterProvider } from '@/components/cluster';
import { SolanaProvider } from '@/components/provider';
import { UiLayout } from '@/components/ui';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Market",
  description: "Market is a decentralized exchange for Solana tokens.",
};

const links: { label: string; path: string }[] = [

];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          <ClusterProvider>
            <SolanaProvider>
              <UiLayout links={links}>{children}</UiLayout>
            </SolanaProvider>
          </ClusterProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}

