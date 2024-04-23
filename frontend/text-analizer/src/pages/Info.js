import Topbar from "../components/Topbar";
import { useNavigate } from 'react-router-dom';
import '../css/info.css';

export default function Info(){

    const navigate = useNavigate()

    function startTutprial(){
        localStorage.setItem('tutorial',0)
        navigate('/home')
    }

    return(
        <div className='App'>
            <Topbar/>
            
            <div className='content'>
                
                <div className="space"></div>

                <div className="intro">
                    <h1>Witaj, w zakładce Info</h1>
                    <p>
                        Poznasz tutaj szczegóły działania tej aplikacji.
                    </p>

                </div>

                <div className="paragraph">
                    <h3>Cel powstania aplikacji</h3>
                    <p>
                        Celem stworzenia tej aplikacji było sprawdzenie na ile ogólnodostępne modele językowe poradzą sobie z analizą tekstu. 
                        Dokładniej, jak dobrze modele będą w stanie sklasyfikować tekst jako toksyczny, czy wulagrny, czy rozpoznają sentyment autora 
                        i czy będą w stanie poprawnie rozpoznać emocje zawarte w wypowiedzi. Strona ta pozwala użytkownikowi przesyłać opinie dotyczące jakości analiz,
                        i dokonanie ewentualnej korekcji, co może posłużyć w przyszłości jako zestaw danych do dotrenowania modelów, poprawiając ich działanie 
                        lub umożliwić przeprowadzenie klasyfikacji, która nie była wcześniej możliwa, np klasyfikacja emocji dla języka innego niż angielski.
                    </p>
                </div>

                <div className="paragraph">
                    <h3>Używanie aplikacji</h3>
                    <p>
                        W zakładce Home znajduje się pole do wprowadzenia tekstu do analizy. Po wciśnięciu przycisku Wyślij, tekst zostanie przesłany do serwera,
                         wybrane modele dokonają na mim klasyfikacji, a wyniki zostaną zwrócone i wyświetlone na stronie. 
                    </p>

                    <p>
                        W zakładce History znajdują się wyniki ostatnich analiz. Dane są zapisywane po stronie uzytkownika i są przechowywane
                        do momentu usunięcia ich lub do ręcznego skasowania zawartości local storage.
                    </p>

                    <p>
                        W zakłądce Feedback można poprawić niedokładne wyniki analizy i przesłąć opinię na temat działania aplikacji.
                    </p>
                    
                    <br/>

                    <p>
                        Jeśli chcesz ponownie odtworzyć tutorial, klinij tutaj:
                    </p>
                    <button className="tutorial-button" onClick={startTutprial}>Tutorial</button>

                </div>

                <div className="paragraph">
                    <h3>informacje o modelach</h3>
                    <p>Modele pochodzą z repozytorium HuggingFace</p>
                    <p className="left">Klasyfikacja toksyczności: <span>FredZhang7/one-for-all-toxicity-v3</span></p>
                    <p className="left">Klasyfikacja sentymentu: <span>citizenlab/twitter-xlm-roberta-base-sentiment-finetunned </span></p>
                    <p className="left">Klasyfikacja emocji: <span>j-hartmann/emotion-english-distilroberta-base </span></p>
                    <p className="left">Klasyfikacja języka: <span>qanastek/51-languages-classifier </span></p>
                </div>

                <br/>
            </div>
            <div className='clearfix'></div>
        </div>
    )
}


