import "./globals.css";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import SessionProvider from "./components/auth/SessionProvider";
import { AuthErrorHandler } from "./components/auth/AuthErrorHandler";
export const metadata = {
  title: "Planora",
  description: "AI-Powered Travel Planner",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white">
        <SessionProvider>
          <AuthErrorHandler />
          <ThemeProvider>
            <CurrencyProvider>{children}</CurrencyProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
