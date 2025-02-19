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

const baseContainerClasses =
  'mb-6 p-6 shadow-lg border border-ctp-surface2 rounded-lg w-full'
const titleClasses = 'inter mb-4 text-ctp-text font-semibold text-xl'
const labelClasses =
  'flex items-center gap-2 cursor-pointer hover:text-ctp-lavender'
const inputClasses = 'radio checked:bg-ctp-lavender focus:ring-ctp-overlay2'
const spanClasses = 'text-ctp-subtext0'

const Likert = memo(({ id, question, onChange }) => (
  <div className={baseContainerClasses}>
    <p className={titleClasses}>{question}</p>
    <div
      className="flex justify-between"
      role="radiogroup"
      aria-labelledby={`q${id}-label`}
    >
      {[1, 2, 3, 4, 5].map((value) => (
        <label key={value} className={labelClasses}>
          <input
            type="radio"
            name={`q${id}`}
            value={value}
            onChange={(e) => onChange(id, e.target.value)}
            className={inputClasses}
            aria-labelledby={`q${id}-option${value}`}
          />
          <span id={`q${id}-option${value}`} className={spanClasses}>
            {value}
          </span>
        </label>
      ))}
    </div>
  </div>
))

const TrueFalse = memo(({ id, question, onChange }) => (
  <div className={baseContainerClasses}>
    <p className={titleClasses}>{question}</p>
    <div
      className="flex gap-6"
      role="radiogroup"
      aria-labelledby={`q${id}-label`}
    >
      {[
        { label: 'True', value: 'true' },
        { label: 'False', value: 'false' },
      ].map(({ label, value }) => (
        <label key={label} className={labelClasses}>
          <input
            type="radio"
            name={`q${id}`}
            value={value}
            onChange={(e) => onChange(id, e.target.value)}
            className={inputClasses}
            aria-labelledby={`q${id}-option${value}`}
          />
          <span id={`q${id}-option${value}`} className={spanClasses}>
            {label}
          </span>
        </label>
      ))}
    </div>
  </div>
))

const OpenEnded = memo(({ id, question, onChange }) => {
  const [localValue, setLocalValue] = useState('')

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onChange(id, localValue)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [localValue, id, onChange])

  return (
    <div className={baseContainerClasses}>
      <p className={titleClasses}>{question}</p>
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder="Type your response here..."
        className="w-full input input-bordered bg-ctp-base text-ctp-text placeholder-ctp-subtext0 focus:outline-none focus:ring focus:ring-ctp-lavender"
        aria-label={question}
      />
    </div>
  )
})

/*
const InfoSection = ({ id, title, subtype, content, alt }) => {
  return (
    <div className={baseContainerClasses}>
      <p className={titleClasses}>{title}</p>
      {subtype === 1 ? (
        <img src={content} alt={alt}/>
      ) : subtype === 2 ? (
        <video controls>
          <source src={content} alt={alt} type="video/mp4" />
          Your browser appears to not support the video tag. Alt text: {alt}
        </video>
      ) : subtype === 3 ? (
        <p>{content}</p>
      ) : null}
    </div>
  );
};
*/


// Component map
const QuestionComponents = {
  1: Likert,
  2: TrueFalse,
  3: OpenEnded,
}

function Survey({ onCompleted }) {
  const [questions, setQuestions] = useState([])
  const [responses, setResponses] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const questionsCollection = collection(db, 'questions')
        const q = query(questionsCollection, orderBy('__name__'))
        const querySnapshot = await getDocs(q)

        const questionList = querySnapshot.docs
  .map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
  .sort((a, b) => parseInt(a.id) - parseInt(b.id)) // Sort numerically by ID


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
        newId = (parseInt(highestDoc.id, 10) + 1).toString()//.padStart(3, '0')
      } else {
        newId = '1' //001
      }
      const newDocRef = doc(responsesCollection, newId)
      await setDoc(newDocRef, data)

      console.log(`Document successfully written with ID: ${newId}`)
    } catch (error) {
      console.error('Error adding document: ', error)
    }
  }

  const handleSubmit = () => {
    // Validate responses
    const unansweredQuestions = questions.filter((q) => !responses[`q${q.id}`])

    if (unansweredQuestions.length > 0) {
      setValidationError('Please answer all questions before submitting.')
      return
    }

    // Clear validation error and proceed to submit
    setValidationError('')
    addToDB(responses)
    onCompleted()
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
    <div className="flex overflow-y-scroll flex-col justify-center items-center mt-auto w-full h-full bg-ctp-base text-ctp-text">
      <form
        className="overflow-y-scroll p-6 mt-auto space-y-6 w-full rounded-lg bg-ctp-base"
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
        {validationError && (
          <p className="text-center text-red-500">{validationError}</p>
        )}
        <div className="flex justify-center">
          <button
            type="submit"
            className="border-none shadow-md btn btn-primary bg-ctp-lavender text-ctp-base hover:bg-ctp-overlay1"
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
