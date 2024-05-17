import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import '../css/history.css'
import Topbar from '../components/Topbar';
import Results from '../components/Results';

export default function Details(){
    const location = useLocation();
    const navigate  = useNavigate();
    const key = new URLSearchParams(location.search).get('key');
    const record =JSON.parse(localStorage.getItem(key));

    function deleteRecord(){
        localStorage.removeItem(key);
        navigate('/history')
    };
    function giveFeedback(){
        navigate(`/feedback?keys=${encodeURIComponent([key])}`)
    };

    return(
        <div className="App">
            <Topbar/>
            <div className='menu'>
                <button className="menu-button" onClick={deleteRecord}>usuń zapis</button>
                <button className="menu-button" onClick={giveFeedback}>prześlij opinię</button>
                
            </div>
            <div className='clearfix'></div>

            <div className='content'>
                <div className='text'>
                    <p>{record.t}</p>
                </div>
                <Results data={record.r}/>
                <div className='clearfix'></div>
            </div>
        </div>
    );
}
