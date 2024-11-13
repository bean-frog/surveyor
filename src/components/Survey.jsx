/*import React, { useState } from 'react';
import { db } from './firebase.config.js'; // Assuming you have your Firebase setup

const Survey = () => {
  const [responseObject, setResponseObject] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setResponseObject({ ...responseObject, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // Get the last document ID in the 'responses' collection
      const lastDocSnapshot = await db.collection('responses').orderBy('id', 'desc').limit(1).get();
      let lastId = 0;
      if (!lastDocSnapshot.empty) {
        lastId = lastDocSnapshot.docs[0].data().id;
      }

      // Generate the next ID
      const newId = lastId + 1;

      // Write the response object to Firestore
      await db.collection('responses').doc(newId.toString()).set({
        id: newId,
        ...responseObject,
      });

      // Reset the form
      setResponseObject({});
      console.log('Response added successfully!');
    } catch (error) {
      console.error('Error adding response:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
  
      <input type="text" name="question1" placeholder="Question 1" onChange={handleChange} />
      <input type="number" name="answer1" placeholder="Answer 1" onChange={handleChange} />
      {/* Add more input fields as needed 

      <button type="submit">Add Response</button>
    </form>
  );
};

export default Survey;
*/