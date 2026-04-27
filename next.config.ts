import type { NextConfig } from "next"; 

const nextConfig: NextConfig = { 
  // Dominios permitidos para imágenes externas 
  images: { 
    remotePatterns: [ 
      { 
        protocol: "https", 
        hostname: "*.supabase.co", 
        pathname: "/storage/v1/object/public/**", 
      }, 
    ], 
  }, 
};  

export default nextConfig; 