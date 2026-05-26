import { z } from 'zod';

export const createTaskSchema = z.object({
    body: z.object({
        title: z.string().min(3).max(100),
        description: z.string().optional(),
        workspaceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Workspace ID'),
        priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        status: z.string().optional()
    })
});

export const updateTaskSchema = z.object({
    body: z.object({
        title: z.string().min(3).max(100).optional(),
        description: z.string().optional(),
        status: z.string().optional(),
        priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        assignees: z.array(z.string()).optional()
    }),
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Task ID')
    })
});
