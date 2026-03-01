import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BIFROST - Network Route Calculator',
  description: 'Calculate optimal network routes through data center infrastructure',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h1 className="text-2xl font-bold text-white tracking-tight">BIFROST</h1>
                    <p className="text-xs text-slate-400">Network Route Calculator</p>
                  </div>
                </div>
              </div>
              <nav className="flex space-x-2">
                <a
                  href="/"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                >
                  Calculator
                </a>
                <a
                  href="/admin"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                >
                  Admin
                </a>
              </nav>
            </div>
          </div>
        </header>
        <main className="min-h-[calc(100vh-5rem)]">
          {children}
        </main>
        <footer className="bg-slate-900 border-t border-slate-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="text-slate-400 text-sm mb-4 sm:mb-0">
                © {new Date().getFullYear()} BIFROST - Network Infrastructure Management
              </div>
              <div className="flex space-x-6 text-sm text-slate-400">
                <span>Version 1.0.0</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
