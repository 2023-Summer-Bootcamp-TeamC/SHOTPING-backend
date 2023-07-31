from flask import Flask, jsonify, request
from tasks import prediction, app as celery_app
from io import BytesIO
from PIL import Image

app = Flask(__name__)


@app.route("/")
def hello_world():
    return "Hello, World!"


@app.route("/predict", methods=["GET", "POST"])
def test_predict_route():
    if request.method == "POST":
        if "image" not in request.files:
            return jsonify({"error": "No file part"})

        # id = request.form.get("id")  # key : id
        image = request.files["image"]  # key : image

        img_name = BytesIO(image.read()).getvalue()  # Bytes로 변환

        # celery worker
        task = prediction.delay(img_name)

        return {"task_id": task.id}, 202


@app.route("/result/<task_id>", methods=["GET"])
def get_task_result(task_id):
    task_result = celery_app.AsyncResult(task_id)
    return jsonify(
        {
            "status": task_result.status,
            "result": task_result.result,  # This is None if the task hasn't finished yet
        }
    )
