
export default function ReferenceListElement(props){

    //element wybrany do recenzji
    return(
        <li className="reference-list-element">
            <p>{props.text}</p><button onClick={()=>props.onRemove(props.record_key)} disabled={props.disabled}>X</button>
            <div className='clearfix'></div>
        </li>
    )
}