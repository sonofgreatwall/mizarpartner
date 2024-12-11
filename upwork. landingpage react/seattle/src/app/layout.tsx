import "./globals.css";
import TopBar from "./ui/Topbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`font-poppins`}
      >
        <TopBar></TopBar>
        <div className="lg:h-[calc(100vh-90px)] h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
