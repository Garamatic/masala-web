#!/usr/bin/env fish
# Ticket Masala Ecosystem - Deploy All Script
# Run from: masala-web directory

set -l SCRIPT_DIR (dirname (status --current-filename))
cd $SCRIPT_DIR

echo "🚀 Deploying Ticket Masala Ecosystem..."
echo ""

# Deploy Marketing Sites
echo "📦 Deploying Marketing Sites..."
fly deploy  # masala-web (main marketing)
echo "✓ Marketing site deployed"

# Deploy Documentation
echo "📚 Deploying Documentation..."
cd ../ticket-masala/docs
fly deploy
cd ../../masala-web
echo "✓ Documentation deployed"

# Deploy Garamatic Web
echo "🔧 Deploying Garamatic Web..."
cd ../garamatic-web
fly deploy
cd ../masala-web
echo "✓ Garamatic Web deployed"

# Deploy Demo Ecosystems
set -l tenants desgoffe whitman liberty hennessey

for tenant in $tenants
    echo ""
    echo "🏢 Deploying $tenant ecosystem..."
    
    # Deploy API
    echo "  → API..."
    fly deploy -c fly.$tenant-api.toml
    
    # Deploy Portal
    echo "  → Portal..."
    fly deploy -c fly.$tenant-portal.toml
    
    echo "  ✓ $tenant deployed"
end

echo ""
echo "✅ All deployments complete!"
echo ""
echo "URLs:"
echo "  Marketing: https://ticket-masala.fly.dev"
echo "  Docs:      https://masala-doc.fly.dev"
echo "  Garamatic: https://garamatic-web.fly.dev"
echo ""
echo "Demo Portals:"
for tenant in $tenants
    echo "  $tenant: https://ticket-masala-portal-$tenant.fly.dev"
end
