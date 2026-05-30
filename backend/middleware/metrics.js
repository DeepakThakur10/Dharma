import client from 'prom-client';

const register = new client.Registry();

register.setDefaultLabels({
    app: 'dharma-backend',
});

client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

const httpRequestTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);

const getRouteLabel = (req) => {
    if (req.route?.path) {
        return `${req.baseUrl || ''}${req.route.path}`;
    }

    return req.path || 'unknown';
};

export const metricsMiddleware = (req, res, next) => {
    if (req.path === '/metrics') {
        return next();
    }

    const endTimer = httpRequestDuration.startTimer();

    res.on('finish', () => {
        const labels = {
            method: req.method,
            route: getRouteLabel(req),
            status_code: String(res.statusCode),
        };

        httpRequestTotal.inc(labels);
        endTimer(labels);
    });

    next();
};

export const metricsHandler = async (req, res, next) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (error) {
        next(error);
    }
};
