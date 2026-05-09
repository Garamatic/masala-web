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
```

The frontend and backend code are ready. What remains is:
1. RabbitMQ running on the Azure VM
2. Firewall open on port 5672
3. Fly.io secrets set
4. Redeploy the API

---

## Prerequisites

Before running any commands, confirm you have the following:

| Item | Value |
|---|---|
| Azure VM public IP | `???` |
| RabbitMQ username | `masala` (to be created) |
| RabbitMQ password | `???` (choose one) |
| Fly.io app name | `ticket-masala-api-desgoffe` |

---

## Step 1 — Install RabbitMQ on the Azure VM

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

## Step 2 — Create a RabbitMQ User

Do not use the default `guest` account in production. Create a dedicated user:

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

## Step 3 — Open Port 5672 on the Azure Firewall

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

## Step 4 — Set Fly.io Secrets

On your machine (with Fly CLI installed and logged in), run these commands one by one.  
Replace the placeholder values with the real ones.

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

## Step 5 — Redeploy the API

From the root of the `masala-web` repository:

```powershell
flyctl deploy --config deploy/fly.desgoffe-api.toml --app ticket-masala-api-desgoffe
```

Wait for the deploy to complete. You should see `v{N} deployed successfully`.

---

## Step 6 — Verify the Integration

### Check API logs

```powershell
flyctl logs --app ticket-masala-api-desgoffe
```

Look for a line confirming RabbitMQ connected, e.g.:
```
[OutboxPublisher] Connected to RabbitMQ at YOUR_AZURE_VM_IP:5672
```

### Check RabbitMQ queues on the VM

```bash
sudo rabbitmqctl list_queues name messages
```

After submitting a test form, you should see `event.ticket.created` with messages.

### Test the form end-to-end

1. Open `tenants/desgoffe/client/index.html` in the browser
2. Fill in all required fields
3. Submit the form
4. Browser should redirect to `success.html` with a ticket number
5. Check the VM — the queue should have received a message

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Could not connect to RabbitMQ` in logs | Check port 5672 is open in Azure firewall |
| `Authentication failed` in logs | Verify `RabbitMQ__UserName` and `RabbitMQ__Password` secrets |
| Form submits but no redirect to `success.html` | API is not returning `{ "success": true }` — check logs |
| `flyctl: command not found` | Run `$env:PATH += ";C:\Users\charl\.fly\bin"` then retry |
| App not found on Fly.io | Run `flyctl auth whoami` to confirm you are on the right account |

---

## Frontend Status (no action needed)

These files are already complete in `masala-web`:

| File | Status |
|---|---|
| `tenants/desgoffe/client/index.html` | ✅ Done |
| `tenants/desgoffe/client/script.js` | ✅ Done |
| `tenants/desgoffe/client/success.html` | ✅ Done |
| `src/shared/portal-form.js` | ✅ Done |
| `tenants/desgoffe/config/rabbitmq.js` | ✅ Done |

---

## Full Checklist

```
[ ] Step 1 — RabbitMQ installed and running on Azure VM
[ ] Step 2 — RabbitMQ user 'masala' created
[ ] Step 3 — Port 5672 open in Azure firewall
[ ] Step 4 — 5 Fly.io secrets set
[ ] Step 5 — flyctl deploy completed successfully
[ ] Step 6 — Logs show RabbitMQ connected
[ ] Step 6 — Form submits and redirects to success.html
[ ] Step 6 — Queue shows messages on the VM
```

---

*Generated for Garamatic Industries — Ticket Masala (Desgoffe tenant) — 2025*
