from celery import Celery
from detect import predict


app = Celery(
    "tasks",
    broker="amqp://shotping:shotping@shotping-backend-rabbitmq-1:5672/",
    backend="rpc://shotping:shotping@shotping-backend-rabbitmq-1:5672/",
    include=["tasks"],
)


@app.task
def prediction(id, img_name):
    result = predict(img_name)
    return result
