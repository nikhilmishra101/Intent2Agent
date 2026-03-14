import json

def handler(event, context):
    # If the React frontend sends data (e.g., via POST), it will be in event.get('body')
    # body = json.loads(event.get('body', '{}')) if event.get('body') else {}

    response_body = {
        "message": "Hello from Lambda backend! You successfully called this from React.",
        "status": "success"
    }

    return {
        'statusCode': 200,
        'headers': {
            # CORS headers are essential when calling from a browser-based frontend like React
            'Access-Control-Allow-Origin': '*', # In production, replace '*' with your React app's domain
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
            'Content-Type': 'application/json'
        },
        'body': json.dumps(response_body)
    }
