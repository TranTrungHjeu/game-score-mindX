import type { Metadata } from "next";
import { Mali, Nunito } from "next/font/google";
import "./globals.css";

const headingFont = Mali({
  variable: "--font-heading",
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700"],
});

const bodyFont = Nunito({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Pokémon Evolution Arena",
  description: "Ứng dụng game hóa cho lớp robotics 4-6 tuổi với bảng điểm và Pokémon tiến hóa theo thời gian thực.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      data-scroll-behavior="smooth"
      className={`${headingFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
