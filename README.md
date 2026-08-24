# TaskFlow To-Do App

TaskFlow is a polished client-side to-do list application built with HTML, CSS, and vanilla JavaScript. It focuses on DOM manipulation, event handling, state management, and persistent browser storage.

## Features

- Create, read, update, delete, and complete tasks
- Save tasks automatically with `window.localStorage`
- Filter tasks by All, Active, and Completed
- Search tasks by title
- Add priority levels: Low, Medium, and High
- Add optional due dates
- View live dashboard stats and completion progress
- Use delegated event listeners for task actions
- Responsive TaskFlow-style dashboard UI

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Browser `localStorage`

## Project Structure

```text
.
├── index.html
├── styles.css
├── script.js
└── README.md
```

## How to Run

Open `index.html` directly in your browser.

No build step, package installation, or backend server is required.

## How It Works

Tasks are stored in an array in JavaScript state. Whenever a task is added, edited, completed, deleted, or cleared, the app saves the updated array to `localStorage` and re-renders the interface.

The task list uses delegated event listeners, so actions like edit, delete, and complete are handled from the parent list instead of attaching separate listeners to every task.

## GitHub Workflow

After making changes, save them with:

```bash
git add .
git commit -m "Describe your changes"
git push
```
