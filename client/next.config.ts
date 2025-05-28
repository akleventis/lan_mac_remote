import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "export",
    env: {
        SERVER_IP: process.env.SERVER_IP // ip address of server hosted on corresponding mac
    },
    // Allow all origins in development
    ...(process.env.NODE_ENV === 'development' && {
        allowedDevOrigins: ['*']
    })
};

export default nextConfig;
