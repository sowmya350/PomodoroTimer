// Simple Pomodoro-style timer with task list
const display = document.getElementById('display');
const status = document.getElementById('status');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const minutesInput = document.getElementById('minutesInput');
const setBtn = document.getElementById('setBtn');
const presets = document.querySelectorAll('.preset');

let totalSeconds = 25 * 60;
let remaining = totalSeconds;
let timerId = null;
let running = false;

function formatTime(s) {
  const mm = Math.floor(s / 60).toString().padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

function render() {
  display.textContent = formatTime(remaining);
  status.textContent = running ? 'Running' : 'Paused';
}

function tick() {
  if (remaining <= 0) {
    clearInterval(timerId);
    timerId = null;
    running = false;
    status.textContent = 'Finished! Take a short break.';
    document.getElementById('timerCard').animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.02)' }, { transform: 'scale(1)' }],
      { duration: 900 }
    );
    return;
  }
  remaining -= 1;
  render();
}

startBtn.addEventListener('click', () => {
  if (running) return;
  if (remaining <= 0) remaining = totalSeconds;
  timerId = setInterval(tick, 1000);
  running = true;
  render();
});

pauseBtn.addEventListener('click', () => {
  if (timerId) clearInterval(timerId);
  timerId = null;
  running = false;
  render();
});

resetBtn.addEventListener('click', () => {
  if (timerId) clearInterval(timerId);
  totalSeconds = Number(minutesInput.value || 25) * 60;
  remaining = totalSeconds;
  timerId = null;
  running = false;
  render();
});

setBtn.addEventListener('click', () => {
  const m = Number(minutesInput.value);
  if (!m || m < 1) return alert('Enter minutes >= 1');
  totalSeconds = m * 60;
  remaining = totalSeconds;
  render();
});

presets.forEach(p =>
  p.addEventListener('click', () => {
    const m = Number(p.dataset.min);
    minutesInput.value = m;
    totalSeconds = m * 60;
    remaining = totalSeconds;
    render();
  })
);

// tasks
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTask');
const taskList = document.getElementById('taskList');

function saveTasks() {
  const items = Array.from(taskList.querySelectorAll('li')).map(li => ({
    text: li.querySelector('.txt').textContent,
    done: li.classList.contains('done')
  }));
  localStorage.setItem('fc_tasks', JSON.stringify(items));
}

function loadTasks() {
  const raw = localStorage.getItem('fc_tasks');
  if (!raw) return;
  try {
    const items = JSON.parse(raw);
    items.forEach(it => addTaskToDOM(it.text, it.done));
  } catch (e) {
    console.warn(e);
  }
}

function addTaskToDOM(text, done = false) {
  const li = document.createElement('li');
  li.className = 'task';
  if (done) li.classList.add('done');
  const chk = document.createElement('input');
  chk.type = 'checkbox';
  chk.checked = done;
  const span = document.createElement('span');
  span.className = 'txt';
  span.textContent = text;
  const btn = document.createElement('button');
  btn.textContent = '✕';
  btn.className = 'ghost';
  li.appendChild(chk);
  li.appendChild(span);
  li.appendChild(btn);
  taskList.appendChild(li);

  chk.addEventListener('change', () => {
    li.classList.toggle('done');
    saveTasks();
  });
  btn.addEventListener('click', () => {
    li.remove();
    saveTasks();
  });
  saveTasks();
}

addTaskBtn.addEventListener('click', () => {
  const val = taskInput.value.trim();
  if (!val) return;
  addTaskToDOM(val);
  taskInput.value = '';
});

taskInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTaskBtn.click();
});

// init
render();
loadTasks();

