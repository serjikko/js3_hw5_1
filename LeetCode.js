const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const basicAuth = require('express-basic-auth');

const app = express();
app.use(bodyParser.json());
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));

mongoose.connect('mongodb://localhost:27017/leetcode_clone', { useNewUrlParser: true, useUnifiedTopology: true });

const taskSchema = new mongoose.Schema({
    title: String,
    description: String,
    examples: [{ input: String, output: String }],
    difficulty: String,
    tags: [String],
    additionalMaterials: [String]
});

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: { type: String, enum: ['user', 'admin', 'interviewer'], default: 'user' },
    rating: Number
});

const Task = mongoose.model('Task', taskSchema);
const User = mongoose.model('User', userSchema);

const users = [{ name: 'admin', pwd: 'supersecret' }];

app.use(basicAuth({
    users: { 'admin': 'supersecret' },
    challenge: true,
    unauthorizedResponse: 'Authentication required.'
}));

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (users.some(x => x.name === username && x.pwd === password)) {
        return res.status(200).send('Login successful');
    }

    res.status(401).send('Authentication required.');
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Could not log out.');
        }
        res.status(200).send('Logout successful.');
    });
});

// добавление задачи
app.post('/tasks', (req, res) => {
    const newTask = new Task(req.body);
    newTask.save()
        .then(task => res.status(201).json(task))
        .catch(err => res.status(400).json({ error: err.message }));
});

// получение задачи
app.get('/tasks', (req, res) => {
    Task.find()
        .then(tasks => res.status(200).json(tasks))
        .catch(err => res.status(500).json({ error: err.message }));
});

// редактирование задачи
app.put('/tasks/:id', (req, res) => {
    Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .then(task => res.status(200).json(task))
        .catch(err => res.status(400).json({ error: err.message }));
});

// удаление задачи
app.delete('/tasks/:id', (req, res) => {
    Task.findByIdAndDelete(req.params.id)
        .then(() => res.status(204).send())
        .catch(err => res.status(500).json({ error: err.message }));
});

// комментарий к задаче
app.post('/tasks/:id/comments', (req, res) => {
    // Логика добавления комментария
});

// оценка задачи
app.post('/tasks/:id/rate', (req, res) => {
    // Логика оценки задачи
});

app.listen(3000, () => {
    console.log('Сервер запущен на порту 3000');
});