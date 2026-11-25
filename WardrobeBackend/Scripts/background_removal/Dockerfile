FROM public.ecr.aws/lambda/python:3.12

COPY requirements.txt ${LAMBDA_TASK_ROOT}/
RUN pip install --no-cache-dir -r ${LAMBDA_TASK_ROOT}/requirements.txt

ENV U2NET_HOME=/opt/u2net
RUN python -c "from rembg import new_session; new_session('u2net')"
RUN chmod -R a+rX /opt/u2net

ENV NUMBA_CACHE_DIR=/tmp

COPY app.py ${LAMBDA_TASK_ROOT}/

CMD ["app.lambda_handler"]