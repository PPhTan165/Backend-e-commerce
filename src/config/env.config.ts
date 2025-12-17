
export default () => ({
    database: { 
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        name: process.env.DB_NAME,
    },
    jwt: {
        secret: process.env.JWT_SECRET
    }
})