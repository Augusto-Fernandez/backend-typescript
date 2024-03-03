import z from 'zod';

const userCreateValidation = z.object({
    userName: z.string().min(5).max(35),
    email: z.string().email(),
    password: z.string().min(8)
});

export default userCreateValidation;