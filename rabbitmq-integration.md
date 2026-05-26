# RabbitMQ Integration — Ticket Masala (Desgoffe)

> **Handover document** for the teammate with Fly.io access.  
> Complete all steps in order. Do not skip ahead.

---

## Overview

```
Browser Form (masala-web)
    └── POST /api/portal/submit
            └── .NET API (Fly.io — ticket-masala-api-desgoffe)
                    └── OutboxPublisher → RabbitMQ (Azure VM)
                            └── event: ticket.created (garamatic.events exchange)
```

---

## Who Does What

| Fix | Repo | Who |
|---|---|---|
| Fix 1 — Priority mapping in `portal-form.js` | `masala-web` | Charlotte |
| Fix 2 — `TicketCreatedEvent.cs` snake_case contract | `ticket-masala` | Maarten |
| Fix 3 — Update `rabbitmq.js` config | `masala-web` | Charlotte |
| Steps 1–6 — VM, firewall, secrets, deploy | infra + Fly.io | Wito |

---

## The Required Message Contract

All messages published to RabbitMQ must match this exact schema (`ticket.created`).  
`additionalProperties: false` — no extra fields allowed.

```json
{
  "event_type":     "ticket.created",
  "ticket_id":      "550e8400-e29b-41d4-a716-446655440000",
  "customer_email": "jean.dupont@email.com",
  "customer_name":  "Jean Dupont",
  "tenant_id":      "desgoffe",
  "description":    "Nuisance sonore au 3ème étage depuis 23h.",
  "priority":       "medium",
  "created_at":     "2025-01-15T10:30:00Z"
}
```

**Priority must be a string enum:**

| Form value (`priorite`) | Contract value |
|---|---|
| `5` | `"low"` |
| `10` | `"medium"` |
| `15` | `"high"` |
| `20` | `"urgent"` |

> ⚠️ Fields like `CustomerPhone`, `WorkItemType`, `Tags`, and `Attachment` must NOT appear in the RabbitMQ event. They can stay in the database but must be stripped from the published message.

---

## Fix 1 — `masala-web` · Charlotte · `src/shared/portal-form.js` - Done!

Add a priority mapper helper and send the mapped value alongside the raw score.

Add this method to the `PortalForm` class:

```javascript
priorityToString(score) {
    const map = { '5': 'low', '10': 'medium', '15': 'high', '20': 'urgent' };
    return map[String(score)] ?? 'low';
}
```

Inside `submitForm()`, replace:

```javascript
formData.append('PriorityScore', this.sanitizeInput(document.getElementById('priorite').value));
```

With:

```javascript
const rawPriority = document.getElementById('priorite').value;
formData.append('PriorityScore', this.sanitizeInput(rawPriority));
formData.append('Priority', this.priorityToString(rawPriority));
```

---

## Fix 2 — `ticket-masala` · Maarten or Juan · `TicketCreatedEvent.cs` 

> **This fix is in the `ticket-masala` C# repo, not in `masala-web`.**

Find or create `TicketCreatedEvent.cs` and make it match the contract exactly:

```csharp
using System.Text.Json.Serialization;

public record TicketCreatedEvent
{
    [JsonPropertyName("event_type")]     public string EventType     { get; init; } = "ticket.created";
    [JsonPropertyName("ticket_id")]      public string TicketId      { get; init; }
    [JsonPropertyName("customer_email")] public string CustomerEmail { get; init; }
    [JsonPropertyName("customer_name")]  public string CustomerName  { get; init; }
    [JsonPropertyName("tenant_id")]      public string TenantId      { get; init; }
    [JsonPropertyName("description")]    public string Description   { get; init; }
    [JsonPropertyName("priority")]       public string Priority      { get; init; }
    [JsonPropertyName("created_at")]     public string CreatedAt     { get; init; }
}
```

Wherever the event is built (submit handler or service layer), populate it like this:

```csharp
var evt = new TicketCreatedEvent
{
    TicketId      = ticket.Id.ToString(),
    CustomerEmail = ticket.CustomerEmail,
    CustomerName  = ticket.CustomerName,
    TenantId      = Environment.GetEnvironmentVariable("MASALA_TENANT_ID") ?? "desgoffe",
    Description   = ticket.Description,
    Priority      = MapPriority(ticket.PriorityScore),
    CreatedAt     = DateTime.UtcNow.ToString("o"),
};
```

Add this private mapper:

```csharp
private static string MapPriority(int score) => score switch
{
    >= 20 => "urgent",
    >= 15 => "high",
    >= 10 => "medium",
    >= 5  => "low",
    _     => "low",
};
```

Make sure the OutboxPublisher uses:

```csharp
Exchange:   "garamatic.events"
RoutingKey: "event.ticket.created"
```

Validate the output against the integration-contracts repo:

```bash
npm run validate-samples
```

---

## Fix 3 — `masala-web` · Charlotte · `tenants/desgoffe/config/rabbitmq.js` - Done!

Replace the file contents with:

```javascript
export const rabbitmqConfig = {
    tenant: 'desgoffe',
    api: {
        baseUrl:        window.__API_BASE__ || 'http://localhost:5000',
        submitEndpoint: '/api/portal/submit',
    },
    queues: {
        formSubmissions: 'desgoffe.form_submissions',
        notifications:   'desgoffe.notifications',
    },
    exchange:   'garamatic.events',
    routingKey: 'event.ticket.created',
};
```

