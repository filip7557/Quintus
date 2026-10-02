/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    distDir: process.env.NEXT_DIST_DIR || '.next',
    allowedDevOrigins: ['192.168.1.5'],
    experimental: {
        inlineCss: true,
    },
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
            {
                protocol: 'https',
                hostname: 'quintus-files.s3.eu-south-mil.io.cloud.ovh.net',
                pathname: '/images/**',
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
