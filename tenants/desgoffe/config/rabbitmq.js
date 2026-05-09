// tenants/desgoffe/config/rabbitmq.js
export const rabbitmqConfig = {
    tenant: 'desgoffe',
    api: {
        baseUrl: window.__API_BASE__ || 'http://localhost:3001',
        submitEndpoint: '/api/portal/submit',
    },
    queues: {
        formSubmissions: 'desgoffe.form_submissions',
        notifications: 'desgoffe.notifications',
    },
    exchange: 'masala.tenants',
    routingKey: 'desgoffe.form',
};