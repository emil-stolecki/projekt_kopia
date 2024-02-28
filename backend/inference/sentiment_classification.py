import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification,AutoConfig
import numpy as np
from operator import itemgetter
from pathlib import Path

class SentimentClassification:

    def __init__(self, folder, device):
        model_path = folder.joinpath(Path('twitter-xlm-roberta-base-sentiment-finetunned'))
        self.sen_tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.sen_model = AutoModelForSequenceClassification.from_pretrained(model_path).to(device)
        self.sen_config = AutoConfig.from_pretrained(model_path)
        self.sen_labels = np.array(list(self.sen_config.id2label.values()))


    def analize_sentiment(self,text):
        # tokenizacja tekstu
        encoded_input = self.sen_tokenizer(text, return_tensors='pt')
        #print(len(encoded_input[0]))

        with torch.no_grad():
            # przeprowadzenie klasyfikacji
            output = self.sen_model(**encoded_input)
            scores = output.logits
            scores = torch.softmax(scores, dim=1).tolist()[0]

            labels = [label.lower() for label in self.sen_config.id2label.values()]


            # złączenie i posortowanie wyników
            zipped = list(zip(labels, scores))
            sorted_results = sorted(zipped, reverse=True, key=itemgetter(1))
            return sorted_results
