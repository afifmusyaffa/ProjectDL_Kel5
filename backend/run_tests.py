import requests
import os
import io
import time
from PIL import Image

BASE_URL = "http://127.0.0.1:8000"

def log_test(name, success, message=""):
    status = "🟢 PASSED" if success else "🔴 FAILED"
    print(f"{status} | {name} {f'({message})' if message else ''}")

def run_tests():
    print("=" * 60)
    print("STARTING API ENDPOINT TESTS")
    print("=" * 60)
    
    # Test 1: GET /health
    try:
        r = requests.get(f"{BASE_URL}/health")
        if r.status_code == 200:
            data = r.json()
            is_ok = data.get("status") == "ok" and data.get("model_loaded") is True
            log_test("GET /health", is_ok, f"model_loaded: {data.get('model_loaded')}")
        else:
            log_test("GET /health", False, f"Status code: {r.status_code}")
    except Exception as e:
        log_test("GET /health", False, str(e))

    # Test GET /traffic-signs/{id}
    try:
        r = requests.get(f"{BASE_URL}/traffic-signs/sign-0-larangan-berhenti")
        if r.status_code == 200:
            data = r.json()
            is_ok = data.get("name") == "Larangan Berhenti"
            log_test("GET /traffic-signs/sign-0-larangan-berhenti", is_ok, "Found 'Larangan Berhenti'")
        else:
            log_test("GET /traffic-signs/sign-0-larangan-berhenti", False, f"Status code: {r.status_code}")
    except Exception as e:
        log_test("GET /traffic-signs", False, str(e))

    # Test 3: GET /traffic-signs/{sign_id}
    try:
        sign_id = "rambu-larangan-masuk"
        r = requests.get(f"{BASE_URL}/traffic-signs/{sign_id}")
        if r.status_code == 200:
            data = r.json()
            is_ok = data.get("id") == sign_id and "name" in data
            log_test(f"GET /traffic-signs/{sign_id}", is_ok, f"Name: {data.get('name')}")
        else:
            log_test(f"GET /traffic-signs/{sign_id}", False, f"Status code: {r.status_code}")
    except Exception as e:
        log_test(f"GET /traffic-signs/{sign_id}", False, str(e))

    # Test 4: POST /predict/image (with dummy image)
    try:
        # Create a red square dummy image to upload
        img = Image.new("RGB", (300, 300), color="red")
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='JPEG')
        img_byte_arr.seek(0)
        
        files = {"file": ("test.jpg", img_byte_arr, "image/jpeg")}
        r = requests.post(f"{BASE_URL}/predict/image", files=files)
        
        if r.status_code == 200:
            data = r.json()
            is_ok = "detections" in data and "total_detections" in data
            log_test("POST /predict/image (Dummy Image)", is_ok, f"Detections: {data.get('total_detections')}, Time: {data.get('processing_time_ms')} ms")
        else:
            log_test("POST /predict/image (Dummy Image)", False, f"Status code: {r.status_code}, Detail: {r.text}")
    except Exception as e:
        log_test("POST /predict/image (Dummy Image)", False, str(e))

    # Test 5: POST /predict/image (with actual test_image.jpg if exists)
    test_image_path = "../test_image.jpg"
    if os.path.exists(test_image_path):
        try:
            with open(test_image_path, "rb") as f:
                files = {"file": ("test_image.jpg", f, "image/jpeg")}
                r = requests.post(f"{BASE_URL}/predict/image", files=files)
            if r.status_code == 200:
                data = r.json()
                is_ok = "detections" in data and "total_detections" in data
                log_test("POST /predict/image (test_image.jpg)", is_ok, f"Detections: {data.get('total_detections')}, Time: {data.get('processing_time_ms')} ms")
            else:
                log_test("POST /predict/image (test_image.jpg)", False, f"Status code: {r.status_code}")
        except Exception as e:
            log_test("POST /predict/image (test_image.jpg)", False, str(e))
    else:
        print(f"ℹ️ Skipping actual image test: {test_image_path} not found")

    # Test 6: GET /history
    try:
        r = requests.get(f"{BASE_URL}/history")
        if r.status_code == 200:
            data = r.json()
            is_ok = isinstance(data, list)
            log_test("GET /history", is_ok, f"History items count: {len(data)}")
        else:
            log_test("GET /history", False, f"Status code: {r.status_code}")
    except Exception as e:
        log_test("GET /history", False, str(e))

    print("=" * 60)
    print("API TESTING COMPLETED")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
