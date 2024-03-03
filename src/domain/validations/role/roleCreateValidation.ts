import z from 'zod';

const roleCreateValidation = z.object({
    name: z.string().min(3).max(15),
    permissions: z.array(z.string()).nonempty()
});

export default roleCreateValidation;