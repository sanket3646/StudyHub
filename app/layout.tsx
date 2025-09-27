import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "My App",
  description: "Auth example with Supabase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
