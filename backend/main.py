from fastapi import FastAPI
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from inference.language_classification import LanguageClassification
from inference.toxicity_classification import ToxicityClassification
from inference.sentiment_classification import SentimentClassification
from inference.emotion_classification import EmotionClassification

from database import Database
import os
from dotenv import load_dotenv
import torch

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
#device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
device ="cpu"
print(torch.cuda.is_available())
folder = Path('llm-models')

lang_cl = LanguageClassification(folder, device)
tox_cl = ToxicityClassification(folder, device)
sen_cl = SentimentClassification(folder, device)
emo_cl = EmotionClassification(folder, device)


#załadowanie zmiennych środowiskowych
load_dotenv()
name = os.environ.get("NAME")
password = os.environ.get("PASSWORD")
db = Database(name, password)


class Request(BaseModel):
    text: str


class Feedback(BaseModel):
    references: list
    opinion: str
    corrected: object


@app.post("/inference")
async def inference(request: Request):
    lang = lang_cl.recognize_language(request.text)
    tox = tox_cl.is_toxic(request.text)
    sen = sen_cl.analize_sentiment(request.text)
    emo = None

    # czy teksts jest po angielsku?
    if any(prediction[0] == 'english' for prediction in lang):
        emo = emo_cl.recognize_emotions(request.text)

    return {"language": lang,
            "toxic": tox,
            "sentiment": sen,
            "emotions": emo}


@app.post("/save-feedback")
async def save_feedback(feedback: Feedback):
    success = True
    message = "feedback saved"

    try:
        db.save_feedback(feedback)

    except Exception as e:
        success = False
        message = "Something went wrong: "+str(e)

    return {"success": success, "message": message}


@app.on_event("shutdown")
def shutdown_event():
    try:
        db.client.close()
        print("Mongo disconected")
    except Exception as e:
        print('Error closing MongoDB connection:', e)
