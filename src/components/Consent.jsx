import React, { useState } from 'react';
import { Link } from 'react-router-dom'

function Consent() {
    const [isMinor, setIsMinor] = useState(false)
    const [showOtherStuff, setShowOtherStuff] = useState(false)
    return (
        <div className="mt-4 flex flex-col items-center h-fit w-full margin-4 rounded-lg border border-solid border-ctp-surface2">
            <h1 className='text-xl font-bold inter-heavy text-ctp-text'>Before you begin, please complete this consent form.</h1>
            <label>Are you a minor? Y <input type="radio" name="minor-radio" onInput={() => {setIsMinor(true); setShowOtherStuff(false)}}></input> N <input type="radio" name="minor-radio" onInput={() => {setIsMinor(false); setShowOtherStuff(true)}}></input></label>
            {isMinor ? (
                <label>Please direct your parent or legal guardian to <Link to="/for-parents" className="text-ctp-lavender underline" >this</Link> page.</label>
            ) : null}
            {showOtherStuff ? (
                <>
                <h1 className='text-lg font-bold inter-heavy text-ctp-text'>Please read the following statement in its entirety.</h1>
                <div className="flex flex-col w-fit h-fit px-2 py-1">
                    <ul className='list-none'>
                        <li className='text-lg text-ctp-text'>I agree to participate in this survey regarding the use of artificial intelligence (AI) algorithms in modern surveillance systems.</li>
                        <li className='text-lg text-ctp-text'>I understand that I will not be asked to provide any personal information while filling out this survey.</li>
                        <li className='text-lg text-ctp-text'>I agree to provide answers that accurately reflect my opinions and perceptions</li>
                        <li className='text-lg text-ctp-text'>I confirm that all answers submitted are my own, and that I have not collaborated with others in the answering of questions asked.</li>
                        <li className='text-lg text-ctp-text'>Please type the phrase: "I agree to all of the above terms" </li>

                    </ul>
                </div>
                </>
            ) : null}
        </div>
    )
}
export default Consent;