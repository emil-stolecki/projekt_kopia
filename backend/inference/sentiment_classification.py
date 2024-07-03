import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification,AutoConfig
import numpy as np
from operator import itemgetter
from pathlib import Path
from extraFunctions import pick_params,split_text
import time
class SentimentClassification:

    def __init__(self, folder, device):
        model_path = folder.joinpath(Path('twitter-xlm-roberta-base-sentiment-finetunned'))
        self.sen_tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.sen_model = AutoModelForSequenceClassification.from_pretrained(model_path).to(device)
        self.sen_config = AutoConfig.from_pretrained(model_path)
        self.sen_labels = np.array(list(self.sen_config.id2label.values()))
        self.device = device

    def analize_sentiment(self,text):
        # tokenizacja tekstu
        encoded_input = self.sen_tokenizer.encode_plus(text, add_special_tokens=False, truncation=False,
                                                       return_tensors="pt")
        input_ids = []
        attention_mask = []

        if len(encoded_input[0]) > 510:
            n = pick_params(len(encoded_input[0]))
            input_ids, attention_mask = split_text(encoded_input,
                                                   n,
                                                   self.sen_tokenizer.cls_token_id, self.sen_tokenizer.sep_token_id,
                                                   self.sen_tokenizer.pad_token_id)
        else:
            input_ids = torch.stack(
                [torch.cat([torch.Tensor([self.sen_tokenizer.cls_token_id]), encoded_input.input_ids[0],
                            torch.Tensor([self.sen_tokenizer.sep_token_id])]).to(torch.long).to(self.device)])
            attention_mask = torch.stack(
                [torch.cat([torch.Tensor([1]), encoded_input.attention_mask[0], torch.Tensor([1])]).to(torch.long).to(
                    self.device)])

        with torch.no_grad():
            # przeprowadzenie klasyfikacji
            output = self.sen_model(input_ids, attention_mask=attention_mask)
            scores = output.logits

            # jeśli tekst był podzielony na części, policzenie średniej wyników
            if len(encoded_input[0]) > 510:
                scores = torch.tensor(
                    np.array(
                        [np.mean(scores.numpy(), 0)]
                    )
                )

            scores = torch.softmax(scores, dim=1).tolist()[0]

            labels = [label.lower() for label in self.sen_config.id2label.values()]


            # złączenie i posortowanie wyników
            zipped = list(zip(labels, scores))
            sorted_results = sorted(zipped, reverse=True, key=itemgetter(1))
            return sorted_results



