#!/bin/bash
set -e

# Usage: ./deploy_image.sh <AWS_REGION> <ECR_REPOSITORY_URL>

REGION=$1
REPO_URL=$2

if [ -z "$REGION" ] || [ -z "$REPO_URL" ]; then
  echo "Usage: $0 <AWS_REGION> <ECR_REPOSITORY_URL>"
  exit 1
fi

echo "Building Docker image..."
docker build -t cosmos-multisig-app .

echo "Logging in to ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $REPO_URL

echo "Tagging image..."
docker tag cosmos-multisig-app:latest $REPO_URL:latest

echo "Pushing image..."
docker push $REPO_URL:latest

echo "Done! Image pushed to $REPO_URL:latest"
