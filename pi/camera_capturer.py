import cv2
import time
import os
from datetime import datetime
from picamera2 import Picamera2

camera_device_id = 0
interval_minutes=1
output_dir = "/home/mossy/SolanaGhostMesh/pi/yolo_input" 

try:
    picam2 = Picamera2()
    config = picam2.create_still_configuration(main={"size": (640, 480)})
    picam2.configure(config)
    picam2.start()
    time.sleep(2)
    print("Camera initialized and configured.")
except Exception as e:
    print(f"Error: Could not initialize picamera2: {e}")
    exit()

print(f"Capturing image every {interval_minutes} minutes...")

while True:
    try:
        frame = picam2.capture_array()
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"capture_{timestamp}.jpg"
        filepath = os.path.join(output_dir, filename)
        cv2.imwrite(filepath, frame)
        print(f"Image captured and saved to {filepath}")
    except Exception as e:
        print(f"An error occurred: {e}")
    time.sleep(interval_minutes * 60)

picam2.stop()

