#!/usr/bin/env fish
# Ticket Masala Ecosystem - Deploy All Script
# Run from: masala-web/deploy directory

set -l SCRIPT_DIR (dirname (status --current-filename))
cd $SCRIPT_DIR/.. # Go to masala-web root

echo "🚀 Deploying Ticket Masala Ecosystem..."
echo ""

# Deploy Marketing Sites
echo "📦 Deploying Marketing Sites..."
fly deploy -c deploy/fly.toml  # masala-web (main marketing)
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
    
    # Deploy API with Staged Theme Injection
    echo "  → API (Preparing build context)..."
    
    # Create temp staging area
    set -l STAGING_DIR "/tmp/masala-build-$tenant"
    rm -rf $STAGING_DIR
    mkdir -p $STAGING_DIR
    
    # 1. Copy Backend Code (Excluding heavy folders)
    # 1. Copy Backend Code (Excluding heavy folders)
    # Using tar to exclude heavy folders (more portable than rsync sometimes)
    tar -C ../ticket-masala -cf - --exclude node_modules --exclude bin --exclude obj --exclude .git --exclude .vs . | tar -C $STAGING_DIR -xf -
    
    # 2. Inject Tenant Theme (if exists in masala-web)
    set -l THEME_SRC "tenants/$tenant/theme"
    set -l LOGO_SRC "tenants/$tenant/$tenant.png"
    
    if test -d $THEME_SRC
        echo "    Injecting theme for $tenant..."
        mkdir -p "$STAGING_DIR/tenants/$tenant/theme"
        cp -R $THEME_SRC/* "$STAGING_DIR/tenants/$tenant/theme/"
        
        # Inject Logo if exists
        if test -f $LOGO_SRC
            cp $LOGO_SRC "$STAGING_DIR/tenants/$tenant/theme/logo.png"
        end
        
        # We need to tell the backend Dockerfile to COPY this specific tenant folder
        # BUT since the standard Dockerfile just does COPY . . and then processes templates...
        # We actually need to make sure the build knows where to put it.
        # The standard Dockerfile has: COPY --chown=masala:masala tenants/_template/ /app/tenants/_template/
        # It DOES NOT copy all tenants. We need to append a copy instruction or modify the Dockerfile in staging.
        
        echo "    Patching Dockerfile for $tenant..."
        echo "" >> "$STAGING_DIR/Dockerfile"
        echo "# INJECTED TENANT THEME" >> "$STAGING_DIR/Dockerfile"
        echo "COPY --chown=masala:masala tenants/$tenant/ /app/tenants/_template/" >> "$STAGING_DIR/Dockerfile"
        # Note: We overwrite _template in the image with this tenant's distinct theme so it gets picked up as default
    end
    
    # 3. Deploy from Staging
    # We need to copy the fly.toml to staging so it can find the Dockerfile
    # Config is now in deploy/ dir
    cp "deploy/fly.$tenant-api.toml" "$STAGING_DIR/fly.toml"
    
    # We must remove the 'context' line from fly.toml because we are correctly inside the context now
    # Using sed to comment it out
    # Note: If context was ../ticket-masala, now it's staging dir root
    sed -i.bak 's/context = "\.\.\/ticket-masala"/# context explicitly removed for staging/g' "$STAGING_DIR/fly.toml"
    # Also handle the new path "../../ticket-masala" if we updated it
    sed -i.bak 's/context = "\.\.\/\.\.\/ticket-masala"/# context explicitly removed for staging/g' "$STAGING_DIR/fly.toml"
    
    pushd $STAGING_DIR
    fly deploy --config fly.toml
    popd
    
    # Deploy Portal
    echo "  → Portal..."
    # Config in deploy/ dir, build context is root (via config patch or flag?)
    # We'll use the flag hack or update the configured context
    # Running from ROOT (masala-web), pointing to config
    fly deploy -c "deploy/fly.$tenant-portal.toml"
    
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
