
export default function LabelCorrection(props){
    
    //element pozwalający na ręczne poprawienie wyników analizy w danej kategorii

    return(
        <tr className="label-correction">
            <td className="category" >{props.category}</td>
            <td className="label">
                {props.multichoice===false && props.label}
                {props.multichoice===true && props.label.map(x=><pre key={x}>{x}</pre>)}
            </td>
            <td>
            {props.multichoice===false &&
                <select className="corrected-label" defaultValue={props.label}
                onChange={(e)=>props.handleChange(e.target.value)}>
                    {props.labels.map((x)=>
                    <option key={x} value={x}>
                        {x}
                    </option>
                    )}
                </select>}
            {props.multichoice===true &&                
                <ul>
                    {props.labels.map((x)=>
                    <li key={x} ><input type="checkbox" checked={props.selected.includes(x)}
                        onChange={(e)=>props.handleChange(x,e.target.checked)}></input>{x} </li>)}
                </ul>
            }
            </td>

            
        </tr>
    )
}