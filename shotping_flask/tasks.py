from celery import Celery
from detect import predict_image
from save import save_image
import os

app = Celery(
    "tasks",
    broker="amqp://shotping:shotping@shotping-backend-rabbitmq-1:5672/",
    backend="rpc://shotping:shotping@shotping-backend-rabbitmq-1:5672/",
    # broker=f"amqp://{os.getenv('RABBITMQ_DEFAULT_USER')}:{os.getenv('RABBITMQ_DEFAULT_PASS')}@rabbitmq:5672/",
    # backend=f"rpc://{os.getenv('RABBITMQ_DEFAULT_USER')}:{os.getenv('RABBITMQ_DEFAULT_PASS')}@rabbitmq:5672/",
    include=["tasks"],
)
# app = Celery(
#     "tasks",

#     broker="amqp://shotping:1234@shotping-backend-rabbitmq-1:5672/",
#     backend="rpc://shotping:1234@shotping-backend-rabbitmq-1:5672/",

#     include=["tasks"],
# )


@app.task
def prediction(id, img_name):
    result = predict_image(img_name)
    save_image(id, result)
    return result
