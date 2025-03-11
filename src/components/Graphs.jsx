import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase.config.js';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


const GraphCard = ({ question, responses }) => {
  const qType = Number(question.type); // ensure numeric type
  const key = `q${question.id}`;
  let labels = [];
  let counts = [];
  let values = [];

  if (qType === 1) {
    // Likert scale (1-5)
    labels = ['1', '2', '3', '4', '5'];
    counts = [0, 0, 0, 0, 0];
    responses.forEach(response => {
      const answer = Number(response[key]);
      if (!isNaN(answer) && answer >= 1 && answer <= 5) {
        counts[answer - 1]++;
        values.push(answer);
      }
    });
  } else if (qType === 2) {
    // True/False question
    labels = ['True (1)', 'False (0)'];
    counts = [0, 0];
    responses.forEach(response => {
      let answer = response[key];
      if (typeof answer === 'string') {
        answer = answer.toLowerCase() === 'true';
      }
      if (answer === true) {
        counts[0]++;
        values.push(1);
      } else if (answer === false) {
        counts[1]++;
        values.push(0);
      }
    });
  }

  // Use total number of responses (or at least 1) as the max value 
  // to keep each graph at the same height.
  const overallMax = responses.length > 0 ? responses.length : 1;

  const data = {
    labels,
    datasets: [
      {
        label: question.question,
        data: counts,
        backgroundColor: '#c0c0c0',
        borderColor: '#010203',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: qType === 1 ? 'Rating' : 'Response',
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
        max: overallMax,
      },
    },
  };

  // Calculate mean
  const mean = values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2) : 'N/A';

  // Calculate mode
  const mode =
    values.length > 0
      ? Object.entries(values.reduce((acc, val) => ((acc[val] = (acc[val] || 0) + 1), acc), {}))
          .sort((a, b) => b[1] - a[1])[0][0]
      : 'N/A';

  return (
    <div className="p-4 rounded-lg border shadow border-ctp-base bg-ctp-surface" style={{ height: '350px' }}>
      <Bar data={data} options={options} />
      <div className="flex flex-row justify-center items-center mb-2 space-x-4 text-center text-md">
        <p>Mean: <strong>{mean}</strong></p>
        <p>Mode: <strong>{mode}</strong></p>
      </div>
    </div>
  );
};



const OpenEndedCard = ({ question, responses }) => {
  const key = `q${question.id}`;
  const answers = responses
    .map(response => response[key])
    .filter(answer => answer !== undefined && answer !== null);

  return (
    <div className="p-4 mb-4 rounded-lg border shadow border-ctp-base bg-ctp-surface">
      <h3 className="font-bold text-ctp-text">{question.question}</h3>
      <ul className="mt-2">
        {answers.length ? (
          answers.map((ans, idx) => (
            <li key={idx} className="py-1 border-b text-ctp-subtext border-ctp-base">
              {ans}
            </li>
          ))
        ) : (
          <li className="text-ctp-subtext">No responses yet.</li>
        )}
      </ul>
    </div>
  );
};

const GraphGrid = () => {
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const questionsRef = collection(db, 'questions');
    const responsesRef = collection(db, 'responses');

    const unsubscribeQuestions = onSnapshot(questionsRef, (snapshot) => {
      const qs = snapshot.docs.map(doc => doc.data());
      qs.sort((a, b) => a.id - b.id);
      console.log("Fetched Questions:", qs);
      setQuestions(qs);
      setLoading(false);
    });

    const unsubscribeResponses = onSnapshot(responsesRef, (snapshot) => {
      const rs = snapshot.docs.map(doc => doc.data());
      console.log("Fetched Responses:", rs);
      setResponses(rs);
    });

    return () => {
      unsubscribeQuestions();
      unsubscribeResponses();
    };
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-ctp-base text-ctp-text">
        <p>Loading survey data...</p>
      </div>
    );
  }

  // Convert question.type to a number when filtering.
  const graphQuestions = questions.filter(q => Number(q.type) === 1 || Number(q.type) === 2);
  const openEndedQuestions = questions.filter(q => Number(q.type) === 3);

  return (
    <div className="overflow-y-scroll p-4 w-full h-full bg-ctp-base text-ctp-text">
      <h1 className="mb-2 text-3xl font-bold">Survey Results</h1>
      <h1 className="mb-6 text-xl font-bold">Total Responses: {responses.length}</h1>

      <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2 lg:grid-cols-3">
        {graphQuestions.map(question => (
          <GraphCard key={question.id} question={question} responses={responses} />
        ))}
      </div>

      {openEndedQuestions.map(question => (
        <OpenEndedCard key={question.id} question={question} responses={responses} />
      ))}
    </div>
  );
};

export default function Graphs()  {

    const [access, setAccess] = useState(false)
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
        } 
      }
      return (
       /* <>
    {access ? (
        <GraphGrid />
    ) : (
        <div className="flex flex-col justify-center items-center w-full h-full">
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
    */
   <GraphGrid />
)
}