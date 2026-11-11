FROM python:3.12-slim

WORKDIR /app
COPY server.py /app/
COPY static /app/static

RUN mkdir -p /data
ENV PORT=8000 \
    DB_PATH=/data/medtekser.db \
    PYTHONUNBUFFERED=1

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s CMD python3 -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health')"

CMD ["python3", "server.py"]
