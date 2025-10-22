const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

let users = [];
let exercises = [];
let currentId = 1;

const formatDate = (dateString) => {
  if (!dateString) return new Date().toDateString();
  return new Date(dateString).toDateString();
};

const isValidDate = (dateString) => {
  return !isNaN(new Date(dateString).getTime());
};

app.post('/api/users', (req, res) => {
  const { username } = req.body;
    
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.json(existingUser);
  }

  const newUser = {
    username,
    _id: currentId.toString()
  };
    
  users.push(newUser);
  currentId++;
    
  res.json(newUser);
});

app.get('/api/users', (req, res) => {
    res.json(users);
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  if (!description || !duration) {
    return res.status(400).json({ error: 'Description and duration are required' });
  }
    
  if (isNaN(parseInt(duration))) {
    return res.status(400).json({ error: 'Duration must be a number' });
  }
    
  if (date && !isValidDate(date)) {
    return res.status(400).json({ error: 'Invalid date format. Use yyyy-mm-dd' });
  }

  const user = users.find(u => u._id === _id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const exercise = {
    userId: _id,
    description,
    duration: parseInt(duration),
    date: formatDate(date),
    exerciseId: exercises.length + 1
  };

  exercises.push(exercise);
  
  const response = {
        _id: user._id,
        username: user.username,
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date
    };
    
    res.json(response);
});

app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;
  const user = users.find(u => u._id === _id);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  let userExercises = exercises.filter(ex => ex.userId === _id);
   
  if (from) {
    const fromDate = new Date(from);
    userExercises = userExercises.filter(ex => new Date(ex.date) >= fromDate);
  }

   if (to) {
    const toDate = new Date(to);
    userExercises = userExercises.filter(ex => new Date(ex.date) <= toDate);
  }

  if (limit && !isNaN(parseInt(limit))) {
    userExercises = userExercises.slice(0, parseInt(limit));
  }

  const log = userExercises.map(ex => ({
    description: ex.description,
    duration: ex.duration,
    date: ex.date
  }));
    
  const response = {
    _id: user._id,
    username: user.username,
    count: log.length,
    log
  };
    
  res.json(response);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
