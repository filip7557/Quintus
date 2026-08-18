/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    turbopack: {
        root: process.cwd(),
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'www.instalacije-quintus.hr',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '/**',
            },
        ],
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Permissions-Policy',
                        value: 'join-ad-interest-group=(), run-ad-auction=(), browsing-topics=()'
                    }
                ]
            }
        ];
    },
};

export default nextConfig;
