// URL base da API
const API_URL = "http://localhost:3000";

// Elementos HTML
const feedbackEl = document.getElementById("feedback");
const subtitleEl = document.getElementById("subtitle");

const authSection = document.getElementById("auth-section");
const appSection = document.getElementById("app-section");

const tabLogin = document.getElementById("tab-login");
const tabRegister = document.getElementById("tab-register");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

const taskForm = document.getElementById("task-form");
const taskList = document.getElementById("task-list");
const logoutBtn = document.getElementById("logout-btn");

// ===== Helpers =====

// Mostra feedback visual
function showFeedback(msg, type = "success") {
  feedbackEl.textContent = msg;
  feedbackEl.className = `feedback ${type}`;
  feedbackEl.classList.remove("hidden");
  setTimeout(() => feedbackEl.classList.add("hidden"), 2500);
}

// Salva token no navegador
function setToken(token) {
  localStorage.setItem("token", token);
}
function getToken() {
  return localStorage.getItem("token");
}
function clearToken() {
  localStorage.removeItem("token");
}

// Headers com JWT
function authHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getToken()}`
  };
}

// ===== Tabs =====
tabLogin.onclick = () => {
  tabLogin.classList.add("active");
  tabRegister.classList.remove("active");
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
};

tabRegister.onclick = () => {
  tabRegister.classList.add("active");
  tabLogin.classList.remove("active");
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
};

// ===== Cadastro =====
registerForm.onsubmit = async (e) => {
  e.preventDefault();

  const nome = document.getElementById("register-name").value;
  const email = document.getElementById("register-email").value;
  const senha = document.getElementById("register-password").value;

  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ nome, email, senha })
  });

  const data = await res.json();
  if (!res.ok) return showFeedback(data.message || "Erro no cadastro", "error");

  showFeedback(data.message);
  tabLogin.click();
  registerForm.reset();
};

// ===== Login =====
loginForm.onsubmit = async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const senha = document.getElementById("login-password").value;

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, senha })
  });

  const data = await res.json();
  if (!res.ok) return showFeedback(data.message || "Erro no login", "error");

  setToken(data.token);
  showFeedback(data.message);
  loginForm.reset();

  showApp();
  await loadTasks();
};

// ===== UI =====
function showApp() {
  authSection.classList.add("hidden");
  appSection.classList.remove("hidden");
  subtitleEl.textContent = "Você está logado ✅";
}
function showAuth() {
  authSection.classList.remove("hidden");
  appSection.classList.add("hidden");
  subtitleEl.textContent = "Faça login para continuar";
}

// ===== GET tasks =====
async function loadTasks() {
  const res = await fetch(`${API_URL}/tasks`, { headers: authHeaders() });
  const data = await res.json();

  if (!res.ok) {
    showFeedback(data.message || "Erro ao carregar tarefas", "error");
    if (res.status === 401) { clearToken(); showAuth(); }
    return;
  }

  renderTasks(data);
}

// renderiza tarefas
function renderTasks(tasks) {
  taskList.innerHTML = "";
  if (tasks.length === 0) {
    taskList.innerHTML = "<li class='card'>Nenhuma tarefa ainda.</li>";
    return;
  }

  tasks.forEach(task => {
    const li = document.createElement("li");
    li.className = "task";

    li.innerHTML = `
      <div>
        <h4>${task.titulo}</h4>
        <small>${task.descricao || ""}</small>
        <div style="margin-top:6px;">
          <span class="badge">${task.status}</span>
        </div>
      </div>
      <div class="task-actions">
        <button class="btn" data-act="edit">Editar</button>
        <button class="btn" data-act="del">Excluir</button>
      </div>
    `;

    li.querySelector('[data-act="edit"]').onclick = () => openEdit(task);
    li.querySelector('[data-act="del"]').onclick = () => deleteTask(task.id);

    taskList.appendChild(li);
  });
}

// ===== POST task =====
taskForm.onsubmit = async (e) => {
  e.preventDefault();

  const titulo = document.getElementById("task-title").value;
  const descricao = document.getElementById("task-desc").value;
  const status = document.getElementById("task-status").value;

  const res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ titulo, descricao, status })
  });

  const data = await res.json();
  if (!res.ok) return showFeedback(data.message || "Erro ao criar tarefa", "error");

  showFeedback(data.message);
  taskForm.reset();
  await loadTasks();
};

// ===== PUT task =====
function openEdit(task) {
  const titulo = prompt("Novo título:", task.titulo);
  if (titulo === null) return;

  const descricao = prompt("Nova descrição:", task.descricao || "");
  if (descricao === null) return;

  const status = prompt("Novo status (A fazer / Em andamento / Concluída):", task.status);
  if (status === null) return;

  updateTask(task.id, { titulo, descricao, status });
}

async function updateTask(id, payload) {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) return showFeedback(data.message || "Erro ao atualizar tarefa", "error");

  showFeedback(data.message);
  await loadTasks();
}

// ===== DELETE task =====
async function deleteTask(id) {
  if (!confirm("Deseja realmente excluir?")) return;

  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: authHeaders()
  });

  const data = await res.json();
  if (!res.ok) return showFeedback(data.message || "Erro ao excluir tarefa", "error");

  showFeedback(data.message);
  await loadTasks();
}

// ===== Logout =====
logoutBtn.onclick = () => {
  clearToken();
  showAuth();
};

// auto-login
if (getToken()) {
  showApp();
  loadTasks();
}