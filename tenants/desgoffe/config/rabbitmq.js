export const rabbitmqConfig = {
    tenant: 'desgoffe',
    api: {
        baseUrl:        window.__API_BASE__ || 'https://ca-ticket-masala.kindgrass-f8932dd8.westeurope.azurecontainerapps.io',
        submitEndpoint: '/api/portal/submit',
    },
    queues: {
        formSubmissions: 'desgoffe.form_submissions',
        notifications:   'desgoffe.notifications',
    },
    exchange:   'garamatic.events',        // matches contract
    routingKey: 'event.ticket.created',    // matches contract routing key

    // Maps form <select> values → contract priority enum
    priorityMap: {
        '5':  'low',
        '10': 'medium',
        '15': 'high',
        '20': 'urgent',
    },
};