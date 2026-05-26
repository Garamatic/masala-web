/**
 * RabbitMQFormService - Adapter for submitting portal forms via the
 * Ticket Masala message bus (RabbitMQ / REST bridge).
 *
 * This class is consumed by tenant portals that wish to enqueue submissions
 * rather than POSTing directly to the synchronous API.
 */

export class RabbitMQFormService {
    /**
     * @param {Object} tenantConfig - Tenant-specific RabbitMQ configuration
     * @param {string} tenantConfig.tenant - Tenant identifier
     * @param {Object} tenantConfig.api - API endpoint configuration
     * @param {string} tenantConfig.api.baseUrl - Base URL for the submission bridge
     * @param {string} tenantConfig.api.submitEndpoint - Path for the submit endpoint
     * @param {Object} tenantConfig.queues - Queue names
     * @param {string} tenantConfig.queues.formSubmissions - Target queue name
     * @param {string} [tenantConfig.exchange='garamatic.events'] - Exchange name
     * @param {string} [tenantConfig.routingKey='event.ticket.created'] - Routing key
     */
    constructor(tenantConfig) {
        if (!tenantConfig?.api?.baseUrl) {
            throw new Error('RabbitMQFormService requires tenantConfig.api.baseUrl');
        }
        this.config = tenantConfig;
    }

    /**
     * Submit form data via the message bus.
     *
     * NOTE: This method accepts a plain object payload.  If you are working
     * with a FormData instance from a file upload, convert it first:
     *
     *   const plain = Object.fromEntries(formData.entries());
     *   await service.submitForm(plain);
     *
     * @param {Object} fields - Plain key/value object (not a FormData instance)
     * @returns {Promise<Object>} Server response
     */
    async submitForm(fields) {
        const payload = {
            ...fields,
            tenant: this.config.tenant,
            timestamp: new Date().toISOString(),
            queue: this.config.queues.formSubmissions,
            exchange: this.config.exchange ?? 'garamatic.events',
            routingKey: this.config.routingKey ?? 'event.ticket.created',
        };

        const response = await fetch(
            `${this.config.api.baseUrl}${this.config.api.submitEndpoint}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            }
        );

        if (!response.ok) {
            throw new Error(`Submit failed: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }
}
