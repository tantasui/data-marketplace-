import { ReactNode } from 'react';
import Link from 'next/link';
import { ConnectButton } from '@mysten/dapp-kit';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DataMarket
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                href="/consumer"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Marketplace
              </Link>
              <Link
                href="/provider"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Provider Dashboard
              </Link>
            </div>

            {/* Wallet Connect */}
            <div className="flex items-center">
              <ConnectButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">DataMarket</h3>
              <p className="text-gray-600 text-sm">
                Decentralized IoT data marketplace powered by Sui, Walrus, and Seal.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/consumer" className="text-gray-600 hover:text-blue-600">
                    Browse Data Feeds
                  </Link>
                </li>
                <li>
                  <Link href="/provider" className="text-gray-600 hover:text-blue-600">
                    Become a Provider
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Technology</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Sui Blockchain</li>
                <li>• Walrus Storage</li>
                <li>• Seal Encryption</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
            © 2024 DataMarket. Built for Sui Hackathon.
          </div>
        </div>
      </footer>
    </div>
  );
}
