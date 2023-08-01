import os.path
import torch
import json
import pandas as pd
from PIL import Image
from io import BytesIO
from collections import Counter


model = torch.hub.load("ultralytics/yolov5", "custom", path="my_model.pt")


def predict_image(img_bytes):
    img = Image.open(BytesIO(img_bytes)).convert("RGB")
    results = model(img)
    prediction = results.pandas().xyxy[0]

    # 감지된 물체의 이름과 수량을 json 형태의 문자열로 저장
    counts = Counter(prediction["class"])
    result = json.dumps(counts)
    print(result)

    return result
