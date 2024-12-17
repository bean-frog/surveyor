import React, { useState, useEffect, memo } from 'react'
import { db } from '../firebase.config.js'
import {
  collection,
  getDocs,
  query,
  orderBy,
  setDoc,
  doc,
} from 'firebase/firestore'

const Likert = memo(({ id, question, onChange }) => {
  return (
    <div className="mb-6 p-4 bg-ctp-surface1 shadow-md rounded-lg">
      <p className="mb-2 text-ctp-text font-medium">{question}</p>
      <div className="flex justify-between">
        {[1, 2, 3, 4, 5].map((value) => (
          <label
            key={value}
            className="flex items-center gap-2 cursor-pointer hover:text-ctp-lavender"
          >
            <input
              type="radio"
              name={`q${id}`}
              value={value}
              onChange={(e) => onChange(id, e.target.value)}
              className="radio checked:bg-ctp-lavender focus:ring-ctp-overlay2"
            />
            <span className="text-ctp-subtext0">{value}</span>
          </label>
        ))}
      </div>
    </div>
  )
})

const TrueFalse = memo(({ id, question, onChange }) => {
  return (
    <div className="mb-6 p-4 bg-ctp-surface1 shadow-md rounded-lg">
      <p className="mb-2 text-ctp-text font-medium">{question}</p>
      <div className="flex gap-6">
        {[
          { label: 'True', value: 'true' },
          { label: 'False', value: 'false' },
        ].map(({ label, value }) => (
          <label
            key={label}
            className="flex items-center gap-2 cursor-pointer hover:text-ctp-lavender"
          >
            <input
              type="radio"
              name={`q${id}`}
              value={value}
              onChange={(e) => onChange(id, e.target.value)}
              className="radio checked:bg-ctp-lavender focus:ring-ctp-overlay2"
            />
            <span className="text-ctp-subtext0">{label}</span>
          </label>
        ))}
      </div>
    </div>
  )
})

const OpenEnded = memo(({ id, question, onChange }) => {
  const [localValue, setLocalValue] = useState('')

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onChange(id, localValue)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [localValue, id, onChange])

  return (
    <div className="mb-6 p-4 bg-ctp-surface1 shadow-md rounded-lg">
      <p className="mb-2 text-ctp-text font-medium">{question}</p>
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder="Type your response here..."
        className="input input-bordered w-full max-w-md bg-ctp-base text-ctp-text placeholder-ctp-subtext0 focus:outline-none focus:ring focus:ring-ctp-lavender"
      />
    </div>
  )
})

// Component map to render the appropriate question type
const QuestionComponents = {
  1: Likert,
  2: TrueFalse,
  3: OpenEnded,
}

function Survey() {
  const [questions, setQuestions] = useState([])
  const [responses, setResponses] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch questions from Firestore
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const questionsCollection = collection(db, 'questions')
        const q = query(questionsCollection, orderBy('__name__'))
        const querySnapshot = await getDocs(q)

        const questionList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setQuestions(questionList)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching questions:', err)
        setError('Failed to load survey questions')
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [])

  const handleChange = React.useCallback((id, value) => {
    setResponses((prev) => ({
      ...prev,
      [`q${id}`]: value,
    }))
  }, [])

  const addToDB = async (data) => {
    try {
      const responsesCollection = collection(db, 'responses')
      const q = query(responsesCollection, orderBy('__name__', 'desc'))
      const querySnapshot = await getDocs(q)
      let newId
      if (!querySnapshot.empty) {
        const highestDoc = querySnapshot.docs[0]
        newId = (parseInt(highestDoc.id, 10) + 1).toString().padStart(3, '0')
      } else {
        newId = '001'
      }
      const newDocRef = doc(responsesCollection, newId)
      await setDoc(newDocRef, data)

      console.log(`Document successfully written with ID: ${newId}`)
    } catch (error) {
      console.error('Error adding document: ', error)
    }
  }

  const handleSubmit = () => {
    addToDB(responses)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        Loading questions...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ctp-base text-ctp-text">
      <form
        className="w-full max-w-2xl p-6 space-y-6 bg-ctp-surface2 rounded-lg shadow-lg"
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        {questions.map(({ id, question, type }) => {
          const QuestionComponent = QuestionComponents[type]
          if (!QuestionComponent) {
            console.warn(`Unknown question type: ${type} for question ${id}`)
            return null
          }

          return (
            <QuestionComponent
              key={id}
              id={id}
              question={question}
              onChange={handleChange}
            />
          )
        })}
        <div className="flex justify-center">
          <button
            type="submit"
            className="btn btn-primary bg-ctp-lavender text-ctp-base hover:bg-ctp-overlay1 shadow-md border-none"
            disabled={questions.length === 0}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  )
}

export default Survey
