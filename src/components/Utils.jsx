import { useState, useEffect } from 'react'
import { db } from '../firebase.config.js'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { collection, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore'

const Alert = withReactContent(Swal)

const fireToast = (message, timer, showProg) => {
  Alert.fire({
    title: message,
    toast: true,
    timer: timer !== null ? timer : 1500,
    timerProgressBar: showProg !== false,
    position: 'top-end',
    animation: false,
    showConfirmButton: false,
  })
}

const Panel = () => {
  const [questions, setQuestions] = useState([])
  const [responses, setResponses] = useState([])
  const [editedQuestion, setEditedQuestion] = useState({})
  const [detections, setDetections] = useState({})
  const [detectionSummary, setDetectionSummary] = useState(null)
  const [qData, setqData] = useState({
    // used for new question creation
    id: '',
    question: '',
    type: '',
  })

  // Fetch questions
  const fetchQuestions = async () => {
    const querySnapshot = await getDocs(collection(db, 'questions'))
    const questionList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    setQuestions(questionList)
  }
  // Fetch responses
  const fetchResponses = async () => {
    const querySnapshot = await getDocs(collection(db, 'responses'))
    const responseList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    setResponses(responseList)
  }

  fetchQuestions()
  fetchResponses()

  // Handle save question edits
  const saveQuestion = async (id) => {
    try {
      const questionRef = doc(db, 'questions', id)
      await updateDoc(questionRef, editedQuestion)
      fireToast('Question updated successfully!')
      setEditedQuestion({})
    } catch (error) {
      fireToast('Error updating question: ' + error)
    }
  }

  // save all responses as JSON
  const downloadResponses = () => {
    const json = JSON.stringify({ responses }, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'responses.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // save non-detected responses as JSON
  const downloadNormalResponses = () => {
    let normalResponses = {}
    let responseArray = Array.from(responses)
    for (let i = 0; i < responseArray.length; i++) {
      const response = responseArray[i]
      console.log(response)
    }

    const json = JSON.stringify({ normalResponses }, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'responses_normal.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // save questions as JSON
  const downloadQuestions = () => {
    const json = JSON.stringify({ questions }, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'questions.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const createNewQuestion = async () => {
    const questionCount = questions.length
    let newId = `0${questionCount + 1}`
    setqData((prev) => ({ ...prev, id: newId }))

    const { value: formData, isConfirmed } = await Alert.fire({
      title: 'Create a new question',
      html: `
        <label for="question">Question</label>
        <input id="question" class="swal2-input" placeholder="Enter your question">
        
        <label for="type">Question Type</label>
        <select id="type" class="swal2-input">
          <option value="1">Likert Scale</option>
          <option value="2">True/False</option>
          <option value="3">Open Ended</option>
        </select>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const question = document.getElementById('question').value
        const type = document.getElementById('type').value

        if (!question || !type) {
          Alert.showValidationMessage('Please fill in both fields')
          return null
        }

        return { question, type }
      },
    })

    if (isConfirmed && formData) {
      try {
        const questionRef = doc(db, 'questions', newId)
        await setDoc(questionRef, {
          id: newId,
          question: formData.question,
          type: formData.type,
        })

        fireToast('Question added successfully', 1000, true)
      } catch (error) {
        Alert.fire({
          icon: 'error',
          title: 'Error adding question',
          text: error.message,
        })
      }
      fetchQuestions()
    }
  }
  const detectIrregularResponses = () => {
    setDetections({})
    setDetectionSummary(null)
    const responseArray = Array.from(responses)
    const numQuestions = Array.from(questions).length
    let newDetections = { ...detections }
    let summaryJSX = []
    responseArray.forEach((item) => {
      const keys = Object.keys(item)
      const responseKeys = keys.filter((key) => key !== 'id')
      if (responseKeys.length !== numQuestions) {
        console.error(
          `incorrect number of response keys detected in response id ${item.id}`
        )
        newDetections[item.id] = {
          errorType: 'INCORRECT_RESPONSE_COUNT',
        }
        summaryJSX.push(
          <div
            className="flex flex-col border border-solid border-ctp-surface2 rounded-lg p-2 my-2"
            key={item.id}
          >
            <span>
              <strong>ID:</strong> {item.id}
            </span>
            <span>
              <strong>Type:</strong> ERR_WRONG_RES_COUNT
            </span>
          </div>
        )
      }
    })
    setDetections(newDetections)
    if (summaryJSX.length > 0) {
      setDetectionSummary(<div>{summaryJSX}</div>)
    } else {
      setDetectionSummary(<div>No irregular responses detected.</div>)
    }
  }

  return (
    <div className="flex h-screen bg-ctp-base text-ctp-text">
      <div className="w-1/3 border-r border-ctp-overlay0 overflow-y-scroll p-4">
        <h2 className="text-lg font-bold mb-4">Responses</h2>
        {responses.map((response) => (
          <div
            key={response.id}
            className="collapse collapse-arrow border border-ctp-overlay0 rounded-box mb-2"
          >
            <input type="checkbox" />
            <div className="collapse-title font-medium">
              Response ID: {response.id}
            </div>
            <div className="collapse-content">
              {Object.entries(response)
                .filter(([key]) => key.startsWith('q'))
                .map(([key, value]) => (
                  <p key={key}>
                    <span className="font-bold">{key}:</span> {value}
                  </p>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="w-1/3 border-r border-ctp-overlay0 overflow-y-scroll p-4">
        <h2 className="text-lg font-bold mb-4">Questions</h2>
        {questions.map((question) => (
          <div
            key={question.id}
            className="collapse collapse-arrow border border-ctp-overlay0 rounded-box mb-2"
          >
            <input type="checkbox" />
            <div className="collapse-title font-medium">
              Question ID: {question.id}
            </div>
            <div className="collapse-content space-y-2">
              <p>
                <span className="font-bold">Question Text:</span>{' '}
                <input
                  type="text"
                  value={
                    editedQuestion.id === question.id
                      ? editedQuestion.question
                      : question.question
                  }
                  onChange={(e) =>
                    setEditedQuestion({
                      ...editedQuestion,
                      id: question.id,
                      question: e.target.value,
                    })
                  }
                  className="input input-bordered input-sm w-full bg-ctp-surface0 text-ctp-text"
                />
              </p>
              <p>
                <span className="font-bold">Type:</span>
                <select
                  value={
                    editedQuestion.id === question.id
                      ? editedQuestion.type
                      : question.type
                  }
                  onChange={(e) =>
                    setEditedQuestion({
                      ...editedQuestion,
                      id: question.id,
                      type: parseInt(e.target.value),
                    })
                  }
                  className="select select-bordered select-sm bg-ctp-surface0 text-ctp-text"
                >
                  <option value={1}>Likert Scale</option>
                  <option value={2}>True/False</option>
                  <option value={3}>Open Ended</option>
                </select>
              </p>
              <button
                onClick={() => saveQuestion(question.id)}
                className="btn btn-sm bg-ctp-mauve text-ctp-text hover:bg-ctp-mauve-dark"
              >
                Save
              </button>
            </div>
          </div>
        ))}
        <div className="flex flex-row items-center justify-center w-full h-fit">
          <button onClick={createNewQuestion} className="btn btn-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 5v14M5 12h14"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="w-1/3 overflow-y-scroll p-4">
        <div className="flex flex-col items-center space-y-2">
          <button
            className="w-full h-fit btn"
            onClick={detectIrregularResponses}
          >
            Detect irregular responses
          </button>
          <button
            className="w-full h-fit btn"
            onClick={downloadNormalResponses}
          >
            Download normal responses
          </button>
          <button className="w-full h-fit btn" onClick={downloadResponses}>
            Download all responses
          </button>
          <button className="w-full h-fit btn" onClick={downloadQuestions}>
            Download questions as JSON
          </button>
          {detectionSummary ? (
            <div className="flex flex-col items-center justify-center w-full h-fit">
              <h1 className="text-lg font-bold mt-4">Detections</h1>
              {detectionSummary}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

const checkCode = async (e, setAccess) => {
  e.preventDefault()
  const input = e.target.input.value
  const accessHash =
    'aa706137d0c183ee225b25b3355cd29b2ea893b01c2f7e2a9d455fd4c113a8c3'
  const calculateHash = async (message) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(message)
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }
  const inputHash = await calculateHash(input)
  if (inputHash === accessHash) {
    setAccess(true)
    fireToast('Welcome', null)
  } else {
    fireToast('Access denied: Incorrect code')
  }
}

function Utils() {
  const [accessGranted, setAccess] = useState(false)
  return (
    <>
      {accessGranted ? (
        <Panel />
      ) : (
        <div className="flex flex-col items-center justify-center">
          <form onSubmit={(e) => checkCode(e, setAccess)}>
            <input
              type="password"
              name="input"
              autoComplete="off"
              className="input mr-2"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-ctp-surface0 text-ctp-text btn"
            >
              Check
            </button>
          </form>
        </div>
      )}
    </>
  )
}

export default Utils
