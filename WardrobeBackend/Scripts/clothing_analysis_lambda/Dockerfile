FROM public.ecr.aws/lambda/python:3.12

ENV HF_HOME=/var/task/hf_cache

COPY requirements.txt ${LAMBDA_TASK_ROOT}/
RUN pip install --no-cache-dir -r requirements.txt

# Download the new clothing classifier into the image
RUN python -c "from transformers import AutoImageProcessor, AutoModelForImageClassification; n='dima806/clothes_image_detection'; AutoImageProcessor.from_pretrained(n); AutoModelForImageClassification.from_pretrained(n)"

COPY lambda_function.py clothing_analysis.py ${LAMBDA_TASK_ROOT}/

CMD ["lambda_function.lambda_handler"]