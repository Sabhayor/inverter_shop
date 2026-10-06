import type { Config } from "tailwindcss";
const config: Config = { content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"], theme: { extend: { colors: { navy: "#071B5C", red: "#D71920", mist: "#F5F7FA" }, fontFamily: { sans: ["Arial", "Helvetica", "sans-serif"] } } }, plugins: [] };
export default config;
