/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export",
  images: {
    // Avatars/photos come from many providers (Google, Cloudinary, uploaded
    // storage, IPFS seed data, etc.). Skip server-side optimization so a broken
    // or unreachable source can't 500 the image endpoint — the browser just
    // fails the <img> and our components fall back to initials.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/auth/login",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
