const feathers = require('@feathersjs/feathers');
const express  = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');
const moment   = require('moment');

class IdeaService {
  constructor() {
    this.ideas = [];
  }

  async find() {
    return this.ideas;
  }

  async create(data) {
    const idea = {
      id: this.ideas.length,
      text: data.text,
      tech: data.tech,
      viewer: data.viewer
    };

    idea.time = moment().format('h:mm:ss a');

    this.ideas.push(idea);

    return idea;
  }
}

const app = express(feathers());

// Parse JSON

app.use(express.json());

// Configure SocketIO realtime API

app.configure(socketio());

// Enable REST services

app.configure(express.rest());

// Register services

app.use('/ideas', new IdeaService());

// Connect new streams

app.on('connection', conn => app.channel('stream').join(conn));

// Publish events to stream

app.publish(data => app.channel('stream'));

const PORT = process.env.PORT || 3030;

app.listen(PORT).on('listening', () => console.log(`Server running on port ${PORT}`));

app.service('ideas').create({
  text: 'Build a cool app',
  tech: 'Node.js',
  viewer: 'John Doe'
});

app.use(express.static('build'));

const path = require('path');

app.get('*', function (req, res) {
  const index = path.join(__dirname, 'build', 'index.html');
  res.sendFile(index);
});
