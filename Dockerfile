# Use the official AWS Lambda Python base image
FROM public.ecr.aws/lambda/python:3.11

# Copy requirements.txt
COPY app/requirements.txt ${LAMBDA_TASK_ROOT}

# Install dependencies
RUN pip install -r requirements.txt

# Copy the function code
COPY app/app.py ${LAMBDA_TASK_ROOT}

# Set the CMD to your handler
CMD [ "app.handler" ]
