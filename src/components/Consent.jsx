import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Parents from './Parents'
function Consent({ onConsent }) {
  const [isMinor, setIsMinor] = useState(false)
  const [showOtherStuff, setShowOtherStuff] = useState(false)
  const [textCorrect, setTextCorrect] = useState(false)

  const checkTextCorrect = (e) => {
    let text = e.target.value
    if (text === 'I consent to all of the above') {
      setTextCorrect(true)
    } else {
      setTextCorrect(false)
    }
  }
  return (
    <div className="flex flex-col items-center overflow-y-scroll overflow-x-hidden mt-4 w-full text-xl rounded-lg h-fit">
      <label>
        Are you a minor? Y
        <input
          type="radio"
          name="minor-radio"
          onInput={() => {
            setIsMinor(true)
            setShowOtherStuff(false)
          }}
        ></input>
        {'  '}N
        <input
          type="radio"
          name="minor-radio"
          onInput={() => {
            setIsMinor(false)
            setShowOtherStuff(true)
          }}
        ></input>
      </label>
      {isMinor ? (
       <Parents onConsent={onConsent}/>
      ) : null}
      {showOtherStuff ? (
        <>
          <h1 className="text-lg font-bold inter-heavy text-ctp-text">
            Please read the following statement in its entirety.
          </h1>
          <div className="flex flex-col px-2 py-1 w-fit h-fit">
            <ul className="space-y-4 p-4 bg-ctp-surface rounded-lg shadow-md">
              <li className="text-lg text-ctp-text leading-relaxed">
                <strong>I agree</strong> to participate in this survey regarding
                the use of artificial intelligence (AI) algorithms in modern
                surveillance systems.
              </li>
              <li className="text-lg text-ctp-text leading-relaxed">
                <strong>I understand</strong> that I will be asked for my
                general age range, and I agree to provide a truthful value.
                <span className="block text-sm text-ctp-subtext">
                  (This metric is the only piece of personal information that
                  will be collected, and you will not be singled out based on
                  it.)
                </span>
              </li>
              <li className="text-lg text-ctp-text leading-relaxed">
                <strong>I agree</strong> to provide answers that accurately
                reflect my opinions and perceptions.
              </li>
              <li className="text-lg text-ctp-text leading-relaxed">
                <strong>I confirm</strong> that all answers submitted are my own
                and that I have not collaborated with others in the answering of
                questions asked.
              </li>
              <li className="text-lg text-ctp-text leading-relaxed">
                <strong>I understand and consent</strong> to the fact that any
                of my responses can and will be used in a research paper.
              </li>
              <li className="text-lg text-ctp-text font-semibold leading-relaxed">
                Please type the phrase:{' '}
                <span className="text-ctp-primary">
                  "I consent to all of the above"
                </span>
              </li>
              <li>
                <input
                  onInput={checkTextCorrect}
                  type="text"
                  className="w-full input input-bordered p-2 rounded-md"
                />
              </li>
              {textCorrect ? (
                <>
                  <h1 className="text-lg font-semibold text-ctp-text inter-heavy mt-4">
                    Please note that answers are not stored between sessions.
                    Try to finish in one sitting, but if you must divide your
                    time, leave the tab open.
                  </h1>
                  <div className="flex flex-col items-center my-4">
                    <button
                      onClick={onConsent}
                      className="inter btn btn-md bg-ctp-primary text-ctp-text px-6 py-2 rounded-lg shadow-md"
                    >
                      Begin
                    </button>
                  </div>
                </>
              ) : null}
            </ul>
          </div>
        </>
      ) : null}
    </div>
  )
}
export default Consent
