import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import { 
  ConfirmationModalProvider, 
  ImagePreviewModalProvider, 
  ReactQueryClientProvider,
  FormInformationModalProvider
} from "@/provider";
import { OptionsModalProvider } from "@/provider";
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

const RootLayout = ({ children }: { children: React.ReactNode }) => {

  return (
    <html lang="en">
      <body className={`${plusJakartaSans.variable} antialiased`} style={{ fontFamily: "var(--font-sf)" }}>
        <ReactQueryClientProvider>
          <ToastContainer />
            <ClientLayout>
              {children}
              <ConfirmationModalProvider />
              <ImagePreviewModalProvider />
              <FormInformationModalProvider />
              <OptionsModalProvider />
            </ClientLayout>
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}

export default RootLayout;