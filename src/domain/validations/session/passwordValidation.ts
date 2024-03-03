import z from 'zod';

const passwordValidation = z.object({
    password: z.string().min(8)
});

export default passwordValidation;