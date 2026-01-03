import cv2
import requests
import time

API_URL = "http://localhost:8000/api/predict"
TOKEN = "YOUR_JWT_TOKEN"

CAPTURE_INTERVAL = 5   # seconds
last_capture_time = 0

cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    cv2.imshow("Live Monitoring (CV2)", frame)

    current_time = time.time()

    # 🔁 Auto capture every N seconds
    if current_time - last_capture_time >= CAPTURE_INTERVAL:
        last_capture_time = current_time

        cv2.imwrite("capture.jpg", frame)

        with open("capture.jpg", "rb") as img:
            response = requests.post(
                API_URL,
                files={"file": img},
                headers={"Authorization": f"Bearer {TOKEN}"}
            )

        if response.status_code == 200:
            result = response.json()
            print("Prediction:", result)

            # 🔴 STOP if High Risk
            if result["risk"] == "high":
                print("🚨 HIGH RISK DETECTED — STOPPING MONITORING")
                break

    # Quit manually
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
