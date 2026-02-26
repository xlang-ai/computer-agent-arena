#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
FRONTEND_DIR="../frontend"
REMOTE_USER="ubuntu"
REMOTE_HOST="50.18.195.157"
REMOTE_PATH="/var/www/html"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/tmp/frontend_backup_${TIMESTAMP}"
ZIP_FILE="/tmp/frontend_build_${TIMESTAMP}.zip"

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Error handling
set -e
trap 'log_error "Script failed at line $LINENO with exit code $?"' ERR

main() {
    log_info "Starting deployment process..."

    # Check if frontend directory exists
    if [ ! -d "$FRONTEND_DIR" ]; then
        log_error "Frontend directory not found: $FRONTEND_DIR"
        exit 1
    fi

    # Build locally
    cd "$FRONTEND_DIR"
    log_info "Installing dependencies..."
    npm install

    log_info "Building application..."
    npm run build

    # Compress build directory into zip
    log_info "Compressing build directory into zip file..."
    cd build
    zip -r "${ZIP_FILE}" ./*
    cd ..

    # Create temp directory for backup
    log_info "Creating backup directory on remote server..."
    ssh ${REMOTE_USER}@${REMOTE_HOST} "sudo mkdir -p ${BACKUP_DIR}"

    # Backup existing files
    log_info "Backing up existing files..."
    ssh ${REMOTE_USER}@${REMOTE_HOST} "if [ -d ${REMOTE_PATH} ]; then sudo cp -r ${REMOTE_PATH}/* ${BACKUP_DIR}/ 2>/dev/null || true; fi"

    # Clear deployment directory
    log_info "Clearing deployment directory..."
    ssh ${REMOTE_USER}@${REMOTE_HOST} "sudo rm -rf ${REMOTE_PATH}/*"

    # Upload zip file
    log_info "Uploading zip file..."
    scp "${ZIP_FILE}" ${REMOTE_USER}@${REMOTE_HOST}:/tmp/

    # Unzip file on the remote server
    log_info "Unzipping the file on the remote server..."
    ssh ${REMOTE_USER}@${REMOTE_HOST} "sudo unzip /tmp/$(basename ${ZIP_FILE}) -d ${REMOTE_PATH} && \
                                      sudo chown -R www-data:www-data ${REMOTE_PATH} && \
                                      sudo chmod -R 755 ${REMOTE_PATH}"

    # Verify deployment
    if ssh ${REMOTE_USER}@${REMOTE_HOST} "test -f ${REMOTE_PATH}/index.html"; then
        log_info "Deployment successful!"
    else
        log_error "Deployment verification failed"
        log_info "Rolling back to previous version..."
        ssh ${REMOTE_USER}@${REMOTE_HOST} "sudo cp -r ${BACKUP_DIR}/* ${REMOTE_PATH}/"
        exit 1
    fi

    # Clean up the zip file
    log_info "Cleaning up local and remote zip files..."
    rm "${ZIP_FILE}"
    ssh ${REMOTE_USER}@${REMOTE_HOST} "sudo rm /tmp/$(basename ${ZIP_FILE})"
}

main

log_info "Deployment completed"
