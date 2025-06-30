FROM python:3.12-slim

WORKDIR /app

# 1. Instala dependencias de SO para Chromium
RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libpangocairo-1.0-0 \
    libcups2 \
    libxkbcommon0 \
    libsecret-1-0 \
    libgtk-3-0 \
  && rm -rf /var/lib/apt/lists/*

# 2. Copia e instala tus dependencias Python (incluye scrapegraphai y playwright)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 3. Sólo instala el navegador Chromium para Playwright
RUN playwright install chromium
RUN playwright install-deps 

# 4. Copia el código y expone
COPY app ./app
EXPOSE 8000
CMD ["python3", "app/main.py"]
