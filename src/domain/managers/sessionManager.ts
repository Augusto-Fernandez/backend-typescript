import container from "../../container";
import { isValidPassword, generateToken, createHash } from "../../shared";
import MailService from "../../shared/mailService";
import env from "../../config/validateEnv";
import jwt from "jsonwebtoken";

interface user {
    email:string,
    password:string
}

interface registedUser extends user{
    id: string;
    userName: string
}

type resetToken = {
    token: string,
    password:string
}

type tokenPayload = {
    user: {
        _doc: {
            email: string;
        };
    };
    iat: number;
    exp: number;
}

interface UserRepositoryModelMethods{
    getOne(id: string): Promise<registedUser>;
    create(data: user): Promise<registedUser>;
    getOneByEmail(email: string): Promise<registedUser>;
    updateOne(id:string, data:object): Promise<registedUser>;
}

class SessionManager{
    private userRepository: UserRepositoryModelMethods;

    constructor() {
        this.userRepository = container.resolve('UserRepository');
    }

    async login(data: user){
        const user = await this.userRepository.getOneByEmail(data.email);

        if(!user){
            throw new Error('Not Found User Email');
        }

        const isHashedPassword = await isValidPassword(data.password, user.password);

        if(!isHashedPassword){
            throw new Error('Login failed, invalid password.');
        }

        const dto = {
            ...user,
            last_connection: new Date()
        };

        await this.userRepository.updateOne(user.id, dto);

        const accessToken = await generateToken(user);
        return accessToken;
    }

    async signup(data: user){
        const validateEmail = await this.userRepository.getOneByEmail(data.email);
        
        if (validateEmail) {
            throw new Error('Login failed, email already used.');
        }

        const dto = {
            ...data,
            password: await createHash(data.password),
            last_connection: new Date()
        };

        return this.userRepository.create(dto);
    }

    async logout(id:string){
        const user = await this.userRepository.getOne(id);
        
        const dto = {
            ...user,
            last_connection: new Date()
        };
        
        await this.userRepository.updateOne(id, dto);
    }

    async changePassword(data:user){
        const user = await this.userRepository.getOneByEmail(data.email);

        if (user===null) {
            throw new Error('Not Found User Email');
        }

        return this.userRepository.updateOne(user.id, {...user, password: await createHash(data.password)});
    }

    async forgotPassword(email:string){
        const validateMail = await this.userRepository.getOneByEmail(email);
        if (!validateMail) {
            throw new Error('Not Found User Email');
        }

        const user = await this.userRepository.getOneByEmail(email);
        const accessToken = await generateToken(user);

        const message = new MailService();
        const messageInfo = await message.send('forgotPassword.hbs', {userName: user.userName, token: accessToken, url: env.URL}, user.email, 'Password Reset');

        return messageInfo;
    }

    async resetPassword(data:resetToken){
        const authToken = jwt.verify(data.token, env.JWT_PRIVATE_KEY) as tokenPayload;

        const user = await this.userRepository.getOneByEmail(authToken.user._doc.email);

        return this.userRepository.updateOne(user.id, {...user, password: await createHash(data.password)});
    }
}

export default SessionManager;
