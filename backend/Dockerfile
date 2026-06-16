FROM python:3.10-slim

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install PyTorch CPU first to save ~2GB of space and prevent OOM
RUN pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Install remaining requirements
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and models
COPY . .

# Create results dir for temporary video uploads
RUN mkdir -p results

# Expose port (Render sets PORT env variable)
EXPOSE 8000

# Start FastAPI server
# Using 1 worker is CRITICAL for Free Tier (512MB RAM) to prevent Out of Memory errors.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
