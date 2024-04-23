export default function RecordTile(props){
    
    const date = new Date(props.date).toLocaleDateString()
    
    const one=()=>{
        return(       
        <div>
            <div className="record-tile-field">
                <p>submited: {date}</p>
            </div>
            <div className="record-tile-field">
                <p>length:{props.length}</p>
            </div>
            <div className="record-tile-field">
                <p>language: {props.language} </p>
            </div>
            <div className="record-tile-field" >
                <p>correction: {props.hasCorrection}</p>
            </div>
            <div className="record-tile-field">
                <p>comment: {props.hasComment}</p>
            </div>
        </div>
        )
    }
    const more = ()=>{
        return(
            
        <div>
            <div className="record-tile-field">
                <p>submited: {date}</p>
            </div>
            <div className="record-tile-field">
                <p>number:{props.number}</p>
            </div>
            <div className="record-tile-field">
                <p>comment: {props.hasComment} </p>
            </div>
           
        </div>
        )
    }
    return(
        <div className="record-tile">
            
            {props.number==1?one():more()}
            <div className="clearfix"></div>
        </div>)
}