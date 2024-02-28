import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification,AutoConfig
import numpy as np
from operator import itemgetter
from pathlib import Path

class LanguageClassification:

    def __init__(self,folder,device):
        model_path = folder.joinpath(Path('51-languages-classifier'))
        self.lang_tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.lang_model = AutoModelForSequenceClassification.from_pretrained(model_path).to(device)
        self.lang_config = AutoConfig.from_pretrained(model_path)
        self.lang_labels = np.array(list(self.lang_config.id2label.values()))

        self.lang_map = {}
        with open(folder.joinpath(Path('config/lang_names.txt')), 'r') as file:
          for line in file:
            lang = line.strip().split(',')
            self.lang_map[lang[0]] = lang[1]

    def recognize_language(self,text):
        #tokenizacja tekstu
        encoded_input = self.lang_tokenizer(text, return_tensors='pt')
        #print(len(encoded_input[0]))
        #przeprowadzenie klasyfikacji
        #obliczanie gradientów nie jest konieczne do interferencji, torch.no_grad może zaoszczędzić czas
        with torch.no_grad():
            output = self.lang_model(**encoded_input)
            scores = output.logits

            scores = torch.softmax(scores, dim=1).numpy()[0]

            #wybranie języków, dla których wynik jest większy od danego progu
            relevance_mask = scores>0.01
            labels = self.lang_labels[relevance_mask]
            #konwersja z numpy array na listę, do poźniejszej JSONizacji
            best = scores[relevance_mask].tolist()


            #zmiana skróconej nazwy, która zwraca model, na pełną nazwę języka
            labels = list(map(lambda x:self.lang_map[x] ,labels))

            #złączenie i posortowanie wyników
            zipped=list(zip(labels,best))
            sorted_results = sorted(zipped, reverse=True,key=itemgetter(1))
            return sorted_results




