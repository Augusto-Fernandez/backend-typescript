import z from 'zod';

const cartParamsValidation = z.object({
    id: z.string().length(24).regex(/^[A-Za-z0-9]+$/),
    pid: z.string().length(24).regex(/^[A-Za-z0-9]+$/)
});

export default cartParamsValidation;