import React, { useState, useEffect } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link }
  from "react-router-dom";
import Consent from './components/Consent';
import Mission from './components/Mission';
import Parents from './components/Parents';
import Survey from './components/Survey';
function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen justify-between w-full">
      <div className="flex flex-col items-center justify-center w-full flex-grow">
        <div className='w-2/5 h-fit p-6 pb-2 rounded-lg flex flex-col items-center justify-center border-2 border-solid border-ctp-overlay2'>
          <h1 className='text-3xl font-bold inter-heavy text-ctp-text'>Thank you for participating in this survey.</h1>
          <Consent />
        </div>
      </div>
      <footer className="flex flex-row items-center justify-center space-x-2 mb-4">
        <a href="https://github.com/bean-frog/surveyor" target="_blank" rel="noopener noreferrer" className="text-ctp-lavender inter-regular text-lg underline">
          Source code
        </a>
        <Link to="/mission" className="text-ctp-lavender inter-regular text-lg underline">
          Mission statement
        </Link>
      </footer>
    </div>
  );
}


function App() {
  return (
    <div className='w-screen h-screen bg-ctp-base flex items-center justify-center'>
      <Router>
        <Routes>
          <Route path='/' element={<Home />}/>
          <Route path='/for-parents' element={<Parents />}/>
          <Route path='/mission' element={<Mission />}/>
          <Route path='/survey' element={<Survey />}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;

