FROM ultralytics/ultralytics:latest-arm64

# Install the watchdog package
RUN pip install watchdog

# Set the working directory
WORKDIR /app

# Copy the application files
COPY watchdog_script.py .

# Define the command to run the script
CMD ["python", "watchdog_script.py"]

