from celery import Celery
from detect import predict


app = Celery(
    "tasks",
    broker="amqp://kgy3002:kgy30022@shotping-backend-rabbitmq-1:5672/",
    backend="rpc://kgy3002:kgy30022@shotping-backend-rabbitmq-1:5672/",
    include=["tasks"],
)


@app.task
def prediction(img_name):
    return predict(img_name)
