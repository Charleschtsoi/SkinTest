/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;

/**
 * OpenNext pulls `workerd` (needs GLIBC 2.35+). Vercel's build image cannot load it.
 * Only enable for local `next dev` — production builds use plain `next build`.
 */
if (process.env.VERCEL !== "1" && process.env.NODE_ENV === "development") {
  try {
    const { initOpenNextCloudflareForDev } = await import("@opennextjs/cloudflare");
    initOpenNextCloudflareForDev();
  } catch (err) {
    // Optional integration for local Cloudflare dev; the app should still run
    // without this dependency installed.
    console.warn(
      "[next.config.mjs] Skipping @opennextjs/cloudflare dev init (dependency missing or failed to load).",
    );
  }
}
