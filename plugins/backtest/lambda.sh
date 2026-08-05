#!/usr/bin/env bash
set -euo pipefail

FUNCTION_NAME="bestTicker"
REGION="eu-west-1"
ZIP_FILE="/tmp/bestTicker-deploy.zip"

echo "==> Installing production dependencies..."
npm ci --omit=dev

echo "==> Creating deployment package..."
rm -f "$ZIP_FILE"
zip -qr "$ZIP_FILE" index.mjs node_modules/

echo "==> Deploying to Lambda: $FUNCTION_NAME ($REGION)..."
aws lambda update-function-code \
  --function-name "$FUNCTION_NAME" \
  --zip-file "fileb://$ZIP_FILE" \
  --region "$REGION" \
  --output json | jq '{FunctionName, Runtime, CodeSize, LastModified, State: .State}'

echo "==> Waiting for update to complete..."
aws lambda wait function-updated \
  --function-name "$FUNCTION_NAME" \
  --region "$REGION"

echo "==> Done."
