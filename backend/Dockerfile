# Container để deploy ứng dụng lên Google Cloud Run, sử dụng port 8080 (vì Google Cloud Run chỉ hỗ trợ port 8080)


FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8080

CMD ["sh", "-c", "gunicorn -w 2 -b 0.0.0.0:${PORT:-8080} --timeout 120 --access-logfile - run:app"]
