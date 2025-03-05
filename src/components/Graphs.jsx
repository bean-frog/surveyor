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

  if (qType === 1) {
    // Likert scale (1-5)
    labels = ['1', '2', '3', '4', '5'];
    counts = [0, 0, 0, 0, 0];
    responses.forEach(response => {
      const answer = response[key];
      const answerNum = Number(answer);
      if (!isNaN(answerNum) && answerNum >= 1 && answerNum <= 5) {
        counts[answerNum - 1]++;
      }
    });
  } else if (qType === 2) {
    // True/False question
    labels = ['True', 'False'];
    counts = [0, 0];
    responses.forEach(response => {
      let answer = response[key];
      if (typeof answer === 'string') {
        answer = answer.toLowerCase() === 'true';
      }
      if (answer === true) {
        counts[0]++;
      } else if (answer === false) {
        counts[1]++;
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
        backgroundColor: qType === 1
          ? ['#fab387', '#f5c2e7', '#a6e3a1', '#89b4fa', '#f38ba8']
          : ['#a6e3a1', '#f38ba8'],
        borderColor: '#eba0ac',
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

  return (
    <div className="p-4 rounded-lg border shadow border-ctp-base bg-ctp-surface" style={{ height: '300px' }}>
      <Bar data={data} options={options} />
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
      <h1 className="mb-6 text-3xl font-bold">Survey Results</h1>

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
        <>
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
)
}