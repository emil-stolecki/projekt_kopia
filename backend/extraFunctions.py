import numpy as np
import torch


#ta funkcja podzieli teksty dłuższe niż 510 słów, według przyjętych zasad, w możliwie optymalny sposób,
#kawałki tekstu będą się na siebie częściowo nakładać, żeby zachować kontekst
def pick_params(length, max_itter=20, size=4):
  #limity
  min_window = 400
  min_preferred_window = 490
  max_window = 510
  min_overlap_window_ratio = 0.1
  max_overlap_window_ratio = 0.3
  preffered_overlap_window_ratio = (min_overlap_window_ratio + max_overlap_window_ratio)/2
  min_n = int(length/max_window)+1 #gdzyby rozmiar okna był maksymalny i nie było zakładki, +1 bo musi być zakładka
  max_n = int((length-min_window*max_overlap_window_ratio)/(min_window-min_window*max_overlap_window_ratio))+1 # najmniejsze okno i najwięksa możliwa dla niego zakładka, +1 żeby nie wychodizło mniejsze od min
  max_preferred_n = int((length-max_window*preffered_overlap_window_ratio)/(max_window-max_window*preffered_overlap_window_ratio))+1

  #szukane
  window_size = max_window
  overlap = window_size*preffered_overlap_window_ratio
  n = min_n

  size=size*4#całkowita wielkość zbioru musi być podzielna przez 4
  #początkowe wartości
  window_sizes = np.random.randint(min_preferred_window,max_window+1,size)#preferowane wartośći bliżej do 510
  ns = np.random.randint(min_n,max_preferred_n+1,size)#preferowane mniejsze wartośći
  overlaps = np.random.randint(min_preferred_window*min_overlap_window_ratio,min_preferred_window*max_overlap_window_ratio+1,size)#wygeberowane dla min_preferred_window

  data = np.array(list(zip(window_sizes,ns,overlaps,[0]*size)))#złożenie wszystkiego razem, ostatnie pole na wartość błędu

  #pętla sprawdzająca na ile wylosowane wartości spełniają warunki
  #i generowanie nowych na podstawie tych najlepiej dopasowanych
  #działa do momentu znalezienia odpowiedznio dobrego zestawu lub określoną ilość iteracji
  #założenia:
  # error = (n*window_size - (n-1)*overlap) - length    -> 0 (nie może być ujemny)
  #  błąd oznacza ilość niewykorzystanych miejsc w ostatnim oknie
  # window -> max_window, n->min_n
  i=0
  run=True

  while run and i < max_itter:
    error = (data[:, 1] * data[:, 0] - (data[:, 1] - 1) * data[:, 2]) - length
    data[:, 3] = error
    #print("średni błąd z {} itteracji: {}".format(i,sum(abs(error))/len(error)))
    #posortowanie według wartości bezwzględnej błędu i wybranie najlepszych
    selected = data[abs(data[:, 3]).argsort()][:int(size/4),:]

    new_generation=[]
    for s in selected:
      error_scaled = abs(s[3]/length*100)#jak duży jest błąd w sklai całego tekstu? pomnożony przez 100, żeby ten czynnik miał większe znaczenie dalej

      if s[3] >= 0:
        #spełnony warunek o nieujemności błędu
        #największy wpływ na wynik ma n, więc można je zostawić bez zmian i wybrać tylko nowe okno i zakładkę

        #zbiór możliwych wyborów, nowy okno powinno być mniejsze, żeby zmiejszyć błąd
        pick_window_from = np.arange(min_window, s[0] + 1, 1)
        #funkcja liniowa, która będzie użyta do policzenia prawodpodobieństwa dla każdej elementu z listy możliwości
        #im mniejszy błąd, tym większy iloraz między ostatnią i pierwszą wartością - bardziej stroma funkcja przedstawiająco pradopodobieństwo
        #funkcja jest nachylona tak, żeby wartości bliższe oryginalnej były częściej wybierane
        #im większy błąd, tym większa szansa, że bardziej oddalona wartość będzie wybrana
        x_window=np.linspace(error_scaled, 10 + error_scaled,len(pick_window_from))
        picked_window = np.random.choice(pick_window_from,size=1, p=__get_p(x_window))[0]
        new_generation.append([picked_window, s[1], s[2], 0])#zmienione zostało tylko okno, reszta bez zmian

        #może być tak, że obecny odstęp jest większy niż taki jaki byłby maksymalny dla nowego okna, więc trzeba dać większą przestrzeń możliwości
        pick_overlap_from = np.arange(s[2], int(max_window * max_overlap_window_ratio)+1, 1)#nowa zakładka powinna być większa, żeby zmniejszyć błąd
        x_overlap=np.linspace(10+error_scaled, error_scaled,len(pick_overlap_from))
        picked_overlap = np.random.choice(pick_overlap_from,size=1, p=__get_p(x_overlap))[0]
        new_generation.append( [s[0],s[1],picked_overlap,0])#zmieniona tylko zakładka

        #czy puste miejsce w ostatnim kawałku jest mniejsze od 50?
        #jak tak, to nie zmieniać już n bo blisko do dobrego wyniku
        if s[3] < 50:
          new_generation.append(list(s[:3])+[0])#dodać ten sam zestaw bez zmian
          #czy wystąpiła idealna sytuacja?
          if s[3]<10 and s[0]>min_preferred_window and s[1]<max_preferred_n:
            run = False

        else:
          #wybrać dodatkowo nowe n (mniejsze od oryginalnego) bo błąd jest na tyle duży, że może to pomóc
          pick_n_from = np.arange(min_n,s[1]+1,1)
          x_n=np.linspace(error_scaled, 10 + error_scaled,len(pick_n_from))
          picked_n = np.random.choice(pick_n_from,size=1, p=__get_p(x_n))[0]
          new_generation.append([s[0],picked_n,s[2],0])

      else:
      #błąd jest ujemny, co znaczy, że n okien i zakładek nie pokryje całego tekstu
      #trzeba zwiększyć n, zwiększyć window lub zmniejszyć zakładkę
        pick_window_from = np.arange(s[0],max_window+1,1)
        x_window=np.linspace(10 + error_scaled, error_scaled,len(pick_window_from))
        picked_window = np.random.choice(pick_window_from,size=1, p=__get_p(x_window))[0]
        new_generation.append([picked_window,s[1],s[2],0])

        pick_overlap_from = np.arange(int(s[0]*min_overlap_window_ratio),s[2]+1,1)
        x_overlap=np.linspace(error_scaled,10+error_scaled,len(pick_overlap_from))
        picked_overlap = np.random.choice(pick_overlap_from,size=1, p=__get_p(x_overlap))[0]
        new_generation.append( [s[0],s[1],picked_overlap,0])

        #zmienić n tylko jeśli error < -50
        if s[3]<=-50:
          pick_n_from = np.arange(s[1],max_n+1,1)
          x_n=np.linspace(10 + error_scaled,  error_scaled,len(pick_n_from))
          picked_n = np.random.choice(pick_n_from,size=1, p=__get_p(x_n))[0]
          new_generation.append([s[0],picked_n,s[2],0])

    #dopełnienie nowymi zestawani
    remaining_spaces = size - len(new_generation)
    window_sizes = np.random.randint(min_preferred_window, max_window + 1, remaining_spaces)#higher values preffered,high isexclusive
    ns = np.random.randint(min_n, max_preferred_n+1, remaining_spaces)
    strides = np.random.randint(min_preferred_window * min_overlap_window_ratio, min_preferred_window * max_overlap_window_ratio + 1, remaining_spaces)

    data = np.array(new_generation + list(zip(window_sizes, ns, strides, [0] * size)))
    i += 1

  error = (data[:, 1] * data[:, 0] - (data[:, 1] - 1) * data[:, 2]) - length #policzenie błędu
  data[:, 3] = error
  data = data[data[:,3]>0] #odrzucenie tych z ujemnym błędem
  data[:,0] =  data[:,0]*-1 #błąd, n i zakładka mają być jak najmniejsze, a okno największę, więc tymczasowo będzie zmienione na ujemne do sortowania
  structured  =np.core.records.fromarrays(data.transpose(), names=['window','n','stride','error'])
  order = structured.argsort(order=['error','n','window','stride'])
  data[:,0] =  data[:,0]*-1 # zmienienie okna spowrotem na dodatnie
  return data[order[0]]


#funkcja pomocnicza, która przekształca wartości całkowite w prawdopodobieństwo
def __get_p(array):
  if array[0] < 0:
    array = 1/array
  p = array/np.sum(array)

  return p


#ta funkcja podzieli tekst po tokenizacji na części, żeby zmieścił się w limicie tokenów modelu
def split_text(encoded_input,window,n,overlap,bos,eos,pad):
    offset = window - overlap
    encoded = []
    mask = []
    for i in range(n):
        part = encoded_input.input_ids[0][i * (offset - 1):i * offset + window]
        mask_part = encoded_input.attention_mask[0][i * (offset - 1):i * offset + window]
        part = torch.cat([torch.Tensor([bos]), part, torch.Tensor([eos]), torch.Tensor([pad] * (510 - len(part)))]).to(torch.long)
        mask_part = torch.cat([torch.Tensor([1]), mask_part, torch.Tensor([1]),  torch.Tensor([0] * (510 - len(mask_part)))]).to(torch.long)

        encoded.append(part)
        mask.append(mask_part)

    return (torch.stack(encoded), torch.stack(mask))
