import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'app.gloo.beauty',
    appName: 'GLOO',
    webDir: 'dist',
    server: {
        // 프로덕션에서는 로컬 빌드를 사용하고,
        // 개발 중에는 아래 url을 활성화하여 핫 리로드 가능
        // url: 'http://localhost:5173',
        androidScheme: 'https',
    },
    plugins: {
        SplashScreen: {
            launchAutoHide: true,
            launchShowDuration: 2000,
            backgroundColor: '#F3EEFF',
            showSpinner: false,
        },
        StatusBar: {
            style: 'LIGHT',
            backgroundColor: '#F3EEFF',
        },
    },
    // iOS 설정
    ios: {
        contentInset: 'automatic',
        scheme: 'GLOO',
    },
    // Android 설정
    android: {
        allowMixedContent: true,
    },
};

export default config;
