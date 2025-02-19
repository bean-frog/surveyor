import {useState} from 'react'
function Parents({onConsent}) {
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
    <div className="flex flex-col items-center m-4 w-full text-xl rounded-lg border border-solid h-fit border-ctp-surface2">
      <h1 className="text-lg font-bold inter-heavy text-ctp-text">
        Please show this to your parent or legal guardian.
      </h1>
    
          <div className="flex flex-col px-2 py-1 w-fit h-fit">
            <ul className="space-y-4 p-4 bg-ctp-surface rounded-lg shadow-md">
              <li className="text-lg text-ctp-text leading-relaxed">
                <strong>I agree</strong> to let my child participate in this survey regarding
                the use of artificial intelligence (AI) algorithms in modern
                surveillance systems.
              </li>
              <li className="text-lg text-ctp-text leading-relaxed">
                <strong>I understand</strong> that my child will be asked for my
                general age range, and I agree that they will provide a truthful value.
                <span className="block text-sm text-ctp-subtext">
                  (This metric is the only piece of personal information that
                  will be collected, and your child will not be singled out based on
                  it.)
                </span>
              </li>
              <li className="text-lg text-ctp-text leading-relaxed">
                <strong>I agree</strong> that my child will provide answers that accurately
                reflect my opinions and perceptions.
              </li>
              <li className="text-lg text-ctp-text leading-relaxed">
                <strong>I confirm</strong> that all answers submitted are my child's own
                and that they have not collaborated with others in the answering of
                questions asked.
              </li>
              <li className="text-lg text-ctp-text leading-relaxed">
                <strong>I understand and consent</strong> to the fact that any
                of my child's responses can and will be used in a research paper.
              </li>
              <li className="text-lg text-ctp-text leading-relaxed">
                <strong>I certify</strong> that I am the legal guardian of the minor about to take this survey.
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
                    Thank you! Your child may now begin the survey.
                  </h1>
                  <h1 className="text-lg text-ctp-text inter-regular mt-4">
                    Keep in mind that responses are not stored between sessions, so try to complete the survey. If you must divide your time, leave the tab open.
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
        
    </div>
  )
}
export default Parents
