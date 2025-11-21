#!/bin/bash

# Rentacloud Database Backup Script
# Usage: bash scripts/backup-database.sh [backup-name]

set -e

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME=${1:-"rentacloud-backup-$TIMESTAMP"}
MONGO_URL=${MONGO_URL:-"mongodb://localhost:27017/rentacloudorg"}
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

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

# Check if mongodump is available
if ! command -v mongodump &> /dev/null; then
    print_error "mongodump not found! Please install MongoDB tools."
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

print_step "Creating database backup: $BACKUP_NAME"

# Create backup
if mongodump --uri="$MONGO_URL" --out="$BACKUP_DIR/$BACKUP_NAME" --quiet; then
    print_success "Database backup created successfully"
else
    print_error "Failed to create database backup"
fi

# Compress backup
print_step "Compressing backup..."
cd "$BACKUP_DIR"
if tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"; then
    rm -rf "$BACKUP_NAME"
    print_success "Backup compressed: ${BACKUP_NAME}.tar.gz"
else
    print_error "Failed to compress backup"
fi

# Get backup size
BACKUP_SIZE=$(du -h "${BACKUP_NAME}.tar.gz" | cut -f1)
print_success "Backup size: $BACKUP_SIZE"

# Clean old backups
print_step "Cleaning old backups (older than $RETENTION_DAYS days)..."
find . -name "rentacloud-backup-*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete
REMAINING_BACKUPS=$(find . -name "rentacloud-backup-*.tar.gz" -type f | wc -l)
print_success "Cleanup completed. $REMAINING_BACKUPS backups remaining"

echo ""
print_success "🎉 Backup process completed!"
echo ""
echo "📁 Backup location: $BACKUP_DIR/${BACKUP_NAME}.tar.gz"
echo "📊 Backup size: $BACKUP_SIZE"
echo ""
echo "🔧 To restore this backup:"
echo "   bash scripts/restore-database.sh $BACKUP_NAME"