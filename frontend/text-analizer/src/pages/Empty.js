import {
    useNavigate
  } from "react-router-dom";
  import React, { useEffect } from 'react';
  export default function Empty() {

    const navigate = useNavigate();
    
    useEffect(() => {
        navigate("/home")
      }, []); 

    return(<div>
       Something went wrong
    </div>)

  }