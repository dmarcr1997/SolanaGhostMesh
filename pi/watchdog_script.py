import os
import time
from ultralytics import YOLO
from watchdog.observers.polling import PollingObserver as Observer
from watchdog.events import FileSystemEventHandler


input_dir = os.getenv("YOLO_INPUT_DIR", "/yolo_input")
output_dir = os.getenv("YOLO_OUTPUT_DIR", "/yolo_output")

print("Loading YOLOv10n model...")
try:
    model = YOLO("yolov10n.pt")
    print("YOLOv10n model loaded.")
except Exception as e:
    print(f"Error loading YOLOv10n model: {e}")
    exit(1)

class MyHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory:
            file_path = event.src_path
            file_name = os.path.basename(file_path)
            
            if file_name.lower().endswith(('.png', '.jpg', '.jpeg')):
                print(f"Detected new image: {file_name}")
                try:
                    os.makedirs(output_dir, exist_ok=True)
                    model.predict(
                        source=file_path, 
                        device='cpu',
                        project=output_dir, 
                        name='output_imgs', 
			save=True,
                        imgsz=320,
                        exist_ok=True
                    )
                    print(f"Successfully processed {file_name}. Results saved to {output_dir}")
                except Exception as e:
                    print(f"Error processing {file_name}: {e}")

if __name__ == "__main__":
    os.makedirs(output_dir, exist_ok=True)
    
    event_handler = MyHandler()
    observer = Observer()
    observer.schedule(event_handler, input_dir, recursive=False)
    observer.start()

    print(f"Watching for new images in {input_dir} (using polling)")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
