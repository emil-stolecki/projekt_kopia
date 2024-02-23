import Bar from './Bar';
import ShortUniqueId from 'short-unique-id';
export default function Results(props){

  //wizualizacja wyników

  //generator losowych id dla list
  const rowtId = new ShortUniqueId({ length: 10 });

  //warunkowo pokaż analizę emocji (dostępne tylko dla języka angielskiego)
  function renderEmotions(lang){

    if(lang=='english'){  
      return(
        <div>
        <p><b>emocje:</b></p>
        <table><tbody>
             {props.data.emotions &&
              props.data.emotions.map(em => 
                <tr key={rowtId.rnd()} ><td>{em[0]}</td>
                <td>{em[1].toFixed(3)}</td>
                <td><Bar width ={em[1]}/></td></tr>)}
              </tbody></table>
        </div>
      )
    }
  }
  return(
        <div className='results-container'>
          
          <div className='result'>

          <p><b>język:</b></p>
            
            <table><tbody>
                {props.data.language &&
                props.data.language.map(lang => 
                <tr key={rowtId.rnd()}>
                    <td>{lang[0]}</td>
                    <td>{lang[1].toFixed(3)}</td>
                    <td><Bar width ={lang[1]}/></td>
                </tr>)}
            </tbody></table>

            <p><b>sentyment:</b></p>

            <table><tbody>
              {props.data.sentiment &&
                props.data.sentiment.map(sen => 
                 <tr key={rowtId.rnd()} ><td>{sen[0]}</td>
                 <td>{sen[1].toFixed(3)}</td>
                 <td><Bar width ={sen[1]}/></td></tr>)}
            </tbody></table>

            {props.data.language && renderEmotions(props.data.language[0][0])}

            

            <p><b>toksyczność: </b>
            {props.data.toxic && props.data.toxic.toFixed(3)}</p>          
            {props.data.toxic && <Bar width = {props.data.toxic}/>}

          </div>
        </div>
    )
}