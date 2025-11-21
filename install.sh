#!/usr/bin/env bash
set -e

check_user_is_root() {
  if [ "$(id -u)" -ne 0 ]; then
    echo "This script must be run as root. Please run with sudo or as root user."
    exit 1
  fi
}

do_install() {
  check_user_is_root

  TMP_DOWNLOAD_DIR=$(mktemp -d)
  trap 'rm -rf $TMP_DOWNLOAD_DIR' EXIT

  curl -L -s -o "$TMP_DOWNLOAD_DIR/transai-connector-orchestrator.deb" "https://raw.githubusercontent.com/xip-online-applications/connector-releases/master/dist/transai-connector-orchestrator-$(dpkg --print-architecture).deb"
  chmod +r "$TMP_DOWNLOAD_DIR/transai-connector-orchestrator.deb"
  apt install -y "$TMP_DOWNLOAD_DIR/transai-connector-orchestrator.deb"
}

do_install
