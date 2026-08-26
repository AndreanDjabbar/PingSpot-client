import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import { 
  ConfirmationModalProvider, 
  ImagePreviewModalProvider, 
  ReactQueryClientProvider,
  ReportFilterModalProvider,
} from "@/provider";
import { OptionsModalProvider } from "@/provider";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { ToastContainer } from "react-toastify";
import ClientLayout from "./client-layout";

export const metadata = {
  title: 'PingSpot',
}

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta",
  fallback: ["system-ui", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
});

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${plusJakartaSans.variable} antialiased`} style={{ fontFamily: "var(--font-sf)" }}>
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