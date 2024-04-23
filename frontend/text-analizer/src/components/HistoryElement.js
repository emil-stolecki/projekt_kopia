import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
export default function HistoryElement(props){

    const navigate = useNavigate();
    //zawartość elementu
    const element = JSON.parse(props.value)
    //id, po którym będzie można znaleźć obiekt w localstorage po przekierowaniu do strony ze szczegółami
    const keyParam = encodeURIComponent(props.record_key)
    

    function handleClick(){
        if (!props.disabled){
            navigate(`/details?key=${keyParam}`)
        }
    }
    return(
        <li className="history-element-tile" >
            <div className="history-element-tile-checkbox">
                <input type='checkbox' onChange={(e)=>props.handleChange(props.record_key,e.target.checked)} checked={props.selected}/>  
            </div>
            
            <div className="history-element-content" onClick={handleClick} >
            
            <div className="history-element-tile-text" >
                {element.t}
               
            </div>

            <div className="history-element-tile-border"></div>

            <div className="history-element-tile-results">
               <p>language: {element.r.language&&element.r.language[0][0]}</p>
               <p>sentiment: {element.r.sentiment&&element.r.sentiment[0][0]}</p>
               <p>toxicity: {element.r.toxic&&element.r.toxic.toFixed(5)}</p>
            </div>
            <div className='clearfix'></div>
            </div>
        </li>
    )
}