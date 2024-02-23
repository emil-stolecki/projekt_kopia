import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification,AutoConfig
import numpy as np
from operator import itemgetter
from pathlib import Path

class ToxicityClassification:

    def __init__(self, folder, device):
        model_path = folder.joinpath(Path('twitter-xlm-roberta-base-sentiment-finetunned'))
        self.tox_tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.tox_model = AutoModelForSequenceClassification.from_pretrained(model_path).to(device)
        self.device=device

    def is_toxic(self,text):
        # tokenizacja tekstu
        encoded_input = self.tox_tokenizer.encode_plus(text, add_special_tokens=True, return_tensors="pt")
        input_ids = encoded_input["input_ids"].to(self.device)
        attention_mask = encoded_input["attention_mask"].to(self.device)

        with torch.no_grad():
            # przeprowadzenie klasyfikacji
            outputs = self.tox_model(input_ids, attention_mask=attention_mask)
            scores = outputs.logits
            #potrzebny jest tylko wynik dla 'toxic', czyli pierwszego wyniku na liście
            #wynik dla 'non_toxic' to 1-toxic
            toxic_score = torch.softmax(scores, dim=1).tolist()[0][0]

            return toxic_score


