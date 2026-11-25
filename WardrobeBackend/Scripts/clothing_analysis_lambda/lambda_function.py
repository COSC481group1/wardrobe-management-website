import os
import time
import boto3
from botocore.exceptions import ClientError

from clothing_analysis import analyze_image

s3 = boto3.client("s3")

ORIGINAL_BUCKET = os.environ["ORIGINAL_BUCKET"]
PROCESSED_BUCKET = os.environ["PROCESSED_BUCKET"]
ORIGINAL_PREFIX = os.environ["ORIGINAL_PREFIX"]
PROCESSED_PREFIX = os.environ["PROCESSED_PREFIX"]

def processed_key(original_key):
    return PROCESSED_PREFIX + original_key.removeprefix(ORIGINAL_PREFIX)

def wait_for_processed(key, attempts=20, delay=1):
    for _ in range(attempts):
        try:
            s3.head_object(Bucket=PROCESSED_BUCKET, Key=key)
            return True
        except ClientError:
            time.sleep(delay)
    return False

def lambda_handler(event, context):
    original_key = event["s3Key"]
    p_key = processed_key(original_key)

    if wait_for_processed(p_key):
        bucket, key = PROCESSED_BUCKET, p_key
    else:
        bucket, key = ORIGINAL_BUCKET, original_key  # fallback

    image_bytes = s3.get_object(Bucket=bucket, Key=key)["Body"].read()

    result = analyze_image(image_bytes)

    return {
        "category": result["category"],
        "description": result["description"],
        "palette": result["palette"],
        "tags": result["tags"],
        "name": result["name"]
    }