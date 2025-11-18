require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((error) => console.error("❌ Error:", error));

// Import models
const Task = require("./models/Task");
const Session = require("./models/Session");

// Root route - just to confirm server is running
app.get("/", (req, res) => {
  res.json({
    message: "Day19 API Server",
    status: "Running",
    endpoints: {
      tasks: "/api/tasks",
      sessions: "/api/sessions",
    },
  });
});

// TODO: Add your Session routes here
// Session Routes

// POST /api/sessions -- Log a completed Pomodoro session
app.post("/api/sessions", async (req, res) => {
  try {
    // Validate required fields
    const { taskId, duration, startTime, completed } = req.body;
    
    if (!taskId || !duration || !startTime || completed === undefined) {
      return res.status(400).json({ 
        message: "Missing required fields: taskId, duration, startTime, completed" 
      });
    }

    // Create new session from request body
    const newSession = new Session(req.body);

    // Save to database
    const savedSession = await newSession.save();

    // Send back the saved session
    res.status(201).json(savedSession);
  } catch (error) {
    // Handle validation errors
    res.status(400).json({ message: error.message });
  }
});

// GET /api/sessions -- Get all Pomodoro sessions
app.get("/api/sessions", async (req, res) => {
  try {
    const sessions = await Session.find().populate('taskId');
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/tasks -- this will Add a new task
app.post("/api/tasks", async (req, res) => {
  try {
    // Create new task from request body
    const newTask = new Task(req.body);

    // Save to database
    const savedTask = await newTask.save();

    // Send back the saved task
    res.status(201).json(savedTask);
  } catch (error) {
    // Handle validation errors
    res.status(400).json({ message: error.message });
  }
});

// Get all tasks -- GET /api/tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get one Task -- GET /api/tasks/:id
app.get("/api/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Modify existing task -- PUT /api/tasks/:id
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id, // Which task to update
      req.body, // New data
      {
        new: true, // Return updated version
        runValidators: true, // Check schema rules
      }
    );

    if (!updatedTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// Remove a task -- DELETE /api/tasks/:id
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task deleted successfully",
      task: deletedTask,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
