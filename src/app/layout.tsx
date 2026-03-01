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
      <body className="bg-gray-50 min-h-screen">
        <header className="bg-blue-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-3xl font-bold">BIFROST</h1>
            <p className="text-blue-100 text-sm">Network Route Calculator</p>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-gray-800 text-gray-300 mt-12">
          <div className="container mx-auto px-4 py-6 text-center text-sm">
            © {new Date().getFullYear()} BIFROST - Network Infrastructure Management
          </div>
        </footer>
      </body>
    </html>
  );
}
