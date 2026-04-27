import type { Metadata } from "next" 
import { Inter } from "next/font/google" 
import { Toaster } from "@/components/ui/sonner" 
import { TooltipProvider } from "@/components/ui/tooltip" 
import "./globals.css" 

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-sans", 
}) 

export const metadata: Metadata = { 
  title: "Gestión Académica", 
  description: "Sistema de gestión universitaria — UCB", 
} 

export default function RootLayout({ 
  children, 
}: { 
  children: React.ReactNode 
}) { 
  return ( 
    <html lang="es" suppressHydrationWarning> 
      <body className={`${inter.variable} font-sans antialiased`}> 
        <TooltipProvider> 
          {children} 
          <Toaster richColors position="top-right" /> 
        </TooltipProvider> 
      </body> 
    </html> 
  ) 
} 