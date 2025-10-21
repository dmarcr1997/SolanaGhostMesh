FROM python:3.11-slim

RUN pip install watchdog requests

# Set the working directory
WORKDIR /app

# Copy the application files
COPY send_contract_update.py .

# Define the command to run the script
CMD ["python", "send_contract_update.py"]
