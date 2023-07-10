from celery import Celery
from detect import predict


app = Celery(
    "tasks",
    broker="amqp://shotping:1234@shotping-backend-rabbitmq-1:5672/",
    backend="rpc://shotping:1234@shotping-backend-rabbitmq-1:5672/",
    include=["tasks"],
)


@app.task
def prediction(img_name):
    return predict(img_name)
