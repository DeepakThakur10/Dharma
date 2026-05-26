import { z } from 'zod';

/**
 * Middleware to validate request against a schema
 */
export const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params
        });
        next();
    } catch (err) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: err.errors.map(e => ({
                path: e.path.join('.'),
                message: e.message
            }))
        });
    }
};
