import React, { useState, useEffect } from 'react';

export default function Tutorial(props){
    const [step,setStep] = useState(0)

    const [text1,setText1] = useState('')
    const [text2,setText2] = useState('')
    const maxStep = 2

    const style =[
        {

        },
        {
            'width': '40vw', 
            'height': '20vh', 
            'top': '30vh',
            'left': '10vw'
        },
        {
            'width': '60vw', 
            'height': '30vh', 
            'top': '30vh',
            'left': '10vw'
        },
    ]
    
    function stopTutorial(){
        props.onFinish()
        //localStorage.setItem('tutorial',1)
    }
    function nextStep(){
        localStorage.setItem('tutorial',step+1)
        setStep(step+1)
        
    }
    function prevStep(){
        localStorage.setItem('tutorial',step-1)
        setStep(step-1)
    }

    const welcome = ()=>{
        setText1('Czy czy chcesz tutorial?')
        localStorage.setItem('tutorial',1)
    }
    const step1 =()=>{
        props.other.input('to jest testowy tekst...')
        setText1('Tekst do analizy należy wpisać w żółtym polu.')
        setText2('Następnie wcisnąć przycisk "Wyślij" poniżej.')
        const a =document.getElementById('a')
        a.textContent='zamknij'
        const c =document.getElementById('c')
        c.textContent='dalej'
        const b =document.getElementById('b')
        b.style.visibility='visible'
        localStorage.setItem('tutorial',2)
    }
    const step2 =()=>{
        setText1('Wyniki wyświetlą się w panelu po prawej stronie. ')
        setText2('Zostanie określony język wypowiedzi, ogólny sentyment, i prawdopodobieństwo, '+ 
                'że wypowiedź może być odebrana jako toksyczna. '+ 
                'Analiza emocji jest wspierana tylko dla języka angielskiego')
        localStorage.setItem('tutorial',3)
    }

    const step3=()=>{
        const exampleResults ={
            'language': [[ "polish", 0.9999836683273315 ]],
            'sentiment': [[ "neutral", 0.9905040860176086 ], [ "negative", 0.00477341003715992 ], [ "positive", 0.00472244992852211 ]],
            'toxic': 4.4761070405741066e-9,
            'emotions': null
        }
        props.other.response(exampleResults)
    }
    const tutorialSteps=[
        welcome,step1,step2,step3
    ]


    //uruchomi się tylko przy załadowaniu strony
    //sprawdzi czy wartość w local storage pod kluczem 'tutorial' jest liczbą symbolizującą postęp w tutorialu
    useEffect(()=>{
        document.getElementById('tutorial').style.display = "block"
        console.log('here1')
        if (!/\d*/g.test(localStorage.getItem('tutorial'))){         
            //jeśli nie liczba, to ustaw 0, tutorial przejdzie od początku
            localStorage.setItem('tutorial',0)
        }
        else{
            //jeśli liczba, tutorial jest w trakcie, kontunuuj od poprzedniego kroku
            //setStep(parseInt(localStorage.getItem('tutorial'))) //bo  jest out of bounds
            
        }
    },[])

    //kiedy zmienna step się zmieni, wyświetli odpowiedni krok tutorialu
    useEffect(() => {  
        console.log('here2')   
        console.log(step)
        if(props.shouldRun){
            tutorialSteps[step]()
        }
    },[step]);

    return(
        <div className='tutorial' id='tutorial' style={style[step]}>
               <p>{text1}</p>
               <p>{text2}</p>
               <button id={'a'} onClick={stopTutorial}>nie</button>
               <button id={'b'} onClick={prevStep} style={{visibility :'hidden'}}>wstecz</button>
               <button id={'c'} onClick={nextStep}>tak</button>
                <div className='clearfix'></div>

        </div>
    )
}