import z from 'zod';

const productCreateValidation = z.object({
    title: z.string().min(4).max(20),
    description: z.string().min(4).max(50),
    price: z.number(),
    thumbnail: z.string(),
    code: z.string(),
    stock: z.number().max(999),
    status: z.boolean()
});

export default productCreateValidation;