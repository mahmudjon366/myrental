#!/bin/bash

# Rentacloud Database Restore Script
# Usage: bash scripts/restore-database.sh <backup-name>

set -e

# Configuration
BACKUP_DIR="./backups"
MONGO_URL=${MONGO_URL:-"mongodb://localhost:27017/rentacloudorg"}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() {
    echo -e "\n${BLUE}🔄 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Check parameters
if [ -z "$1" ]; then
    print_error "Usage: bash scripts/restore-database.sh <backup-name>"
fi

BACKUP_NAME="$1"
BACKUP_FILE="$BACKUP_DIR/${BACKUP_NAME}.tar.gz"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    print_error "Backup file not found: $BACKUP_FILE"
fi

# Check if mongorestore is available
if ! command -v mongorestore &> /dev/null; then
    print_error "mongorestore not found! Please install MongoDB tools."
fi

print_warning "⚠️  WARNING: This will REPLACE all data in the database!"
print_warning "Database: $MONGO_URL"
print_warning "Backup: $BACKUP_FILE"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Restore cancelled."
    exit 0
fi

print_step "Extracting backup: $BACKUP_NAME"
cd "$BACKUP_DIR"
if tar -xzf "${BACKUP_NAME}.tar.gz"; then
    print_success "Backup extracted successfully"
else
    print_error "Failed to extract backup"
fi

print_step "Restoring database..."
if mongorestore --uri="$MONGO_URL" --drop "$BACKUP_NAME" --quiet; then
    print_success "Database restored successfully"
else
    print_error "Failed to restore database"
fi

# Clean up extracted files
rm -rf "$BACKUP_NAME"
print_success "Cleanup completed"

echo ""
print_success "🎉 Database restore completed!"
echo ""
echo "📊 Database: $MONGO_URL"
echo "📁 Restored from: $BACKUP_FILE"