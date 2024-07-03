import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification,AutoConfig
import numpy as np
from operator import itemgetter
from pathlib import Path
from extraFunctions import pick_params, split_text
import time
class LanguageClassification:

    def __init__(self,folder,device):
        model_path = folder.joinpath(Path('51-languages-classifier'))
        self.lang_tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.lang_model = AutoModelForSequenceClassification.from_pretrained(model_path).to(device)
        self.lang_config = AutoConfig.from_pretrained(model_path)
        self.lang_labels = np.array(list(self.lang_config.id2label.values()))
        self.device = device

        self.lang_map = {}
        with open(folder.joinpath(Path('config/lang_names.txt')), 'r') as file:
          for line in file:
            lang = line.strip().split(',')
            self.lang_map[lang[0]] = lang[1]

    def recognize_language(self,text):
        #tokenizacja tekstu
        encoded_input = self.lang_tokenizer.encode_plus(text, add_special_tokens=False, truncation=False,
                                                      return_tensors="pt")
        input_ids = []
        attention_mask = []
        if len(encoded_input[0]) > 510:
            n = pick_params(len(encoded_input[0]))
            input_ids, attention_mask = split_text(encoded_input,
                                                   n,
                                                   self.lang_tokenizer.cls_token_id, self.lang_tokenizer.sep_token_id,
                                                   self.lang_tokenizer.pad_token_id)
        else:
            input_ids = torch.stack(
                [torch.cat([torch.Tensor([self.lang_tokenizer.cls_token_id]), encoded_input.input_ids[0],
                            torch.Tensor([self.lang_tokenizer.sep_token_id])]).to(torch.long).to(self.device)])
            attention_mask = torch.stack(
                [torch.cat([torch.Tensor([1]), encoded_input.attention_mask[0], torch.Tensor([1])]).to(torch.long).to(
                    self.device)])
        #przeprowadzenie klasyfikacji
        #obliczanie gradientów nie jest konieczne do interferencji, torch.no_grad może zaoszczędzić czas

        with torch.no_grad():
            outputs = self.lang_model (input_ids, attention_mask=attention_mask)
            scores = outputs.logits

            # jeśli tekst był podzielony na części, policzenie średniej wyników
            if len(encoded_input[0]) > 510:
                scores = torch.tensor(
                    np.array(
                        [np.mean(scores.numpy(), 0)]
                    )
                )
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


