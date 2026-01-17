import requests

url = "https://Mitali06-pest-detection-space.hf.space/run/predict"

with open("test.jpg", "rb") as f:
    response = requests.post(
        url,
        files={"image": f},
        timeout=120
    )

print(response.status_code)
print(response.json())
