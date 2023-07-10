from celery import Celery
from detect import predict_image
from save import save_image


app = Celery(
    "tasks",
    broker="amqp://shotping:shotping@shotping-backend-rabbitmq-1:5672/",
    backend="rpc://shotping:shotping@shotping-backend-rabbitmq-1:5672/",
    include=["tasks"],
)


@app.task
def prediction(id, img_name):
    result = predict_image(img_name)
    save_image(id, result)
    return result
