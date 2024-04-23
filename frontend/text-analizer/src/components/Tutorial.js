import { wait } from '@testing-library/user-event/dist/utils';
import React, { useState, useEffect } from 'react';
import { useLocation,useNavigate } from "react-router-dom";

export default function Tutorial(props){

    //sprawdzi czy wartość w local storage pod kluczem 'tutorial' jest liczbą symbolizującą postęp w tutorialu
    const initialStep = ()=>{
        
        const s = localStorage.getItem('tutorial')  
        if (!/\d*/g.test(s)){         
            //jeśli nie liczba, to ustaw 0, tutorial przejdzie od początku
            localStorage.setItem('tutorial',0)
            return 0
        }
        else{
            //jeśli liczba, tutorial jest w trakcie, kontunuuj od poprzedniego kroku
            if (parseInt(s)>0 && parseInt(s)<maxStep){
            	return parseInt(s)
            	//console.log(localStorage.getItem('tutorial'))
            }
            else {
            return 0
            }
            
        }
    }
    const maxStep = 15
    const [step,setStep] = useState(initialStep)

    const [text1,setText1] = useState('')
    const [text2,setText2] = useState('')
    
    const location = useLocation()
    const navigate = useNavigate()
    const style =[
        {
	   
        },
        {
            'width': '40vw', 
            'height': '20vh', 
            'top': '30vh',
            'left': '10vw',
            
        },
        {
            'width': '60vw', 
            'height': '30vh', 
            'top': '30vh',
            'left': '10vw'
        },
        {
            'width': '40vw', 
            'height': '20vh', 
            'top': '8vh',
            'left': '1vw'
        },
        {           
        },
        {
            'width': '60vw', 
            'height': '20vh', 
            'top': '50vh',
            'left': '20vw',
        },
        {
            'width': '60vw', 
            'height': '20vh', 
            'top': '20vh',
            'left': '20vw',
        },
        {
            'width': '60vw', 
            'height': '30vh', 
            'top': '18vh',
            'left': '35vw',
        },
        {},
        {
            'width': '50vw', 
            'height': '30vh', 
            'top': '40vh',
            'left': '25vw',
        },
        {
            'width': '50vw', 
            'height': '30vh', 
            'top': '20vh',
            'left': '2vw',
        },
        {
            'width': '50vw', 
            'height': '20vh', 
            'top': '20vh',
            'left': '2vw',
        },
        {
            'width': '50vw', 
            'height': '25vh', 
            'top': '20vh',
            'left': '2vw',
        },
        {
            'width': '50vw', 
            'height': '25vh', 
            'top': '20vh',
            'left': '15vw',
        },
        {
            'width': '50vw', 
            'height': '25vh', 
            'top': '20vh',
            'left': '25vw',
        }

    ]
    
    function stopTutorial(){
        props.onFinish()
        localStorage.setItem('tutorial','ok')
        
    }
    function nextStep(){
        localStorage.setItem('tutorial',step+1)
        setStep(step+1)        
        
    }
    function prevStep(){
        localStorage.setItem('tutorial',step-1)
        setStep(step-1)
    }

    function checkPage(url){
        if(location.pathname!=url){
    	    navigate(url)
        }
    }

    const welcome = ()=>{
        checkPage('/home')
        setText1('Czy czy chcesz tutorial?')
        setText2('')
        const a =document.getElementById('a')
        a.textContent='Nie'
        const c =document.getElementById('c')
        c.textContent='Tak'
        const b =document.getElementById('b')
        b.style.visibility='hidden'
        
    }
    const step1 =()=>{
        checkPage('/home')
        props.other.input('to jest testowy tekst...')
        setText1('Tekst do analizy należy wpisać w żółtym polu.')
        setText2('Następnie wcisnąć przycisk "Wyślij" poniżej.')
        const a =document.getElementById('a')
        a.textContent='Zamknij'
        const c =document.getElementById('c')
        c.textContent='Dalej'
        const b =document.getElementById('b')
        b.style.visibility='visible'
        
    }
    const step2 =()=>{
        checkPage('/home')
        setText1('Wyniki wyświetlą się w panelu po prawej stronie. ')
        setText2('Zostanie określony język wypowiedzi, ogólny sentyment, i prawdopodobieństwo, '+ 
                'że wypowiedź może być odebrana jako toksyczna. '+ 
                'Analiza emocji jest wspierana tylko dla języka angielskiego')
                
        const exampleResults ={
            'language': [[ "polish", 0.9999836683273315 ]],
            'sentiment': [[ "neutral", 0.9905040860176086 ], [ "negative", 0.00477341003715992 ], [ "positive", 0.00472244992852211 ]],
            'toxic': 4.4761070405741066e-9,
            'emotions': null
        }
        if(props.other.response) props.other.response(exampleResults)
        
        
    }

    const step3=()=>{
        checkPage('/home')
        setText1('Wyniki analiz możesz znaleźć w zakładce history')
        setText2('')
    }
    const step4=()=>{
    	if (location.pathname!="/history"){
    	    navigate("/history")
    	    localStorage.setItem('tutorial',5)
    	}
    	else {
    	   navigate("/home")
    	   localStorage.setItem('tutorial',3)
    	}
    
    }

    const step5=()=>{
     
     checkPage('/history')   
     const a =document.getElementById('a')
     a.textContent='Zamknij'
     const c =document.getElementById('c')
     c.textContent='Dalej'
     const b =document.getElementById('b')
     b.style.visibility='visible'
        
     setText1("Tutaj wyświetlą się poprzednie analizy")
     setText2("Można podejrzeć ich szczegóły, przesłąć opinię i sugestie na ich temat, lub usunąć je z pamięci.")

     const exampleRecord = [['0-00-aa','{"t":"to jest testowy tekst...",'+
     '"r":{"language": [[ "polish", 0.9999836683273315 ]],'+
     '"sentiment": [[ "neutral", 0.9905040860176086 ], [ "negative", 0.00477341003715992 ], [ "positive", 0.00472244992852211 ]],'+
     '"toxic": 4.4761070405741066e-9,"emotions": null},'+
     '"f":0}']]

    if(props.other.updateitems) props.other.updateitems(exampleRecord)
     
    }
    
    const step6 = ()=>{
        checkPage('/history')   
    	setText1("Można przesłać pojedyńczą opinię dotyczącą kilku analiz")
    	setText2("Należy zaznaczyć jedną lub więcej analiz i kliknąć przycisk \"Prześlij Opinię\".")
    }
    
    const step7 = ()=>{
        checkPage('/history')   
    	setText1("Tutaj jest pokazana zajętość pamięci przez przechowywane wyniki analiz")
    	setText2("Maksymalna dostępna pamięć może zależeć od przeglądarki, ale przeważnie jest to około 5Mb, dlatego warto usuwać niepotrzebne zapisy")
        
    }
    
    const step8 =()=>{  
        if (location.pathname!="/feedback"){
    	    navigate("/feedback")
    	    localStorage.setItem('tutorial',9)
    	}
    	else {
    	   navigate("/history")
    	   localStorage.setItem('tutorial',7)
    	}
    }

    const step9=()=>{
        checkPage('/feedback') 
        setText1("Strona Feedback umożliwia przesłanie opini na temat poprawności analizy, jak rółnież korektę, która może być wykorzystana poźniej do poprawienia jakości analiz")
        setText2("")

        const exampleRecords = [['0-00-aa',{"t":"to jest testowy tekst...",
                                             "r":{"language": [[ "polish", 0.9999836683273315 ]],
                                             "sentiment": [[ "neutral", 0.9905040860176086 ], [ "negative", 0.00477341003715992 ], [ "positive", 0.00472244992852211 ]],
                                            "toxic":  4.063162251100039e-9,"emotions": null},
                                            "f":0}],
                                ['1-11-bb', {"t":"inny przykładowy tekst", "r":{"language": [[ "polish", 0.9999836683273315 ]],
                                "sentiment": [[ "neutral", 0.9887117147445679  ], [ "negative", 0.001909988233819604 ], [ "positive", 0.009378335438668728  ]],
                               "toxic": 4.4761070405741066e-9,"emotions": null},"f":0
                                }]

                                ]

        if(props.other.itemsToAdd) props.other.itemsToAdd(exampleRecords)
        if(props.other.addedItems) props.other.addedItems([])   

    }

    const step10=()=>{
        checkPage('/feedback')   
        setText1("Wyżej jest lista zapisanych analiz")
        setText2("Po kliknięciu, pozycja przenosi się do listy poniżej, reprezentującej analizy, których będzie dotyczyć opinia.")
       
        const exampleRecords = [['0-00-aa',{"t":"to jest testowy tekst...",
                                             "r":{"language": [[ "polish", 0.9999836683273315 ]],
                                             "sentiment": [[ "neutral", 0.9905040860176086 ], [ "negative", 0.00477341003715992 ], [ "positive", 0.00472244992852211 ]],
                                            "toxic":  4.063162251100039e-9,"emotions": null},
                                            "f":0}],
                                ['1-11-bb', {"t":"inny przykładowy tekst", "r":{"language": [[ "polish", 0.9999836683273315 ]],
                                "sentiment": [[ "neutral", 0.9887117147445679  ], [ "negative", 0.001909988233819604 ], [ "positive", 0.009378335438668728  ]],
                               "toxic": 4.4761070405741066e-9,"emotions": null},"f":0
                                }]

                                ]

        if(props.other.itemsToAdd) props.other.itemsToAdd(exampleRecords)

        if(props.other.addedItems) props.other.addedItems([])          
    }

    const step11=()=>{
        checkPage('/feedback')   
        setText1("Kiedy opinia dotyczy tylko jednej analizy, możliwe jest poprawienie wyników w panelu po prawej stronie. Żeby korekta została wysłana, należy zaznaczyć checkbox.")
        setText2("")

        const exampleRecord1= [['0-00-aa',{"t":"to jest testowy tekst...",
                                             "r":{"language": [[ "polish", 0.9999836683273315 ]],
                                             "sentiment": [[ "neutral", 0.9905040860176086 ], [ "negative", 0.00477341003715992 ], [ "positive", 0.00472244992852211 ]],
                                            "toxic":  4.063162251100039e-9,"emotions": null},
                                            "f":0}]                             
                             ]
        const exampleRecord2 = [['1-11-bb', {"t":"inny przykładowy tekst", "r":{"language": [[ "polish", 0.9999836683273315 ]],
                   "sentiment": [[ "neutral", 0.9887117147445679  ], [ "negative", 0.001909988233819604 ], [ "positive", 0.009378335438668728  ]],
                  "toxic": 4.4761070405741066e-9,"emotions": null},"f":0
                   }]]

        if(props.other.itemsToAdd) props.other.itemsToAdd(exampleRecord1)
        if(props.other.addedItems) props.other.addedItems(exampleRecord2) 
    }

    const step12=()=>{
        checkPage('/feedback')   
        setText1("Do jednej opini można załączyć więcej niż jedną analizę.")
        setText2("Nie jest wtedy możliwa korekta wyników. Można za to poprawić wyniki dla każdej analizy w nowych, osobnych opiniach.")
    
        const exampleRecords = [['0-00-aa',{"t":"to jest testowy tekst...",
                                             "r":{"language": [[ "polish", 0.9999836683273315 ]],
                                             "sentiment": [[ "neutral", 0.9905040860176086 ], [ "negative", 0.00477341003715992 ], [ "positive", 0.00472244992852211 ]],
                                            "toxic":  4.063162251100039e-9,"emotions": null},
                                            "f":0}],
                                ['1-11-bb', {"t":"inny przykładowy tekst", "r":{"language": [[ "polish", 0.9999836683273315 ]],
                                "sentiment": [[ "neutral", 0.9887117147445679  ], [ "negative", 0.001909988233819604 ], [ "positive", 0.009378335438668728  ]],
                               "toxic": 4.4761070405741066e-9,"emotions": null},"f":0
                                }]

                                ]
        if(props.other.itemsToAdd) props.other.itemsToAdd([])
        if(props.other.addedItems) props.other.addedItems(exampleRecords)   
    
    }

    const step13=()=>{
        checkPage('/feedback')   
        setText1("Analizy, które zostały poprawione, będą wyświetlać się na szaro.")
        setText2("")
        const a =document.getElementById('a')
        a.textContent='Zamknij'
        const c =document.getElementById('c')
        c.disabled=false
        const exampleRecords = [['0-00-aa',{"t":"to jest testowy tekst...",
                                             "r":{"language": [[ "polish", 0.9999836683273315 ]],
                                             "sentiment": [[ "neutral", 0.9905040860176086 ], [ "negative", 0.00477341003715992 ], [ "positive", 0.00472244992852211 ]],
                                            "toxic":  4.063162251100039e-9,"emotions": null},
                                            "f":1}],
                                ['1-11-bb', {"t":"inny przykładowy tekst", "r":{"language": [[ "polish", 0.9999836683273315 ]],
                                "sentiment": [[ "neutral", 0.9887117147445679  ], [ "negative", 0.001909988233819604 ], [ "positive", 0.009378335438668728  ]],
                               "toxic": 4.4761070405741066e-9,"emotions": null},"f":0
                                }]

                                ]

        if(props.other.itemsToAdd) props.other.itemsToAdd(exampleRecords)

        if(props.other.addedItems) props.other.addedItems([])        
    }

    const step14=()=>{
        checkPage('/feedback')   
        setText1("Inne przydatne informacje znajdziesz w zakładce Info")
        setText2("")

        const a =document.getElementById('a')
        a.textContent='Zakończ'
        const c =document.getElementById('c')
        c.disabled=true
        const b =document.getElementById('b')
        

    }
    const tutorialSteps=[
        welcome,step1,step2,step3,step4,step5,step6,step7,step9,step10,step11,step12,step13,step14
    ]


    

    //kiedy zmienna step się zmieni, wyświetli odpowiedni krok tutorialu
    useEffect(() => {  
        if(props.shouldRun){
            tutorialSteps[step]()

        }
    },[step]);

    return(
        <div className='tutorial' id='tutorial' style={style[step]}>
               <p>{text1}</p>
               <p>{text2}</p>
               <button id={'a'} onClick={stopTutorial}>Zamknij</button>
               <button id={'b'} onClick={prevStep}>Wstecz</button>
               <button id={'c'} onClick={nextStep}>Dalej</button>
                <div className='clearfix'></div>

        </div>
    )
}
