import React, {useEffect,useState, useContext} from 'react';
import axios from 'axios';
import { Server } from '../index';
import '../css/database.css';
import labels from '../labels.json' ;
import RecordTile from '../components/RecordTile';
import { type } from '@testing-library/user-event/dist/type';


export default function Database(){

    const [startDate,setStartDate] = useState("")
    const [endDate,setEndDate] = useState("")

    const [minNumber,setMinNumber] = useState("")
    const [maxNumber,setMaxNumber] = useState("")

    const [minLength,setMinLength] = useState("")
    const [maxLength,setMaxLength] = useState("")

    const [language,setLanguage] = useState(null)
    const [correction,setCorrection] = useState(null)
    const [comment,setComment] = useState(null)
    const [words,setWords] = useState("")
    const [query,setQuery] = useState("")

    const [data,setData] = useState([])
    const server = useContext(Server)

    const [checked,setChecked] = useState({
        date:false,
        number:false,
        length:false,
        language: false,
        correction: false,
        comment: false,
        words: false,
        query:false,
        })
    const [page,setPage]=useState(0)
    const [recordCount,setRecordCount]=useState(0)
    const [filter,setFilter]=useState({})
    const records_per_page = 10

    useEffect(()=>{
        const fetchData = async ()=>{
            try {
                const response = await axios.post(server+'database-filter',{params:{page:0,filter:{},limit:records_per_page}})
                setData(response.data)   
                setRecordCount(response.data.count) 
                
            }
            catch(error){

            }
        };
        fetchData()
    },[])


    async function search(){
        setPage(0)
   
        if(checked.query){
            try {
                const response = await axios.post(server+'database-query',{params:{page:0,query:query,limit:records_per_page}})
                setData(response.data) 
                setRecordCount(response.data.count)            
            }
            catch(error){
                console.log(error)
            }
        }
        else{
            const f = {}
            if(checked.date) {
                f.startDate = startDate
                f.endDate = endDate
            }
            if(checked.number) {
                f.minNumber = minNumber
                f.maxNumber = maxNumber
            }
            if(checked.length){
                f.minLength = minLength
                f.maxLength = maxLength
            }
            if(checked.language){
                f.language = language
            }
            if(checked.correction){
                f.correction = correction         
            }
            if(checked.comment){
                f.comment = comment
            }
            if(checked.words){
                if (words!=""){
                    const regex = /"[^"]*"|[^",;\s]+/g;
                    const result = words.match(regex)
                    f.words = result.map(x=>x[0]==='"'?x.slice(1,x.length-1):x)
                }
            }
            setFilter(f)
       
            try {
                const response = await axios.post(server+'database-filter',{params:{page:0,filter:f,limit:records_per_page}})
                setData(response.data) 
                setRecordCount(response.data.count)            
            }
            catch(error){
                console.log(error)
            }       
        }
        
    }

    async function previous_page(){
        
        if(page!==0){
            
            
            try {
               
                if (checked.query){
                    const response = await axios.post(server+"database-query",{params:{page:page-1,query:query,limit:records_per_page}})
                    setData(response.data)   
                }
                else{
                    const response = await axios.post(server+"database-filter",{params:{page:page-1,filter:filter,limit:records_per_page}})
                    setData(response.data)   
                }
                
                          
            }
            catch(error){
                console.log(error)
            }
            setPage(page-1)
        }
    }
    async function next_page(){
        
        if(recordCount>records_per_page*(page+1)){
            try {
              
                if (checked.query){
                    const response = await axios.post(server+"database-query",{params:{page:page+1,query:query,limit:records_per_page}})
                    setData(response.data)  
                }
                else{
                    const response = await axios.post(server+"database-filter",{params:{page:page+1,filter:filter,limit:records_per_page}})
                    setData(response.data)  
                }
                
                           
            }
            catch(error){
                console.log(error)
            }
        
            setPage(page+1)
        }
    }

    function handleCheckbox(e){
        let ch = checked   
        if(e.target.id == 'query' && ch['query']==false){
            const entries = Object.keys(ch).map((key)=>[key, false])
            ch = Object.fromEntries(entries)
            ch['query'] = true

            const boxes  = document.getElementsByClassName('checkbox')
            for (let box of boxes){
                box.checked = false
            }
            
        }
        else if (e.target.id != 'query' && ch['query']==true ){
            ch['query'] = false
            ch[e.target.id] = e.target.checked   
            document.getElementById('query').checked = false  
        }
        else{
            ch[e.target.id] = e.target.checked
        
        }

        setChecked(ch)

        
        
        
    
    }
    async function extract_to_json(){
        try {
              
            const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
                //tutaj map!!!!! tak żeby nie było id
                JSON.stringify(data.data)
              )}`;
            
            const link = document.createElement("a");
            link.href = jsonString;
            link.download = "data.json";

            link.click();
            
                       
        }
        catch(error){
            console.log(error)
        }
        }

    async function extract_to_csv(){

        try {
              
            let response=""
            if (checked.query){
                response = await axios.post(server+"extract-csv",{params:{page:page+1,query:query,limit:records_per_page}})
                  
            }
            else{
                response = await axios.post(server+"extract-csv",{params:{page:page+1,filter:filter,limit:records_per_page}})
                 
            }
            const file = new Blob([response.data.data], {type: 'text/plain'});
            const link = document.createElement("a");
            link.href = URL.createObjectURL(file)
            link.download = "data.csv";
       
            link.click();


           
            
                       
        }
        catch(error){
            console.log(error)
        }

    }
    function display_records(){
        if(data.data){    
        
            return(
                <div>
                    {data.data.map((x)=><RecordTile key={x._id.$oid} date={x.date.$date} number={x.references.length}
                    length={x.references[0].text.length} language={x.references[0].results.language[0][0]} 
                    hasCorrection={x.correction!=""?'true':'false'} hasComment={x.opinion!=""?'true':'false'}/>)}              
                </div>
            )}
    }
    return(
        <div>
            <div className='search-bar'>
                
                <div className='filter-option'>
                    <input type='checkbox' id='date' onChange={handleCheckbox} className='checkbox'></input><b>Date: </b>
                    <div className='filter-inputs'>
                        <span>from:</span>
                        <input type='date' id="from-date" value={startDate} onChange={(e)=>{setStartDate(e.target.value)}}></input>
                        <br/>
                        <span>to:</span>
                        <input type='date' id="to-date" value={endDate} onChange={(e)=>{setEndDate(e.target.value)}}></input>
                        
                    </div>
                </div>

                <div className='filter-option'>
                    <input type='checkbox' id='number' onChange={handleCheckbox} className='checkbox'></input><b>Num/record: </b>
                    <div className='filter-inputs'>
                        <span>from:</span>
                        <input type='number' id="min-number" style={{width: '6vw'}} min={1}
                        value={minNumber} onChange={(e)=>{setMinNumber(e.target.value)}}></input>
                        <br/>
                        <span>to:</span>
                        <input type='number' id="max-number" style={{width: '6vw'}} min={1}
                        value={maxNumber} onChange={(e)=>{setMaxNumber(e.target.value)}}></input>
                        
                    </div>
                </div>

                <div className='filter-option'>
                    <input type='checkbox' id='length' onChange={handleCheckbox} className='checkbox'></input><b>Length: </b>
                    <div className='filter-inputs'>
                        <span>from:</span>
                        <input type='number' id="min-length" style={{width: '6vw'}} min={1}
                        value={minLength} onChange={(e)=>{setMinLength(e.target.value)}}></input>
                        <br/>
                        <span>to:</span>
                        <input type='number' id="max-length" style={{width: '6vw'}} min={1}
                        value={maxLength} onChange={(e)=>{setMaxLength(e.target.value)}}></input>
                        
                    </div>
                </div>

                <div className='filter-option'>
                    <input type='checkbox' id='language' onChange={handleCheckbox} className='checkbox'></input><b>Language: </b>
                    <div className='filter-inputs'>
                        <br/>
                        <select id="select-language" onChange={(e)=>setLanguage(e.target.value)}>
                            {labels.language.map((x)=>
                                <option key={x} value={x}>
                                    {x}
                                </option>
                    )}
                        </select>                       
                    </div>
                </div>

                <div className='filter-option'>
                    <input type='checkbox' id='correction' onChange={handleCheckbox}  className='checkbox'></input><b>Correction: </b>
                    <div className='filter-inputs'>                        
                        <span>has correnction</span> 
                        <input type='radio' id="correction-provided" name="correction" 
                        onChange={(e)=>setCorrection(1)}></input>   
                        <br/>
                        <span>no correnction</span> 
                        <input type='radio' id="correction-not-provided" name="correction"
                        onChange={(e)=>setCorrection(0)}></input>                                                                  
                    </div>
                </div>

                <div className='filter-option'>
                    <input type='checkbox' id='comment' onChange={handleCheckbox} className='checkbox'></input><b>Comment: </b>
                    <div className='filter-inputs'>
                        <span>has comment</span> 
                        <input type='radio' id="comment-provided" name="comment" onChange={(e)=>setComment(1)}></input>   
                        <br/>
                        <span>no comment</span> 
                        <input type='radio' id="comment-not-provided" name="comment" onChange={(e)=>setComment(0)} ></input>                                                        
                    </div>
                </div>

                <div className='filter-option'>
                    <input type='checkbox' id='words'onChange={handleCheckbox} className='checkbox'></input><b>Key Words: </b>
                    <div className='filter-inputs'>
                        <br/>
                        <input type='text' style={{ maxWidth:'12vw'}} onChange={(e)=>setWords(e.target.value)}/>
                        
                    </div>
                </div>
                <div className='clearfix'></div>
                <div className='custom-query'>
                    <input type='checkbox' id='query' onChange={handleCheckbox}   style={{float:'left'}}></input><b style={{float:'left'}}>Query: </b>
                    <textarea value={query} onChange={(e)=>setQuery(e.target.value)}></textarea>
                    

                </div>
                <div className='clearfix'></div>
                <div style={{marginLeft:'30vw', height:'8vh'}}>
                    <button className='page-button' onClick={previous_page}>Previous page</button>     
                    <button className='page-button' onClick={next_page}>Next page</button>     
                    <button className='search-button' onClick={search}>Search</button>      
                              
                </div>

                <div className='clearfix'></div>
                
                <div className='show-count'>
                    matching records: {data&&data.count}
                </div>
             </div>
             <div className='content'>
                {data&&display_records()}
                <div className='clearfix'></div>
                <div className='extract-panel'>
                <button className='extract-button' onClick={extract_to_json}>Extract to json</button> 
                <button className='extract-button' onClick={extract_to_csv}>Extract to csv</button> 
                
                </div>
             </div>
             
        </div>
    )
}