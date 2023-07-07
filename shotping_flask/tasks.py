from celery import Celery
from detect import predict

app = Celery('tasks',
             broker='/',
             backend='/',
             include=["tasks"])

@app.task
def prediction(img_name):
    return predict(img_name)