import sys
import os
import pytest
import json


from detect import predict_image


# 테스트에 사용될 이미지 데이터를 로드
def load_test_image():
    with open(
        "aitest.jpg", "rb"
    ) as f:  # 'path_to_your_test_image'를 실제 이미지 파일 경로로 변경해주세요.
        img_bytes = f.read()
    return img_bytes


# 예측 결과가 기대하는 형태인지 확인
def test_predict_image():
    img_bytes = load_test_image()
    result = predict_image(img_bytes)

    # 여기에서는 결과가 올바른 JSON 형식인지만 확인합니다.
    # 모델의 성능을 테스트하기 위해서는 예측 결과를 더 세밀하게 검사할 필요가 있습니다.
    try:
        result_dict = json.loads(result)
        assert isinstance(result_dict, dict)
    except json.JSONDecodeError:
        pytest.fail("Predict function did not return valid JSON")
