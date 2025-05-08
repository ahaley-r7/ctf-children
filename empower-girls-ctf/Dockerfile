# Use an official lightweight Python image
FROM python:3.11-slim-bullseye

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt && pip install watchdog

# Copy project files
COPY . .

# Expose the port Flask runs on
EXPOSE 5000

# Run the Flask app
ENV FLASK_APP=app.py
ENV FLASK_ENV=development
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000", "--reload", "--debug"]


