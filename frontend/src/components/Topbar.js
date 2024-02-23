
import { useNavigate } from 'react-router-dom';
export default function Topbar(){

    //przyciski umożliwiające nawigacje między stronami
    const navigate = useNavigate();

    return(
        <div className='topbar'>
                <button className="topbar-button" onClick={()=>navigate("/home")}>Home</button>
                <button className="topbar-button" onClick={()=>navigate('/feedback')}>Feedback</button>
                <button className="topbar-button" onClick={()=>navigate('/history')}>History</button>
                <button className="topbar-button" onClick={()=>navigate('/info')}>Info</button>
                <div className='clearfix'></div>
        </div>
    )
}