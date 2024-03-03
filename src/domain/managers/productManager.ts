import container from "../../container";

type product = {
    readonly id:string,
    title: string,
    description: string,
    price: number,
    thumbnail: string,
    code: string,
    stock: number,
    status: boolean
}

export interface ProductRepositoryModelMethods {
    docCount():Promise<number>;
    getAll(limit:number | undefined, page:number | undefined): Promise<product[]>;
    getAsc(): Promise<product[]>;
    getDesc(): Promise<product[]>;
    getOne(id: string): Promise<product>;
    create(data: product): Promise<product>;
    updateOne(id: string, data: product): Promise<product>;
    deleteOne(id: string): Promise<void>;
}

class ProductManager{
    private productRepository: ProductRepositoryModelMethods;

    constructor() {
        this.productRepository = container.resolve('ProductRepository');
    }

    async getAll(sort: string | undefined, limit:number | undefined, page:number | undefined){
        if (sort === "asc") {
            return this.productRepository.getAsc();
        } 
        
        if (sort === "desc") {
            return this.productRepository.getDesc();
        }

        let resLimit = limit;

        if(!limit){
            resLimit = await this.productRepository.docCount();
        }

        return this.productRepository.getAll(resLimit, page);
    }

    async getOne(id:string) {
        const product = await this.productRepository.getOne(id);

        if(product===null){
            throw new Error('Not Found Id');
        }

        return product;
    }

    async create(data:product) {
        return this.productRepository.create(data);
    }

    async updateOne(id:string, data:product){
        const validateId = await this.productRepository.getOne(id);

        if(validateId===null){
            throw new Error('Not Found Id');
        }

        return this.productRepository.updateOne(id, data);
    }

    async deleteOne(id: string) {
        const validateId = await this.productRepository.getOne(id);

        if(validateId===null){
            throw new Error('Not Found Id');
        }

        return this.productRepository.deleteOne(id);
    }
}

export default ProductManager;