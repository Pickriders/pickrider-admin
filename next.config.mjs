/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export",
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
