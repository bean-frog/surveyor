import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import Consent from './components/Consent'
import Mission from './components/Mission'
import Parents from './components/Parents'
import Survey from './components/Survey'
import Utils from './components/Utils'
import Debrief from './components/Debrief'
import LowTaperFade from './components/LowTaperFade'

function Home() {
  const navigate = useNavigate()
  const [consentGiven, setConsentGiven] = useState(false)
  const [surveyComplete, setSurveyComplete] = useState(false)
  return (
    <div className="flex flex-col justify-between items-center mt-auto w-full min-h-screen">
      <div className="flex flex-col flex-grow justify-center items-center w-full">
        <div className="flex flex-col justify-center items-center p-6 pb-2 rounded-lg border-2 border-solid lg:w-3/5 md:w-4/5 sm:w-full h-fit border-ctp-overlay2 mb-6 overflow-y-hidden mb-auto max-h-[90vh] min-h-0">
        {surveyComplete ? (
          <div className="animate-fade-in-1s">
             <Debrief />
          </div>
           
         
) : localStorage.getItem('0x32') === '8afcf5' ? (
  <div className="flex flex-col justify-center items-center">
    <span className="font-bold">
    A response has already be submitted on this device.
  </span>
  <button onClick={() => {localStorage.setItem("0x32", null); navigate("/")}} className='underline text-md text-ctp-text inter-regular'>I am a different person who has not submitted a response</button>

    <div className="flex flex-row">
      <Link to='/debrief' className='underline text-md text-ctp-text inter-regular'>View Debrief</Link>
    </div>

  </div>
  
) : consentGiven ? (
  <Survey onCompleted={() => { setSurveyComplete(true); localStorage.setItem('0x32', '8afcf5'); }} />
) : (
  <>
    <h1 className="text-3xl font-bold inter-heavy text-ctp-text">
      Thank you for participating in this survey.
    </h1>
    <Consent onConsent={() => { setConsentGiven(true); }} />
  </>
)}

        </div>
      </div>
      <footer className="flex flex-row justify-center items-center py-4 mt-4 mb-4 space-x-2 w-screen h-full bg-ctp-surface0">
        <a
          href="https://github.com/bean-frog/surveyor"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-md text-ctp-text inter-regular"
        >
          Source code
        </a>
        <Link
          to="/mission"
          className="underline text-md text-ctp-text inter-regular"
        >
          Mission statement
        </Link>
      </footer>
    </div>
  )
}
function Problem() {
  return <h1>A problem is being fixed. Please come back later and try again</h1>
}
function App() {
  return (
    <LowTaperFade>
      <div className="flex overflow-x-hidden overflow-y-hidden justify-center items-center pt-4 mt-auto w-screen h-screen bg-ctp-base">
        <Router>
          <Routes>
            <Route path="/" element={<Problem />} />
            <Route path="/for-parents" element={<Parents />} />
            <Route path="/mission" element={<Mission />} />
            <Route path="/survey" element={<Survey />} />
            <Route path="/debrief" element={<Debrief />}/>
            <Route path="/utils" element={<Utils />} />
          </Routes>
        </Router>
      </div>
    </LowTaperFade>
  )
}

export default App
