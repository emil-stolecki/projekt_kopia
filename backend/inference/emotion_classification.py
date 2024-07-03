import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification,AutoConfig
import numpy as np
from operator import itemgetter
from pathlib import Path
from extraFunctions import pick_params,split_text
import time
class EmotionClassification:

    def __init__(self, folder, device):
        model_path = folder.joinpath(Path('emotion-english-distilroberta-base'))
        self.emo_tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.emo_model = AutoModelForSequenceClassification.from_pretrained(model_path).to(device)
        self.emo_config = AutoConfig.from_pretrained(model_path)
        self.emo_labels = np.array(list(self.emo_config.id2label.values()))
        self.device = device


    def recognize_emotions(self,text):
        encoded_input = self.emo_tokenizer.encode_plus(text, add_special_tokens=False, truncation=False,
                                                       return_tensors="pt")

        input_ids = []
        attention_mask = []
        if len(encoded_input[0]) > 510:
            n = pick_params(len(encoded_input[0]))
            input_ids, attention_mask = split_text(encoded_input,
                                                    n,
                                                   self.emo_tokenizer.cls_token_id, self.emo_tokenizer.sep_token_id,
                                                   self.emo_tokenizer.pad_token_id)
        else:
            input_ids = torch.stack(
                [torch.cat([torch.Tensor([self.emo_tokenizer.cls_token_id]), encoded_input.input_ids[0],
                            torch.Tensor([self.emo_tokenizer.sep_token_id])]).to(torch.long).to(self.device)])
            attention_mask = torch.stack(
                [torch.cat([torch.Tensor([1]), encoded_input.attention_mask[0], torch.Tensor([1])]).to(torch.long).to(
                    self.device)])


        with torch.no_grad():
            start = time.perf_counter()
            output = self.emo_model(input_ids, attention_mask=attention_mask)
            scores = output.logits

            #jeśli tekst był podzielony na części, policzenie średniej wyników
            if len(encoded_input[0]) > 510:
                scores = torch.tensor(
                    np.array(
                        [np.mean(scores.numpy(), 0)]
                    )
                )
            scores = torch.softmax(scores, dim=1).numpy()[0]
            label_names = np.array(list(self.emo_config.id2label.values()))

            # wybranie emocji, dla których wynik jest większy od danego progu
            relevance_mask = scores > 0.001

            labels = label_names[relevance_mask]
            # konwersja z numpy array na listę, do poźniejszej JSONizacji
            best = scores[relevance_mask].tolist()

            # złączenie i posortowanie wyników
            zipped = list(zip(labels, best))
            sorted_results = sorted(zipped, reverse=True, key=itemgetter(1))

            return sorted_results


