import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Intraday Trading Dashboard',
  description: 'Simulate and backtest intraday strategies with live-like charts.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="header">
            <h1>Intraday Trading Dashboard</h1>
          </header>
          <main className="main">{children}</main>
          <footer className="footer">Built for rapid experimentation</footer>
        </div>
      </body>
    </html>
  );
}
