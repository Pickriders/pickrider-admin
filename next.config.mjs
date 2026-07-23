/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export",
  images: {
    // Avatars/photos come from many providers (Google, Cloudinary, uploaded
    // storage, etc.), so allow any https host. This is an internal admin.
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
