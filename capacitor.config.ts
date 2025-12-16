import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nairobi.enforcement',
  appName: 'Nairobi Enforcement Automator',
  webDir: 'dist', // Assumes Vite build output. Change to 'build' if using Create React App.
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#111827", // Matches the gray-900 theme
      showSpinner: true,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;