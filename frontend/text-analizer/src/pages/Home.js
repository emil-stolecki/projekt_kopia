import axios from 'axios';
import React, { useState, useEffect } from 'react';
import ShortUniqueId from 'short-unique-id';
import '../css/home.css';
import Topbar from '../components/Topbar';
import Results from '../components/Results';
import Tutorial from '../components/Tutorial';

export default function Home(){
  //wpisany tekst
  const [input, setInput]=useState('')
  //otrzymana odpowiedź
  const [data, setData] = useState([]);
  //ewentualny błąd
  const [error, setError] = useState([]);
  //generator losowych kluczy
  const storageKeyId = new ShortUniqueId({ length: 2 });
  //tutorial
  const [shouldTutorialRun,setShoulTutorialdRun] = useState(localStorage.getItem('tutorial')!=="ok")//ok znaczy, że tutorial został ukończony lub pominięty

function updateTextArea(e){
  setInput(e.target.value)
}


//wysłanie tekstu do analizy
async function send(e){ 
    e.preventDefault()
    if(input.length>0 && input.length<10000){
      document.body.style.cursor = 'wait'     
      try {
        const response = await axios.post('http://localhost:8000/inference',{text:input});
        setData(response.data);
        console.log(response.data)
        //wpis do local storage
        const date = new Date()
        const random = storageKeyId.rnd()
        const key = date.getMonth() + '-' + date.getDate() +'-'+ random
        //t - tekst, r - wynik analizy, f - czy użytkownik przesłał już feedback dotyczący tej analizy 
        let record = {t:input,r:response.data, f:0}
        localStorage.setItem(key, JSON.stringify(record))    

        //jeśli wcześniej był błąd, to po udanym zapytnaiu zniknie
        setError('')
      } catch (error) {
        setError(error.message);
      }
      document.body.style.cursor = 'default'
    }
    else if(input.length==0){
      setError('pole jest puste')
    }
    else{
      setError('przekroczono limit znaków - 10 000')
    }
}


  return (
    <div className="App">    
      <Topbar/>
      <div className='content'>
        <div className='input'>
        <textarea  value={input}onChange={updateTextArea} disabled={shouldTutorialRun} ></textarea>
        <br/>
        <button className='send-button' onClick={send} disabled={shouldTutorialRun}>Wyślij</button>
        <br/>
        {error&&<p>{error}</p>}
        
        </div>
        <Results data={data}/>
        <div className='clearfix'></div>
        
      </div>
      {shouldTutorialRun && <Tutorial shouldRun={shouldTutorialRun} onFinish={()=>setShoulTutorialdRun(false)} 
         other={{'input':setInput,'response':setData}}/>}
     
      
      
    </div>
  );

}