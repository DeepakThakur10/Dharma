import { z } from 'zod';

export const createWorkspaceSchema = z.object({
    body: z.object({
        name: z.string().min(3).max(50),
        description: z.string().max(500).optional(),
        slug: z.string().regex(/^[a-z0-9-]+$/).optional()
    })
});

export const updateWorkspaceSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Workspace ID')
    }),
    body: z.object({
        name: z.string().min(3).max(50).optional(),
        slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
        description: z.string().max(500).optional()
    })
});
