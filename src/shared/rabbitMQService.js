export class RabbitMQFormService {
    constructor(tenantConfig) {
        this.config = tenantConfig;
        this.baseUrl = tenantConfig.api.baseUrl;
    }

    async submitForm(formData) {
        const payload = {
            ...formData,
            tenant: this.config.tenant,
            timestamp: new Date().toISOString(),
            queue: this.config.queues.formSubmissions,
        };

        const response = await fetch(
            `${this.baseUrl}${this.config.api.submitEndpoint}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            }
        );

        if (!response.ok) throw new Error(`Submit failed: ${response.statusText}`);
        return response.json();
    }
}