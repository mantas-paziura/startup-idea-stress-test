import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import PostHogProvider from "@/components/PostHogProvider";
import PostHogIdentify from "@/components/PostHogIdentify";
import Header from "@/components/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YC Idea Stress Test",
  description: "Stress test your startup idea with a YC-style interview",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#a78bfa",
          colorBackground: "#1a1a1f",
          colorInputBackground: "#27272a",
          colorInputText: "#f5f5f5",
          colorText: "#f5f5f5",
          colorTextSecondary: "#a1a1aa",
          colorNeutral: "#f5f5f5",
          colorTextOnPrimaryBackground: "#ffffff",
          borderRadius: "0.75rem",
        },
        elements: {
          card: {
            backgroundColor: "#1a1a1f",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          },
          headerTitle: {
            color: "#f5f5f5",
          },
          headerSubtitle: {
            color: "#a1a1aa",
          },
          socialButtonsBlockButton: {
            backgroundColor: "#27272a",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#f5f5f5",
            "&:hover": {
              backgroundColor: "#3f3f46",
            },
          },
          formFieldLabel: {
            color: "#d4d4d8",
          },
          formFieldInput: {
            backgroundColor: "#27272a",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#f5f5f5",
            "&::placeholder": {
              color: "#71717a",
            },
          },
          formButtonPrimary: {
            backgroundColor: "#7c3aed",
            "&:hover": {
              backgroundColor: "#6d28d9",
            },
          },
          footerActionLink: {
            color: "#a78bfa",
          },
          dividerLine: {
            backgroundColor: "rgba(255,255,255,0.1)",
          },
          dividerText: {
            color: "#71717a",
          },
          footer: {
            "& + div": {
              color: "#71717a",
            },
          },
        },
      }}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col" style={{ background: "var(--background)", color: "var(--foreground)" }}>
          <PostHogProvider>
            <PostHogIdentify />
            <Header />
            {children}
          </PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
