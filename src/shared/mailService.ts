import nodemailer from "nodemailer";
import { resolve } from 'path';
import fs from "fs";
import Handlebars from 'handlebars';
import env from "../config/validateEnv";

interface SmtpConfig {
    host: string;
    port: number;
    auth: {
        user: string;
        pass: string;
    };
    secure: boolean;
}

class MailService {
    private smtp_config: SmtpConfig;

    constructor() {
        this.smtp_config = {
            host: 'smtp.gmail.com',
            port: 587,
            auth: {
                user: env.SMTP_EMAIL,
                pass: env.SMTP_KEY
            },
            secure: false
        };
    }

    async send(templateFile:string, data:object, to:string, subject:string) {
        const transporter = nodemailer.createTransport(this.smtp_config);

        const templatePath = resolve(`src/presentation/templates/${templateFile}`);
        const source = fs.readFileSync(templatePath).toString();
        const template = Handlebars.compile(source);
        const html = template(data);

        const mailOptions = {
            from: process.env.SMTP_EMAIL,
            to: to,
            subject: subject,
            html
        };

        await transporter.sendMail(mailOptions);
    }
}

export default MailService;
