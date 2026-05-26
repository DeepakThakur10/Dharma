import rateLimit from 'express-rate-limit';

/**
 * Basic rate limiter for Public API
 * In production, use RedisStore for distributed rate limiting
 */
export const publicApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
