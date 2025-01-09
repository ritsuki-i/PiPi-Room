import { defineConfig } from "@pandacss/dev";
import { button } from './src/styles/button-recipe';

export default defineConfig({
  // Required: Add the preset to your config.
  presets: ['@shadow-panda/preset'],
 
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ["./src/**/*.{js,jsx,ts,tsx}", "./pages/**/*.{js,jsx,ts,tsx}"],

  // Files to exclude
  exclude: [],

  // Useful for theme customization
  // テーマ拡張
  theme: {
    extend: {
      recipes: {
        button,
      },
    },
  },
  
  jsxFramework: 'react',
  emitPackage: true,
  // The output directory for your css system
  outdir: '@shadow-panda/styled-system',
});
