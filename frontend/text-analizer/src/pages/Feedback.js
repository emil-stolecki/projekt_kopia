import axios from 'axios';
import React, {useEffect,useState} from 'react';
import { useLocation } from 'react-router-dom';
import Topbar from "../components/Topbar"
import '../css/feedback.css'
import ReferenceListElement from '../components/ReferenceListElement';
import LabelCorrection from '../components/LabelCorrection';
import labels from '../labels.json' ;

export default function Feedback(){
    
    const location = useLocation();
    //ewentualne zaznaczone wcześniej zapisy
    const listOfkeys = new URLSearchParams(location.search).get('keys');
    //wszystkie elementy z localstorage
    const items = 
        Object.fromEntries(
        Object.entries({...localStorage})
        .filter(([k,v])=>/\d{1,2}-\d{1,2}-[A-Za-z]/g.test(k))//tylko elementy reprezentujące analizę tekstu
        .map(([key, value]) => [key, JSON.parse(value)])
    );

    //niedodane do opinni zapisy
    //domyślnie wszystkie elementy z items, ale jeśli było przekierowanie z /history
    //lista będzie pomnijeszona o wybrane elementy
    const [itemsToAdd, setItemsToAdd] = useState(
        listOfkeys == undefined?Object.entries(items):Object.entries(items).filter(([key,val])=>!listOfkeys.includes(key))
    )

    //zapisy, których ma dotyczyć opinia
    //domyślnie pusta lista, ale jeśli było przekierowanie z /history
    //lista będzie zawierać wybrane elementy
    const [addedItems, setAddedItems] = useState(    
        listOfkeys == undefined?[]:Object.entries(items).filter(([key,val])=>listOfkeys.includes(key))
    )
    
    //poprawione przez użytkownika wyniki
    const [selectedEmotions, setSelectedEmotions] = useState([])
    const [selectedlanguage, setSelectedLanguage] = useState([])
    const [selectedToxic, setSelectedToxic] = useState([])
    const [selectedSentiment, setSelectedSentiment] = useState([])

    //komentarz od użytkownika
    const [inputText, setInpuText] = useState('')

    //odpowiedź od serwera
    const [status, setStatus]=useState({})

    //przesłanie opinii
    async function send(e){ 
        e.preventDefault()
        document.body.style.cursor = 'wait'
        if(addedItems.length>0){
            const feedback = {
                references: addedItems.map((x)=>{
                    return {text:x[1].t, results:x[1].r}}),
                opinion:inputText,
                corrected:{
                   toxic: selectedToxic,
                   sentiment: selectedSentiment,
                   emotion: selectedEmotions,
                   language: selectedlanguage
                }
            }

            try {
                const response = await axios.post('http://localhost:8000/save-feedback',feedback);
                setStatus(response.data); 
                
                addedItems.forEach((item)=>{
                    item[1].f = 1
                    localStorage.setItem(item[0],JSON.stringify(item[1]))
                })


            } catch (error) {
                setStatus({success:false,message:error.message});
            }
        }
        else{
            setStatus({success:false, message:'nie zaznaczono tekstu'})
        }
        
        document.body.style.cursor = 'default'
        

    }

    //ustawienie wyników klasyfikacji na takie, jakie zostały orginalnie otrzymane
    //trzeba je zmienić za każdym razem, kiedy na liście analiz do recenzji znajdzie się
    //tylko jeden element 
    function setInitialState(list){
        setSelectedEmotions(
            list[1].r.emotions?
            list[1].r.emotions.filter((x)=>x[1]>0.1).map((x)=>x[0])
            :[]
        )
        setSelectedLanguage(list[1].r.language[0][0])
        setSelectedSentiment(list[1].r.sentiment[0][0])
        setSelectedToxic(list[1].r.toxic>0.5?'toxic':'non-toxic')  
    }
    
    //jeśli był wybrany jeden element z historii, a następnie przekierowanie do /feedback
    //trzeba ustawić jego wyniki klasyfikacji
    useEffect(()=>{
        if(listOfkeys != undefined){
            if (listOfkeys.length === 1){
                setInitialState(addedItems[0])
            }
        }
    },[])

    //użytkownik wybiera element z listy dotychczasowych analiz
    function handlePick(e){
        const key=e.target.value
        const len = addedItems.length
        setAddedItems([...addedItems,[key,items[key]]])
        setItemsToAdd(itemsToAdd.filter((x)=>x[0] !== key))   

        if(len+1===1){
            setInitialState([key,items[key]])
        }
    };

    //użytkownik usuwa element z listy analiz do recenzji
    function handleremove(key){
        const len = addedItems.length
        const newList = addedItems.filter((x)=>x[0] !== key)
        setItemsToAdd([...itemsToAdd,[key,items[key]]])
        setAddedItems(newList)
        if(len-1===1){
            setInitialState(newList[0])   
        }
    };

    //do korekty emocji - zaznaczenie lub odznaczenie elementu z listy emocji, które powinny być
    //wynikiem analizy, ale zostały błędnie wybrane lub pominięte
    function handleCheckbox(key,value){
        if (value) {
            setSelectedEmotions([...selectedEmotions, key]);
        } else {
            setSelectedEmotions(selectedEmotions.filter((item) => item !== key));
        }
    };


    const textListStyle=[
        {
            color:'black'
        },
        {
            color:'#505050'
        }
    ]


    return(
        <div className='App'>
            <Topbar/>
            <div className='content'>
                <div className='feedback-left'>
                    <div className='reference'>
                        <select className='text-list' onChange={handlePick} size={5} >
                            {itemsToAdd.map((x)=><option key={x[0]} value={x[0]} style={textListStyle[x[1].f]}>{x[1].t.slice(0,70)+'...'}</option>)}
                        </select>
                        <ul>
                            {addedItems.map((x)=><ReferenceListElement key={x[0]} text={x[1].t} record_key={x[0]} onRemove={handleremove}/>)}                           
                        </ul>
                    </div>              
                </div>
                
                <div className='feedback-right'>
                    {addedItems.length === 1 && 
                    <div className='correction'>    
                        
                        <b>klasyfikacja: </b> 
                        <table>
                            <tbody>
                                <tr className="label-correction"><th>kategoria</th><th>klasyfikacja</th><th>korekcja</th></tr>
                                <LabelCorrection category='language' label={addedItems[0][1].r.language[0][0]} 
                                                labels={labels.language} multichoice={false}
                                                handleChange={setSelectedLanguage}/>

                                <LabelCorrection category='toxic?' 
                                                label={addedItems[0][1].r.toxic>0.5?'toxic':'non-toxic'} 
                                                labels={labels.toxic} multichoice={false}
                                                handleChange={setSelectedToxic}/>

                                <LabelCorrection category='sentiment'
                                                label={addedItems[0][1].r.sentiment[0][0]} 
                                                labels={labels.sentiment} multichoice={false}
                                                handleChange={setSelectedSentiment}/>
                                                

                                <LabelCorrection category='emotion'
                                                label={addedItems[0][1].r.emotions?addedItems[0][1].r.emotions.filter((x)=>x[1]>0.1).map((x)=>x[0]):[]} 
                                                labels={labels.emotion} multichoice={true}  
                                                handleChange={handleCheckbox} selected={selectedEmotions}/>
                            </tbody>
                        </table>
                        

                    </div>}
                    {addedItems.length !== 1 && 
                    <div className='correction'>
                        <p >
                            Dla zaznaczonego jednego elementu można zasugerować bardziej pasujące klasyfikacje. 
                            Jeśli chcesz przesłać opinię dotyczącą kilku tekstów, możesz później poprawić każdy z nich z osobna.
                        </p>
                    </div>}
                    <div className='opinion'>
                        <b>Komentarz:</b>
                        <textarea value={inputText} onChange={(e)=>setInpuText(e.target.value)}></textarea>
                    </div>
                    <button className='send-button' onClick={send}>send</button>
                    <p>{status.message&&status.message}</p>
                </div>
                <div className='clearfix'></div>
            </div>
        </div>
    )
}

