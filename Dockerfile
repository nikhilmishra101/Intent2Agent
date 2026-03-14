# Use the official AWS Lambda Python base image
FROM public.ecr.aws/lambda/python:3.11

# Copy requirements.txt
COPY backend/requirements.txt ${LAMBDA_TASK_ROOT}

# Install dependencies
RUN pip install -r requirements.txt

# Copy the entire backend module
COPY backend/ ${LAMBDA_TASK_ROOT}

# Set the CMD to your Mangum handler (wrapped FastAPI)
CMD [ "main.handler" ]
