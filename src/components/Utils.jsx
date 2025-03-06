import { useState, useEffect } from 'react'
import { db } from '../firebase.config.js'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { collection, getDocs, doc, updateDoc, setDoc, onSnapshot } from 'firebase/firestore'
import Graphs from './Graphs.jsx'
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
    })).sort((a, b) => parseInt(a.id) - parseInt(b.id)) // Sort numerically by ID
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

  useEffect(() => {
    const unsubscribeQuestions = onSnapshot(
      collection(db, 'questions'),
      (querySnapshot) => {
        const questionList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })).sort((a, b) => parseInt(a.id) - parseInt(b.id)) // Sort numerically by ID
        setQuestions(questionList)
      },
      (error) => {
        console.error("Error fetching questions: ", error)
      }
    )

    return () => unsubscribeQuestions() // Cleanup listener when component unmounts
  }, []) 

  // Fetch responses with a real-time listener
  useEffect(() => {
    const unsubscribeResponses = onSnapshot(
      collection(db, 'responses'),
      (querySnapshot) => {
        const responseList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setResponses(responseList)
      },
      (error) => {
        console.error("Error fetching responses: ", error)
      }
    )

    return () => unsubscribeResponses() // Cleanup listener when component unmounts
  }, [])
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
    let newId = `${questionCount + 1}`
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
/*
  const createNewInfoSection = async () => {
    const questionCount = questions.length
    let newId = `${questionCount + 1}`

    setInfoData((prev) => ({ ...prev, id: newId }))

    const getSubtypeLabel = (subtype) => {
      switch (subtype) {
        case '1':
          return 'Image'
        case '2':
          return 'Video'
        case '3':
          return 'Text'
        default:
          return ''
      }
    }

    const formHTML = `
      <div class="form-container">
        <label for="title">Title</label>
        <input id="title" class="swal2-input" placeholder="Enter section title">
        
        <label for="subtype">Content Type</label>
        <select id="subtype" class="swal2-input" onchange="updateFormFields()">
          <option value="1">Image</option>
          <option value="2">Video</option>
          <option value="3">Text</option>
        </select>
  
        <div id="altTextContainer">
          <label for="altText">Alt Text</label>
          <input id="altText" class="swal2-input" placeholder="Enter alt text">
        </div>
  
        <label for="content">Content</label>
        <div id="contentContainer">
          <input id="content" class="swal2-input" placeholder="Enter content URL">
        </div>
      </div>
    `

    const updateFormFields = () => {
      const subtype = document.getElementById('subtype').value
      const contentContainer = document.getElementById('contentContainer')
      const altTextContainer = document.getElementById('altTextContainer')

      // Show/hide alt text based on subtype
      if (subtype === '3') {
        altTextContainer.style.display = 'none'
      } else {
        altTextContainer.style.display = 'block'
      }

      // Update content input based on subtype
      if (subtype === '3') {
        contentContainer.innerHTML = `
          <textarea id="content" class="swal2-textarea" placeholder="Enter your content" style="height: 150px;"></textarea>
        `
      } else {
        contentContainer.innerHTML = `
          <input id="content" class="swal2-input" placeholder="Enter ${getSubtypeLabel(subtype)} URL">
        `
      }
    }

    const { value: formData, isConfirmed } = await Alert.fire({
      title: 'Create a new Info Section',
      html: formHTML,
      didOpen: () => {
        // Add the update function to window so it can be called from the select onChange
        window.updateFormFields = updateFormFields
      },
      focusConfirm: false,
      preConfirm: () => {
        const title = document.getElementById('title').value
        const subtype = document.getElementById('subtype').value
        const content = document.getElementById('content').value
        const altText = document.getElementById('altText')?.value

        if (!title || !subtype || !content) {
          Alert.showValidationMessage('Please fill in all required fields')
          return null
        }

        if ((subtype === '1' || subtype === '2') && !altText) {
          Alert.showValidationMessage(
            'Alt text is required for image and video content'
          )
          return null
        }

        return {
          title,
          subtype,
          content,
          altText: subtype === '3' ? null : altText,
        }
      },
    })

    if (isConfirmed && formData) {
      try {
        const questionRef = doc(db, 'questions', newId)
        await setDoc(questionRef, {
          id: newId,
          type: '4', // Type 4 for Info Section
          title: formData.title,
          subtype: formData.subtype,
          content: formData.content,
          altText: formData.altText,
        })

        fireToast('Info section added successfully', 1000, true)
      } catch (error) {
        Alert.fire({
          icon: 'error',
          title: 'Error adding info section',
          text: error.message,
        })
      }

      fetchQuestions()
    }
  }
*/
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
            className="flex flex-col p-2 my-2 rounded-lg border border-solid border-ctp-surface2"
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
      <div className="overflow-y-scroll p-4 w-1/3 border-r border-ctp-overlay0">
        <h2 className="mb-4 text-lg font-bold">Responses</h2>
        {responses
  .sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10)) // Numeric sorting
  .map((response) => (
    <div
      key={response.id}
      className="mb-2 border collapse collapse-arrow border-ctp-overlay0 rounded-box"
    >
      <input type="checkbox" />
      <div className="font-medium collapse-title">
        Response ID: {parseInt(response.id, 10)} {/* Remove padding */}
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

      <div className="overflow-y-scroll p-4 w-1/3 border-r border-ctp-overlay0">
        <h2 className="mb-4 text-lg font-bold">Questions</h2>
        {questions.map((question) => (
          <div
            key={question.id}
            className="mb-2 border collapse collapse-arrow border-ctp-overlay0 rounded-box"
          >
            <input type="checkbox" />
            <div className="font-medium collapse-title">
              Question ID: {question.id}
            </div>
            <div className="space-y-2 collapse-content">
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
                  className="w-full input input-bordered input-sm bg-ctp-surface0 text-ctp-text"
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
        <div className="flex flex-row justify-center items-center w-full h-fit">
          <button
            onClick={createNewQuestion}
            className="rounded-full btn btn-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
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
            Question
          </button>
          {/*
          <button
            onClick={createNewInfoSection}
            className="rounded-full btn btn-md"
          >
        
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
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
            Info
          </button>
          */}
        </div>
      </div>
      <div className="overflow-y-scroll p-4 w-1/3">
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
          <button className="w-full btn h-fit" onClick={()=>document.getElementById('graphmodal').showModal()}>Show Graphs</button>

          {detectionSummary ? (
            <div className="flex flex-col justify-center items-center w-full h-fit">
              <h1 className="mt-4 text-lg font-bold">Detections</h1>
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
  const calculateHash = async (message) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(message)
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }
  const inputHash = await calculateHash(input)
  if (inputHash === 'aa706137d0c183ee225b25b3355cd29b2ea893b01c2f7e2a9d455fd4c113a8c3') {
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
        <>
<dialog id="graphmodal" className="modal">
  <div className="w-11/12 max-w-full modal-box">
    <Graphs/>
  </div>
</dialog>
        <Panel />
        </>
      ) : (
        <div className="flex flex-col justify-center items-center">
          <form onSubmit={(e) => checkCode(e, setAccess)}>
            <input
              type="password"
              name="input"
              autoComplete="off"
              className="mr-2 input"
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
