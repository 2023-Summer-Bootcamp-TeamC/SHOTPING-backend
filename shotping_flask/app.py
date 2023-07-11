from flask import Flask, jsonify, request
from tasks import prediction
from io import BytesIO

app = Flask(__name__)


@app.route("/")
def hello_world():
    return "Hello, World!"


@app.route("/test_predict", methods=["GET", 'POST'])
def test_predict_route():
    if (request.method == 'POST'):
        if 'image' not in request.files:
            return jsonify({"error": "No file part"})
        
        id = request.form.get('id') # key : id
        image = request.files['image'] # key : image
        
        img_name = BytesIO(image.read()).getvalue() # Bytes로 변환
        
        # celery worker
        task = prediction.delay(id, img_name)
        
        return {"task_id": task.id}, 202


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000,debug=True)
