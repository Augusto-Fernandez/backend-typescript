import container from "../../container";
import { createHash } from "../../shared";
import { CartRepositoryModelMethods } from "./cartManager";
import { RoleRepositoryModelMethods } from "./roleManager";

type user = {
    userName:string,
    email:string,
    cart:object[],
    role:string[],
    password:string
}

interface UserRepositoryModelMethods{
    docCount():Promise<number>;
    getAll(limit:number | undefined, page:number | undefined): Promise<user[]>;
    getOne(id: string): Promise<user>;
    getOneByEmail(email: string): Promise<user>;
    create(data: user): Promise<user>;
    updateOne(id: string, data: user): Promise<user>;
    deleteOne(id: string): Promise<void>;
    addRole(id: string, data: string): Promise<user>;
    deleteRole(id: string): Promise<user>;
    addCart(id:string, cartId:string): Promise<user>;
    deleteCart(id:string): Promise<user>;
}

class UserManager{
    private userRepository: UserRepositoryModelMethods;
    private cartRepository: CartRepositoryModelMethods;
    private roleRepository: RoleRepositoryModelMethods;

    constructor() {
        this.userRepository = container.resolve('UserRepository');
        this.cartRepository = container.resolve('CartRepository');
        this.roleRepository = container.resolve('RoleRepository');
    }

    async getAll(limit:number | undefined, page:number | undefined){
        let resLimit = limit;

        if(!limit){
            resLimit = await this.userRepository.docCount();
        }

        return this.userRepository.getAll(resLimit, page);
    }

    async getOne(id:string) {
        const user = await this.userRepository.getOne(id);

        if(user===null){
            throw new Error('Not Found Id');
        }

        return user;
    }

    async getOneByEmail(email:string) {
        const user = await this.userRepository.getOneByEmail(email);

        if(user===null){
            throw new Error('Not Found Email');
        }

        return user;
    }

    async create(data:user) {
        const dto = {
            ...data,
            password: await createHash(data.password),
            last_connection: new Date()
        };

        const user = await this.userRepository.create(dto);
        return {...user, password: undefined};
    }

    async updateOne(id:string, data:user){
        const user = await this.userRepository.getOne(id);

        if(user===null){
            throw new Error('Not Found Id');
        }

        return this.userRepository.updateOne(id, data);
    }

    async deleteOne(id: string) {
        const user = await this.userRepository.getOne(id);

        if(user===null){
            throw new Error('Not Found Id');
        }

        return this.userRepository.deleteOne(id);
    }

    async addRole(id:string, roleId:string) {
        const user = await this.userRepository.getOne(id);

        if(user===null){
            throw new Error('Not Found User');
        }

        const role = await this.roleRepository.getOne(roleId);

        if(role===null){
            throw new Error('Not Found Role');
        }

        if(user.role.length>0){
            await this.userRepository.deleteRole(id);
        }

        return this.userRepository.addRole(id, roleId);
    }

    async deleteRole(id:string) {
        const user = await this.userRepository.getOne(id);
        if (user===null) {
            throw new Error('Not Found User');
        }

        const rolesLength = user.role.length;
        if (rolesLength === 0) {
            throw new Error('Not Found Roles');
        }

        return this.userRepository.deleteRole(id);
    }

    async addCart(id:string, cartId:string) {
        const user = await this.userRepository.getOne(id);
        if (user===null) {
            throw new Error('Not Found User');
        }

        const cart = await this.cartRepository.getOne(cartId);
        if (cart===null) {
            throw new Error('Not Found Cart');
        }

        const cartLength = user.cart.length;
        if (cartLength > 0) {
            throw new Error('User Has Cart Already');
        }

        return this.userRepository.addCart(id, cartId);
    }

    async deleteCart(id:string) {
        const user = await this.userRepository.getOne(id);
        if (user===null) {
            throw new Error('Not Found User');
        }

        const cartLength = user.cart.length;
        if (cartLength === 0) {
            throw new Error('Not Found Cart');
        }

        return this.userRepository.deleteCart(id);
    }
}

export default UserManager;
