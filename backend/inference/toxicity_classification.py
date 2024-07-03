import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification,AutoConfig
from pathlib import Path
import numpy as np
import time
from extraFunctions import pick_params,split_text

class ToxicityClassification:

    def __init__(self, folder, device):
        model_path = folder.joinpath(Path('one-for-all-toxicity-v3'))
        self.tox_tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.tox_model = AutoModelForSequenceClassification.from_pretrained(model_path).to(device)
        self.device=device



    def is_toxic(self,text):
        # tokenizacja tekstu
        encoded_input = self.tox_tokenizer.encode_plus(text, add_special_tokens=False, truncation=False, return_tensors="pt")
        input_ids = []
        attention_mask = []

        if len(encoded_input[0])>510:
            n = pick_params(len(encoded_input[0]))
            input_ids, attention_mask = split_text(encoded_input,
                                                  n,
                                                  self.tox_tokenizer.cls_token_id,self.tox_tokenizer.sep_token_id,self.tox_tokenizer.pad_token_id)
        else:
            input_ids = torch.stack(
                [torch.cat([torch.Tensor([self.tox_tokenizer.cls_token_id]), encoded_input.input_ids[0],
                                   torch.Tensor([self.tox_tokenizer.sep_token_id])]).to(torch.long).to(self.device)])
            attention_mask = torch.stack(
                [torch.cat([torch.Tensor([1]), encoded_input.attention_mask[0], torch.Tensor([1])]).to(torch.long).to(self.device)])

        with torch.no_grad():
            start = time.perf_counter()
            # przeprowadzenie klasyfikacji
            outputs = self.tox_model(input_ids, attention_mask=attention_mask)
            scores = outputs.logits
            # jeśli tekst był podzielony na części, policzenie średniej wyników
            if len(encoded_input[0]) > 510:
                scores = torch.tensor(
                    np.array(
                        [np.mean(scores.numpy(), 0)]
                    )
                )
            #potrzebny jest tylko wynik dla 'toxic', czyli drugiego wyniku na liście
            #wynik dla 'non_toxic' to 1-toxic
            toxic_score = torch.softmax(scores, dim=1).tolist()[0][1]
            return toxic_score


