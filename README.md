# surveyor

Simple survey site for my AP Research project. <br/>
Uses Firebase to store questions and responses, and thus can be adapted to suit your needs using your own Firebase project and config. <br />
how:

- clone this repo
- create Firebase project at firebase.google.com. The Spark (free) plan should be enough depending on sample size
- somewhere in the creation process, FIrebase will show you a config with some keys and values.
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
    - any number of documents where the name is an integer (pad 1-9 with a 0)
      - field called `question`, with a question
      - field called `type`, with the type (1: Likert scale, 2: true/false, 3: open-ended)
- development info if you want to change something in the UI or app logic:
  - install deps with `npm install` from the project root
  - start dev server with `npm run start` from the project root
  - watch and build CSS using `npm run tailwind` from the project root
  - format (all files) using `npm run fmt`
