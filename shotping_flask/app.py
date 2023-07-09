from flask import Flask
from tasks import prediction

app = Flask(__name__)


@app.route("/")
def hello_world():
    return "Hello, World!"


@app.route("/test_predict", methods=["GET"])
def test_predict_route():
    # 이미지 파일의 이름을 직접 입력합니다. 여기에 있는 'test.jpg'를 실제 이미지 파일의 이름으로 변경해주세요.
    img_name = "image_0.jpg"
    task = prediction.delay(img_name)
    return {"task_id": task.id}, 202


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
