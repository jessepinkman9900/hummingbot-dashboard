import type { Metadata } from "next";
import { Oxanium, Source_Code_Pro } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/lib/providers/query-provider";
import { ThemeProvider } from "@/lib/themes/provider";
import { Toaster } from "@/components/ui/sonner";

const oxanium = Oxanium({
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  subsets: ["latin"],
  variable: "--font-oxanium",
});

const sourceCodePro = Source_Code_Pro({
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ["latin"],
  variable: "--font-source-code-pro",
});

export const metadata: Metadata = {
  title: "Hummingbot Dashboard",
  description: "Professional trading bot management and portfolio monitoring dashboard",
  keywords: "hummingbot, trading, cryptocurrency, portfolio, dashboard, bot management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${oxanium.variable} ${sourceCodePro.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
