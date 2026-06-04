export const environment = {
    production: process.env.REACT_APP_PRODUCTION === 'true',
    API_URL: process.env.REACT_APP_API_URL || "http://127.0.0.1:8000",
};