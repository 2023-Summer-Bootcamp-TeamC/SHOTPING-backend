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
        file = request.files['image'] # key : image
        
        img_name = BytesIO(file.read()).getvalue() # Bytes로 변환
        
        # celery worker
        task = prediction.delay(id, img_name)
        
        return {"task_id": task.id}, 202

    # 이미지 파일의 이름을 직접 입력합니다. 여기에 있는 'test.jpg'를 실제 이미지 파일의 이름으로 변경해주세요.
    elif (request.method == 'GET'):
        id = 0
        img_name = "image_0.jpg"
        task = prediction.delay(id, img_name)
        return {"task_id": task.id}, 202

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
