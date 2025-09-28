import Navbar from "@/components/Navbar";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "StudyHub",
  description: "A notes marketplace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">

      <body>
        
        <AuthProvider>
          <Navbar/>
          {children}
          </AuthProvider>
      </body>
    </html>
  );
}
