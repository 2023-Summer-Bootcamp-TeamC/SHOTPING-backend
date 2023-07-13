from celery import Celery
from detect import predict_image
import os

app = Celery(
    "tasks",
    broker=f"amqp://{os.getenv('RABBITMQ_DEFAULT_USER')}:{os.getenv('RABBITMQ_DEFAULT_PASS')}@rabbitmq:5672/",
    backend=f"rpc://{os.getenv('RABBITMQ_DEFAULT_USER')}:{os.getenv('RABBITMQ_DEFAULT_PASS')}@rabbitmq:5672/",
    include=["tasks"],
)

@app.task
def prediction(img_name):
    result = predict_image(img_name)
    return result