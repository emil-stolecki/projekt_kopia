
import { useNavigate } from 'react-router-dom';
export default function Topbar(props){

    //przyciski umożliwiające nawigacje między stronami
    const navigate = useNavigate();

    return(
        <div className='topbar'>
                <button className="topbar-button" onClick={()=>navigate("/home")} disabled={props.disabled} >Home</button>
                <button className="topbar-button" onClick={()=>navigate('/feedback')} disabled={props.disabled} >Feedback</button>
                <button className="topbar-button" onClick={()=>navigate('/history')} disabled={props.disabled} >History</button>
                <button className="topbar-button" onClick={()=>navigate('/info')} disabled={props.disabled} >Info</button>
                <div className='clearfix'></div>
        </div>
    )
}