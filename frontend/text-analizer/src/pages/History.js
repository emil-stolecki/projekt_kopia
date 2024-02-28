import ShortUniqueId from 'short-unique-id';
import React, { useState} from 'react';
import '../css/history.css'
import { useNavigate } from 'react-router-dom';
import HistoryElement from '../components/HistoryElement';
import Topbar from '../components/Topbar';

export default function History(){

    const navigate = useNavigate();
    //zapisy poprzednich analiz z localstorage
    const [items,updateItems] = useState(
        Object.entries({ ...localStorage }));
    //czy została wywołana funkcja zaznaczająca wszystkie pozycje? albo odznaczająca?
    const [selectedAll,setselectedAll] = useState(false)
    //lista stanów zaznaczenia wszystkich elementów
    const [selected,setSelected] = useState([])

    //funkcja obliczająca zajęte miejsce w local storage na podstawie ilości znaków
    const calculateUsedSpace = () => {
        let allStrings = '';
        for (let i=0; i<items.length; i++) {
          
          allStrings += (items[i][0]+items[i][1]);
        }
        //1 bajt = 8 bitów
        //1 znak = 16 bitów = 2 bajty 
        //1KB = 1024 bajty   
        return ((allStrings.length * 2) / 1024 / 1024);
    };

    //obecna zajętość pamięci
    const [usedSpace,setUsedSpace] = useState(calculateUsedSpace)
    
    //funkcja przekazana do wszystkich elementów, aktualizująca stan zaznaczenia
    function handleChange(key,value){
        if (value) {
            setSelected([...selected, key]);
        } else {
            setSelected(selected.filter((item) => item !== key));
        }
    };

    //zaznacza lub odznacza wszystkie pozycja
    function selectDeselectAll(){
        const state = selectedAll
        if (state) {
            setSelected([])
            setselectedAll(false)
        }
        else {
            setSelected(Object.keys({ ...localStorage }))
            setselectedAll(true)
        }
    }

    //usuwa zaznaczone elementy
    function deleteSelected(){
        selected.forEach((key) => localStorage.removeItem(key))
        updateItems(Object.entries({ ...localStorage }))
        setUsedSpace(calculateUsedSpace)
    }

    //przekieruje do strony do przesyłania opinii z zaznaczonymi elementami
    function sendFeedback(){
        navigate(`/feedback?keys=${encodeURIComponent(selected)}`)
    }

    return(
        <div className='App'>
            <Topbar/>
            <div className='menu'>
                <button className="menu-button" onClick={selectDeselectAll}>{selectedAll?'Odznacz wszystko':'Zaznacz wszystko'}</button>
                <button className="menu-button" onClick={deleteSelected}>Usuń zaznaczone</button>
                <button className="menu-button" onClick={sendFeedback}>Prześlij opinię</button>
                <p>{'zajęte miejsce: ' + usedSpace.toFixed(3) + ' MB'}</p>
                <div className='clearfix'></div>
            </div>
            <div className='content'>
                <ul>
                    {items.map((x)=><HistoryElement key={x[0]} record_key={x[0]} value={x[1]} 
                    selected={selected.includes(x[0])} handleChange={handleChange}/>)}
                </ul>
                
            </div>
        </div>
    )
}