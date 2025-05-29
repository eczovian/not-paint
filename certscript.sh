#!/bin/sh
CERT_DIR="./certs"
KEY_FILE="localhost-key.pem"
CERT_FILE="localhost.pem"

mkdir -p $CERT_DIR

# Generate private key
openssl genrsa -out $CERT_DIR/$KEY_FILE 2048

# Create a certificate signing request (CSR)
openssl req -new -key $CERT_DIR/$KEY_FILE -out $CERT_DIR/localhost.csr -subj "/C=US/ST=California/L=Localhost/O=Dev/OU=Local/CN=localhost"

# Create self-signed certificate
openssl x509 -req -days 365 -in $CERT_DIR/localhost.csr -signkey $CERT_DIR/$KEY_FILE -out $CERT_DIR/$CERT_FILE

rm $CERT_DIR/localhost.csr

echo "Certificates generated at $CERT_DIR"
