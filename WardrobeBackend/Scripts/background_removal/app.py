import json
import os
import urllib.parse
from io import BytesIO

import boto3
from PIL import Image
from rembg import remove, new_session

print("Loading function")

s3 = boto3.client("s3")

OUTPUT_BUCKET = os.environ["OUTPUT_BUCKET"]
OUTPUT_PREFIX = os.environ.get("OUTPUT_PREFIX", "processed/")
OUTPUT_FORMAT = os.environ.get("OUTPUT_FORMAT", "png").lower()
MAX_SIZE = int(os.environ.get("MAX_SIZE", "1024"))

session = new_session("u2net")

def cut_out(img):
    img = img.copy()
    img.thumbnail((MAX_SIZE, MAX_SIZE))
    return remove(img, session=session)

def flatten(cutout):
    white = Image.new("RGBA", cutout.size, (255, 255, 255, 255))
    return Image.alpha_composite(white, cutout.convert("RGBA")).convert("RGB")

def process(img):
    cutout = cut_out(img)
    return cutout if OUTPUT_FORMAT == "png" else flatten(cutout)

def lambda_handler(event, context):
    outputs = []

    for record in event["Records"]:
        bucket = record["s3"]["bucket"]["name"]
        key = urllib.parse.unquote_plus(record["s3"]["object"]["key"], encoding="utf-8")

        if bucket == OUTPUT_BUCKET and key.startswith(OUTPUT_PREFIX):
            print(f"Skipping already-processed object {key}")
            continue

        try:
            body = s3.get_object(Bucket=bucket, Key=key)["Body"].read()
            img = Image.open(BytesIO(body)).convert("RGBA")

            result = process(img)

            out = BytesIO()
            if OUTPUT_FORMAT == "png":
                result.save(out, format="PNG")
                ext, content_type = ".png", "image/png"
            else:
                result.save(out, format="JPEG", quality=92)
                ext, content_type = ".jpg", "image/jpeg"
            out.seek(0)

            out_key = OUTPUT_PREFIX + os.path.splitext(os.path.basename(key))[0] + ext
            s3.put_object(Bucket=OUTPUT_BUCKET, Key=out_key, Body=out, ContentType=content_type)

            print(f"Saved s3://{OUTPUT_BUCKET}/{out_key}")
            outputs.append(out_key)

        except Exception as e:
            print(e)
            print(f"Error processing object {key} from bucket {bucket}.")
            raise

    return {"statusCode": 200, "body": json.dumps({"outputs": outputs})}