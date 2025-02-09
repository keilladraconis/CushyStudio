#!/bin/bash

# makes sure that the script exits if a command fails ----------------------------
set -e # Exit with nonzero exit code if anything fails
set -u # Treat unset variables as an error
# set -x # Print commands and their arguments as they are executed

# Detect the operating system (darwin for macOS, linux for Linux) ----------------
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
echo "Operating system: $OS"

# Detect the architecture --------------------------------------------------------
ARCH=$(uname -m)
echo "Architecture: $ARCH"

# Set the Node.js architecture name based on OS and CPU architecture -------------
case "$OS" in
    "darwin")
        case "$ARCH" in
            "arm64") NODE_ARCH="darwin-arm64" ;;
            "x86_64") NODE_ARCH="darwin-x64" ;;
            *) echo "Unsupported architecture: $ARCH for macOS"; exit 1 ;;
        esac
        ;;
    "linux")
        case "$ARCH" in
            "arm64") NODE_ARCH="linux-arm64" ;;
            "x86_64") NODE_ARCH="linux-x64" ;;
            "aarch64") NODE_ARCH="linux-arm64" ;; # aarch64 is another name for arm64 in Linux
            *) echo "Unsupported architecture: $ARCH for Linux"; exit 1 ;;
        esac
        ;;
    *)
        echo "Unsupported operating system: $OS"; exit 1 ;;
esac
echo "Node.js architecture: $NODE_ARCH"

NODE_VERSION="v18.19.0"
echo "Node.js version: $NODE_VERSION"

# Define the download URL ------------------------------------------------------------
# should be the same as the one used by Electron
# https://www.electronjs.org/docs/latest/tutorial/electron-timelines
# https://nodejs.org/dist/latest-v18.x/

URL="https://nodejs.org/dist/$NODE_VERSION/node-$NODE_VERSION-$NODE_ARCH.tar.gz"
echo "Download URL: $URL"

# Define the current working directory ------------------------------------------------
CWD=$(pwd)
echo "Current working directory: $CWD"

# Define the extraction directory -----------------------------------------------------
EXTRACT_DIR="$CWD/.cushy/node/$NODE_VERSION-$NODE_ARCH"
echo "Extraction directory: $EXTRACT_DIR"

# Create the directory if it doesn't exist --------------------------------------------
mkdir -p "$EXTRACT_DIR"


# Install Node.js if necessary installed ----------------------------------------------
if [ -f "$EXTRACT_DIR/bin/node" ]; then
    echo "Node.js $NODE_VERSION is already installed in $EXTRACT_DIR"
    # INSTALLED_VERSION=$("$EXTRACT_DIR/bin/node" -v)
    # if [ "$INSTALLED_VERSION" == "$NODE_VERSION" ]; then
    #     echo "Node.js $NODE_VERSION is already installed in $EXTRACT_DIR"
    #     exit 0
    # else
    #     echo "Different version of Node.js found in $EXTRACT_DIR. Proceeding with installation."
    # fi
else
    echo "No existing Node.js installation found in $EXTRACT_DIR. Proceeding with installation."

    # Function to install using curl
    install_node_with_curl() {
        echo "Installing npm with curl..."
        curl -fsSL "$URL" | tar -xz -C "$EXTRACT_DIR" --strip-components=1
    }

    # Function to install using wget
    install_node_with_wget() {
        echo "Installing npm with wget..."
        wget -qO- "$URL" | tar -xz -C "$EXTRACT_DIR" --strip-components=1
    }

    # Function to install node using curl or wget
    install_node() {
        # Check if curl is available
        if command -v curl > /dev/null 2>&1; then
            install_node_with_curl
        # Check if wget is available
        elif command -v wget > /dev/null 2>&1; then
            install_node_with_wget
        # If neither curl nor wget is available, exit with error
        else
            echo "Neither curl nor wget is available. Please install one of these packages and try again."
            exit 1
        fi
    }

    # Download and extract Node.js
    echo "Downloading Node.js $NODE_VERSION for $ARCH FROM $URL ..."
    install_node
    echo "Node.js has been installed in $EXTRACT_DIR"
fi


export PATH="$EXTRACT_DIR/bin:$PATH"

NPM_BIN_PATH="$EXTRACT_DIR/bin/npm"
echo "NPM binary path: $NPM_BIN_PATH"

NODE_BIN_PATH="$EXTRACT_DIR/bin/node"
echo "Node binary path: $NODE_BIN_PATH"

# Install dependencies with npm
echo "Installing dependencies..."
$NPM_BIN_PATH install --legacy-peer-deps=false

# ensuring binary dependencies are correctly linked across installed
./node_modules/.bin/electron-builder install-app-deps

# Define the path to tsconfig.custom.json
tsconfigPath="./tsconfig.custom.json"

# JSON content to write if the file does not exist
defaultTsconfigJSON='{ "include": ["src", "schema/global.d.ts"], "exclude": [] }'

# Check if the file exists
if [ ! -f "$tsconfigPath" ]; then
    # Write the JSON content to the file without formatting
    echo "$defaultTsconfigJSON" > "$tsconfigPath"
fi

# Build the release folder
./node_modules/.bin/electron -i src/shell/build.js js css

# Done
echo "🟢 cushy-install.sh completed successfully."