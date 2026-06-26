import { google } from 'googleapis';
// import apikeys from "../apikey.json" assert { type: "json" };
import "dotenv/config.js";

const SCOPE = ['https://www.googleapis.com/auth/drive'];

async function authorize() {
    const jwtClient = new google.auth.JWT(
        process.env.CLIENT_EMAIL_GOOGLE,
        null,
        process.env.PRIVATE_KEY_GOOGLE,
        SCOPE
    );
    await jwtClient.authorize();
    return jwtClient;
}

export { authorize };