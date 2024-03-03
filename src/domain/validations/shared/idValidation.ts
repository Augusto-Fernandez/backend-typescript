import z from 'zod';

const idValidation = z.object({
    id: z.string().length(24).regex(/^[A-Za-z0-9]+$/)
});

export default idValidation;