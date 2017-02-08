export default {
    env: 'stage',
    jwtSecret: '4DNSrMPuQ3Y3McBu96wd2GzGheDXuft8gDqLEQVWHnXQfcaGFtM2ZBgyNYzPN7CK',
    db: 'mongodb://localhost/rodin-js-api-stage',
    clientURL: 'https://rodin.design',
    port: 3000,
    socketPort: 4000,
    socketURL: 'https://ss.rodin.space',
    modules: {
        socketService: {
            URL: 'https://modules.rodin.io',
            port: 4000,
        },
    },
    social: {
        facebook: {
            clientID: '263064010794598',
            clientSecret: 'fab25d79d1587fbac5dfd3842cb3e481',
            callbackURL: 'https://rodin.design/auth/facebook/callback',
        },
        google: {
            clientID: 'test',
            clientSecret: 'test',
            callbackURL: 'http://yourdormain:3000/auth/google/callback',
        },
        steam: {
            key: 'D62596D7F75C45FFCFA07B938478844F',
            clientSecret: '12377e383557cecdc463f202cdc89758',
            callbackURL: 'http://localhost:3000/api/auth/steam/callback',
        },
        github: {
            clientId: '5377f212205e0aa4b4cf',
            clientSecret: '5dacd7617b9e63c11c907f99d139b45aafb0a2d1',
        },
    },
    urlshortenerkey: 'AIzaSyCe5zVHHHhhv40N-WzeffxWva377dPQnH8',
    socket: {
        appId: '358b43a076ed7dc0',
        appSecret: '50835ec1-0392-7c98-60be-3f4ad1b7',
    },
    ios: {
        urls: {
            build: 'http://63.135.170.41:9000/api/v1/project',
            cancel: 'http://63.135.170.41:9000/api/v1/project',
            get: 'http://63.135.170.41:9000/api/v1/project',
            download: 'http://63.135.170.41:9000/api/v1/bin',
            getStatus: 'http://63.135.170.41:9000/api/v1/status',
        },
        appId: '2e659ea81e645f84',
        appSecret: 'af7cffae-17ce-25b2-8b76-849df75a',
    },
    android: {
        urls: {
            build: 'http://45.55.92.49:9001/api/v1/project',
            cancel: 'http://45.55.92.49:9001/api/v1/project',
            get: 'http://45.55.92.49:9001/api/v1/project',
            download: 'http://45.55.92.49:9001/api/v1/bin',
            getStatus: 'http://45.55.92.49:9001/api/v1/status',
        },
        appId: 'b250ab167fca8e94',
        appSecret: '6a1e68ce-ea2b-d99d-b5eb-7cbca83a',
    },
    oculus: {
        urls: {
            build: 'http://45.55.92.49:9002/api/v1/project',
            cancel: 'http://45.55.92.49:9002/api/v1/project',
            get: 'http://45.55.92.49:9002/api/v1/project',
            download: 'http://45.55.92.49:9002/api/v1/bin',
            getStatus: 'http://45.55.92.49:9002/api/v1/status',
        },
        appId: '8fb0e4c6fdac3847',
        appSecret: '86bae61d-ddfe-9fbe-e4cd-904fced2',
    },
    payments: {
        tokens: {
            stripe: {
                secret: 'sk_test_Okevb5aLgncqi6W6lmhItxoV',
                publish: 'pk_test_ubTC5Za2RM1vj2VlRYPhvX2r',
            },
        },
    },
    mandrill: 'ouOYaHWxlDaabLYVjrG1BA',
    stuff_path: '/var/www/stuff/',
    nginx_template_path: '/var/www/api.rodin.design/resources/nginx/',
    nginx_dest_path: '/etc/nginx/custom/',
};
