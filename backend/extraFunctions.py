import numpy as np
import torch
window = 280 
overlap = 10

def pick_params(length):

    run = True
    remaining = length
    n = 1
    while run:
        remaining = remaining - window + overlap
        n = n + 1
        if remaining <= window:
            run = False

    return n



#ta funkcja podzieli tekst po tokenizacji na części, żeby zmieścił się w limicie tokenów modelu
def split_text(encoded_input,n,bos,eos,pad):

    offset = window - overlap
    encoded = []
    mask = []
    print("n ",n)
    print("len",len(encoded_input[0]))
    for i in range(n-1):
        part = encoded_input.input_ids[0][i * (offset - 1)+i:i * offset + window]
        mask_part = encoded_input.attention_mask[0][i * (offset - 1)+i:i * offset + window]
        part = torch.cat([torch.Tensor([bos]), part, torch.Tensor([eos]) ]).to(torch.long)
        mask_part = torch.cat([torch.Tensor([1]), mask_part, torch.Tensor([1]) ]).to(torch.long)

        encoded.append(part)
        mask.append(mask_part)

    #ostatni kawałek może być krótszy, więc trzeba go wyrównać do długości innych
    part = encoded_input.input_ids[0][(n-1) * (offset - 1) + n-1:(n-1) * offset + window]
    mask_part = encoded_input.attention_mask[0][(n-1) * (offset - 1) + n-1:(n-1) * offset + window]
    part = torch.cat([torch.Tensor([bos]), part, torch.Tensor([eos]),torch.Tensor([pad] * (window - len(part))) ]).to(torch.long)
    mask_part = torch.cat([torch.Tensor([1]), mask_part, torch.Tensor([1]), torch.Tensor([pad] * (window - len(part)))]).to(torch.long)

    print(len(torch.stack(encoded)[0]))
    return (torch.stack(encoded), torch.stack(mask))
