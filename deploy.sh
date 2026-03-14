#!/bin/bash

# Configuration variables - change these!
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="YOUR_ACCOUNT_ID"
ECR_REPO_NAME="my-lambda-repo"
IMAGE_TAG="latest"
LAMBDA_FUNCTION_NAME="my-docker-lambda"

# 1. Authenticate Docker to Amazon ECR
echo "Authenticating to ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# 2. Build the Docker image
echo "Building Docker image..."
docker build -t $ECR_REPO_NAME .

# 3. Tag the image
echo "Tagging Docker image..."
docker tag $ECR_REPO_NAME:$IMAGE_TAG $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:$IMAGE_TAG

# 4. Push the image to Amazon ECR
echo "Pushing Docker image to ECR..."
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:$IMAGE_TAG

# 5. Create or Update Lambda function
echo "Updating Lambda function..."
# If the function does not exist, use create-function. Ensure you have the execution role ARN.
# aws lambda create-function \
#   --function-name $LAMBDA_FUNCTION_NAME \
#   --package-type Image \
#   --code ImageUri=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:$IMAGE_TAG \
#   --role arn:aws:iam::$AWS_ACCOUNT_ID:role/YourLambdaExecutionRole \
#   --region $AWS_REGION

# If the function already exists, use update-function-code.
aws lambda update-function-code \
    --function-name $LAMBDA_FUNCTION_NAME \
    --image-uri $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:$IMAGE_TAG \
    --region $AWS_REGION

echo "Deployment complete!"
