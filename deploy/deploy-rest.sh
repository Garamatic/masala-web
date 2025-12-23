#!/bin/bash
set -e

# Define tenants
TENANTS=("whitman" "liberty" "hennessey")

echo "🚀 Deploying Remaining Tenants..."

for tenant in "${TENANTS[@]}"; do
    echo "--------------------------------------------------"
    echo "🏢 Deploying $tenant ecosystem..."
    echo "--------------------------------------------------"

    # API Deployment
    STAGING_DIR="/tmp/masala-build-$tenant"
    echo "  → API (Preparing build context in $STAGING_DIR)..."
    rm -rf "$STAGING_DIR"
    mkdir -p "$STAGING_DIR"

    # Tar copy with exclusions (Assumes we are in masala-web/deploy, so ../ticket-masala is valid relative to parent? No.)
    # I will run this from masala-web root to be safe and specific.
    # So ../ticket-masala implies ../ticket-masala from masala-web.
    
    # We will run this script from masala-web/deploy, so we need to handle paths.
    # Let's assume run from masala-web/deploy.
    # Source: ../../ticket-masala (sibling of masala-web)
    # Target: $STAGING_DIR

    # Wait, earlier manual command worked with ../ticket-masala from deploy dir?
    # I will try ../ticket-masala first. If it fails, I'll error.
    
    # Actually, I'll CD to project root first to normalize.
    cd "$(dirname "$0")/.."
    echo "  (Working dir: $(pwd))"

    # Now we are in masala-web. 
    # Source is ../ticket-masala (sibling)
    SOURCE_DIR="../ticket-masala"

    if [ ! -d "$SOURCE_DIR" ]; then
        echo "❌ Error: Source directory $SOURCE_DIR not found!"
        exit 1
    fi

    echo "  → Copying source..."
    tar -C "$SOURCE_DIR" -cf - --exclude node_modules --exclude bin --exclude obj --exclude .git --exclude .vs . | tar -C "$STAGING_DIR" -xf -
    
    # Config
    echo "  → Configuring fly.toml..."
    cp "deploy/fly.$tenant-api.toml" "$STAGING_DIR/fly.toml"
    
    # Patch Config context
    sed -i.bak 's/context = "\.\.\/ticket-masala"/# context explicitly removed/g' "$STAGING_DIR/fly.toml"
    sed -i.bak 's/context = "\.\.\/\.\.\/ticket-masala"/# context explicitly removed/g' "$STAGING_DIR/fly.toml"

    # Theme Injection (Simplified)
    THEME_SRC="tenants/$tenant/theme"
    if [ -d "$THEME_SRC" ]; then
        echo "  → Injecting theme..."
        mkdir -p "$STAGING_DIR/tenants/$tenant/theme"
        cp -R "$THEME_SRC/"* "$STAGING_DIR/tenants/$tenant/theme/"
        
        # Patch Dockerfile
        echo "" >> "$STAGING_DIR/Dockerfile"
        echo "# INJECTED TENANT THEME" >> "$STAGING_DIR/Dockerfile"
        echo "COPY --chown=masala:masala tenants/$tenant/ /app/tenants/_template/" >> "$STAGING_DIR/Dockerfile"
    fi

    # API Deploy
    echo "  → Deploying API..."
    (cd "$STAGING_DIR" && fly deploy --config fly.toml)

    # Portal Deploy
    echo "  → Deploying Portal..."
    fly deploy -c "deploy/fly.$tenant-portal.toml"

    echo "✅ $tenant deployed!"
done

echo ""
echo "🎉 Scripts finished!"
