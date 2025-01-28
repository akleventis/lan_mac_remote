import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    env: {
        SERVER_IP: process.env.SERVER_IP // ip address of server hosted on corresponding mac
    }
};

export default nextConfig;
