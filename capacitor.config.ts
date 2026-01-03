interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  server?: {
    androidScheme?: string;
    iosScheme?: string;
    hostname?: string;
  };
  ios?: {
    contentInset?: string;
    scrollEnabled?: boolean;
    backgroundColor?: string;
    preferredContentMode?: string;
    scheme?: string;
    allowsLinkPreview?: boolean;
  };
  android?: {
    allowMixedContent?: boolean;
    backgroundColor?: string;
  };
  plugins?: Record<string, unknown>;
}

const config: CapacitorConfig = {
  appId: 'com.gunma.escape',
  appName: 'おまえはグンマーからにげられない',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    hostname: 'localhost'
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    backgroundColor: '#1a1a1a',
    preferredContentMode: 'mobile',
    scheme: 'gunma-escape',
    allowsLinkPreview: false
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#1a1a1a'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1000,
      launchAutoHide: true,
      backgroundColor: '#1a1a1a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      iosSpinnerStyle: 'small'
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1a1a1a'
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    }
  }
};

export default config;