---

## Step 1 — Install RabbitMQ on the Azure VM · Wito

SSH into the VM, then run:

```bash
sudo apt-get update
sudo apt-get install rabbitmq-server -y
sudo systemctl enable rabbitmq-server
sudo systemctl start rabbitmq-server
```

Verify it is running:

```bash
sudo systemctl status rabbitmq-server
```

You should see `Active: active (running)`.

---

## Step 2 — Create a RabbitMQ User · Wito

Do not use the default `guest` account in production:

```bash
sudo rabbitmqctl add_user masala YOUR_PASSWORD
sudo rabbitmqctl set_permissions -p / masala ".*" ".*" ".*"
sudo rabbitmqctl set_user_tags masala administrator
```

Confirm the user exists:

```bash
sudo rabbitmqctl list_users
```

---

## Step 3 — Open Port 5672 on the Azure Firewall · Wito

In the **Azure Portal**:

1. Go to your VM → **Networking**
2. Click **Add inbound port rule**
3. Set the following:

| Field | Value |
|---|---|
| Source | Any |
| Destination port | `5672` |
| Protocol | TCP |
| Action | Allow |
| Name | `Allow-RabbitMQ` |

4. Click **Save**

---

## Step 4 — Set Fly.io Secrets · Wito

Run these commands one by one. Replace placeholder values with the real ones.

```powershell
flyctl secrets set RabbitMQ__HostName="YOUR_AZURE_VM_IP" --app ticket-masala-api-desgoffe
flyctl secrets set RabbitMQ__Port="5672" --app ticket-masala-api-desgoffe
flyctl secrets set RabbitMQ__UserName="masala" --app ticket-masala-api-desgoffe
flyctl secrets set RabbitMQ__Password="YOUR_PASSWORD" --app ticket-masala-api-desgoffe
flyctl secrets set RabbitMQ__ExchangeName="garamatic.events" --app ticket-masala-api-desgoffe
```

Verify the secrets are set:

```powershell
flyctl secrets list --app ticket-masala-api-desgoffe
```

---

## Step 5 — Redeploy the API · Wito

From the root of the `ticket-masala` repository (after Maarten's Fix 2 is merged):

```powershell
flyctl deploy --config deploy/fly.desgoffe-api.toml --app ticket-masala-api-desgoffe
```

Wait for `v{N} deployed successfully`.

---

## Step 6 — Verify the Integration · Everyone

### Check API logs (Wito)

```powershell
flyctl logs --app ticket-masala-api-desgoffe
```

Look for RabbitMQ connected confirmation and no errors.

### Check RabbitMQ queues on the VM (Wito)

```bash
sudo rabbitmqctl list_queues name messages
```

After a test submission you should see `event.ticket.created` with messages.

### Validate message schema (Maarten)

```bash
# In the integration-contracts repo
npm run validate-samples
```

### Test the form end-to-end (Charlotte)

1. Open `tenants/desgoffe/client/index.html` in the browser
2. Fill in all required fields
3. Submit the form
4. Browser redirects to `success.html` with a ticket number
5. Wito confirms the queue received the message on the VM

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Could not connect to RabbitMQ` in logs | Check port 5672 is open in Azure firewall |
| `Authentication failed` in logs | Verify `RabbitMQ__UserName` and `RabbitMQ__Password` secrets |
| Form submits but no redirect to `success.html` | API not returning `{ "success": true }` — check Fly logs |
| Schema validation fails | Check `additionalProperties` — remove extra fields from event |
| Priority value rejected | Must be `"low"`, `"medium"`, `"high"`, or `"urgent"` — not a number |
| `flyctl: command not found` | Run `$env:PATH += ";C:\Users\charl\.fly\bin"` then retry |
| App not found on Fly.io | Run `flyctl auth whoami` to confirm correct account |

---

## Full Checklist

```
Charlotte (masala-web)
[ ] Fix 1 — Add priorityToString() to portal-form.js
[ ] Fix 3 — Update rabbitmq.js with correct exchange and routing key

Maarten (ticket-masala)
[ ] Fix 2 — Update TicketCreatedEvent.cs to snake_case contract fields
[ ] Fix 2 — Add MapPriority() int → string mapper
[ ] Fix 2 — Strip extra fields from published event
[ ] Fix 2 — Set exchange to "garamatic.events", routing key to "event.ticket.created"
[ ] Fix 2 — Run npm run validate-samples in integration-contracts repo

Wito (infra + Fly.io)
[ ] Step 1 — RabbitMQ installed and running on Azure VM
[ ] Step 2 — RabbitMQ user 'masala' created
[ ] Step 3 — Port 5672 open in Azure firewall
[ ] Step 4 — 5 Fly.io secrets set
[ ] Step 5 — flyctl deploy completed after Fix 2 is merged
[ ] Step 6 — Logs show RabbitMQ connected
[ ] Step 6 — Queue shows messages after test submission

Everyone
[ ] Form submits → redirects to success.html with ticket number
[ ] Schema validation passes in integration-contracts repo
```

---

*Generated for Garamatic Industries — Ticket Masala (Desgoffe tenant) — 2025*
