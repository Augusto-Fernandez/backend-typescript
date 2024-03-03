import container from "../../container";

type role = {
    name: string,
    permissions: string[]
}

export interface RoleRepositoryModelMethods {
    docCount():Promise<number>;
    getAll(limit:number | undefined, page:number | undefined): Promise<role[]>;
    getOne(id: string): Promise<role>;
    create(data: role): Promise<role>;
    updateOne(id: string, data: role): Promise<role>;
    deleteOne(id: string): Promise<void>;
}

class RoleManager{
    private roleRepository: RoleRepositoryModelMethods;

    constructor(){
        this.roleRepository = container.resolve('RoleRepository');
    }

    async getAll(limit:number | undefined, page:number | undefined){
        let resLimit = limit;

        if(!limit){
            resLimit = await this.roleRepository.docCount();
        }

        return this.roleRepository.getAll(resLimit, page);
    }

    async getOne(id:string) {
        const role = await this.roleRepository.getOne(id);

        if(role===null){
            throw new Error('Not Found Id');
        }

        return role;
    }

    async create(data:role) {
        return this.roleRepository.create(data);
    }

    async updateOne(id:string, data:role){
        const validateId = await this.roleRepository.getOne(id);

        if(validateId===null){
            throw new Error('Not Found Id');
        }

        return this.roleRepository.updateOne(id, data);
    }

    async deleteOne(id: string) {
        const validateId = await this.roleRepository.getOne(id);

        if(validateId===null){
            throw new Error('Not Found Id');
        }

        return this.roleRepository.deleteOne(id);
    }
}

export default RoleManager;
