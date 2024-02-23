export default function Bar(props){

    //wizualizacja wyników w postaci paska

    //całkowita długość paska
    const width=15

    return(
        <div className="bar" style={{width: width+'vw'}}>
            <div style={{backgroundColor:'gold', width: props.width*width+'vw', height:'inherit', borderRadius:'10px'}}></div>
            <div className='clearfix'></div>
        </div>
    )
}