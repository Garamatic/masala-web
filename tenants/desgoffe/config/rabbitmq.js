export const rabbitmqConfig = {
    tenant: 'desgoffe',
    api: {
        baseUrl: window.__API_BASE__ || 'http://localhost:5000',
        submitEndpoint: '/api/portal/submit',
    },
    queues: {
        formSubmissions: 'desgoffe.form_submissions',
        notifications: 'desgoffe.notifications',
    },
    exchange: 'garamatic.events', // matches contract
    routingKey: 'event.ticket.created', // matches contract routing key
};
