FROM python:3.9-slim

# Install watchdog package
RUN pip install watchdog

# Set working directory
WORKDIR /app

# Copy application files
COPY watchdog_script.py .

# Define command to run script
CMD ["python", "watchdog_script.py"]
