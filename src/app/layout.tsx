import "./globals.css";
import { Manrope } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { ToastContainer } from "react-toastify";
import ClientLayout from "./client-layout";
import { ConfirmationModalProvider, ImagePreviewModalProvider } from "@/provider/AppProvider";
import { ReactQueryClientProvider } from "@/provider/ReactQueryProvider";
import OptionsModalProvider from "@/provider/OptionsProvider";
import ReportFilterModalProvider from "@/provider/ReportFilterProvider";

export const metadata = {
  title: 'PingSpot',
  icons: {
    icon: '/images/pingspot-semi.png',
  },
}

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
  fallback: ["system-ui", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
});

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${manrope.variable} antialiased`}
        style={{ fontFamily: "var(--font-body)" }}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ReactQueryClientProvider>
            <ToastContainer />
            <ClientLayout>
              {children}
              <ConfirmationModalProvider />
              <ImagePreviewModalProvider />
              <OptionsModalProvider />
              <ReportFilterModalProvider />
            </ClientLayout>
          </ReactQueryClientProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export default RootLayout;