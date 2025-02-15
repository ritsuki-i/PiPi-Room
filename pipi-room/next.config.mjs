/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**', // すべてのホスト名を許可
            },
            {
                protocol: 'http',
                hostname: '**', // HTTP も許可（必要に応じて削除）
            },
        ],
    },
};

export default nextConfig;