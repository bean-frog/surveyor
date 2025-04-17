# surveyor

Simple survey site and graph generator for my AP Research project. <br/>
Uses Firebase to store questions and responses, and thus can be adapted to suit your needs using your own Firebase project and config. <br />
There's a lot of hardcoded stuff because I was rushing, but questions and responses are modular. You'll probably want to edit Mission.jsx, Parents.jsx, Consent.jsx <br />

## graph generator instructions
- step 1 is to have survey questions and reponses. They can be exported as JSON in the utils page of the survey.
- download questions.json and responses.json to the ./analysis directory
- `python3 plot.py <question number OR null>`
- if you supply a number, it will generate a graph for that question only.
- if you don't supply a number, it will generate individual graphs for each question as well as a mosaic of all graphs. 
- the graphs will be downloaded to `./analysis/graphs`

## Survey instructions (setup and deployment)
- clone this repo
- create Firebase project at firebase.google.com. The Spark (free) plan should be enough depending on sample size
- somewhere in the creation process, Firebase will show you a config with some keys and values.
- create .env.local file in the cloned repo with the Firebase config options with `REACT_APP_` leading each key. You need these ones:
  - REACT_APP_FIREBASE_API_KEY
  - REACT_APP_FIREBASE_AUTH_DOMAIN
  - REACT_APP_FIREBASE_PROJECT_ID
  - REACT_APP_FIREBASE_STORAGE_BUCKET
  - REACT_APP_FIREBASE_APP_ID
  - REACT_APP_FIREBASE_MEASUREMENT_ID
- create a new project on Vercel, connect the cloned GitHub repo, and add these environment variables to the project settings as well.
- set up a Firestore database on the Firebase console. here's what it needs to have:
  - (initially) empty collection called `responses`
  - collection called `questions`
  - either populate from within firebase or from (app url)/utils if its running or deployed. this will work if running locally too, or in production.
    - any number of documents where the name is an integer (pad 1-9 with a 0)
      - field called `question`, with a question (string, duh)
      - field called `type`, with the type (1: Likert scale, 2: true/false, 3: open-ended)
- development info if you want to change something in the UI or app logic:
  - install deps with `npm install` from the project root
  - start dev server with `npm run start` from the project root
  - watch and build CSS using `npm run tailwind` from the project root
  - format (all files) using `npm run fmt`
  - Component index:
    - App.jsx: entrypoint, stores home component and routing stuff
    - Consent.jsx: consent form for non-minors, loads Survey.jsx once submitted
    - Debrief.jsx: post-survey debrief and thank you message
    - LowTaperFade.jsx: wraps literally everything in a quick fade-in animation because it looks cool
    - Mission.jsx: mission statement
    - Parents.jsx: parental consent form for minors, also returns to Survey.jsx
    - Survey.jsx: the survey. loads questions from firebase and also sends them to firebase on submit
    - Utils.jsx: admin stuff, create/edit questions, see responses, detect and prune malformed responses, download responses in a nice GUI
