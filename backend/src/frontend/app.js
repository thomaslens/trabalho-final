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
// ===== Modal de edição =====
const editModal = document.getElementById("edit-modal");
const editForm = document.getElementById("edit-form");
const editClose = document.getElementById("edit-close");
const editCancel = document.getElementById("edit-cancel");

const editId = document.getElementById("edit-id");
const editTitle = document.getElementById("edit-title");
const editDesc = document.getElementById("edit-desc");
const editStatus = document.getElementById("edit-status");
const editDate = document.getElementById("edit-date");
const editTime = document.getElementById("edit-time");


// ===== Helpers =====
function openModal(task) {
  // preenche campos com os valores atuais
  editId.value = task.id;
  editTitle.value = task.titulo;
  editDesc.value = task.descricao || "";
  editStatus.value = task.status;

  // data vem tipo "2025-12-01T00:00:00.000Z" às vezes
  editDate.value = task.data_compromisso
    ? task.data_compromisso.slice(0, 10)
    : "";

  editTime.value = task.hora_compromisso || "";

  editModal.classList.remove("hidden");
}

function closeModal() {
  editModal.classList.add("hidden");
}


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
  // limpa a lista antes de renderizar de novo
  taskList.innerHTML = "";

  // se não tiver tarefas, mostra mensagem simples
  if (tasks.length === 0) {
    const emptyLi = document.createElement("li");
    emptyLi.className = "card";
    emptyLi.textContent = "Nenhuma tarefa ainda.";
    taskList.appendChild(emptyLi);
    return;
  }

  // percorre tarefa por tarefa
  tasks.forEach(task => {

    // 1) cria o <li> principal
    const li = document.createElement("li");
    li.className = "task";

    // 2) cria a coluna da esquerda (conteúdo)
    const leftDiv = document.createElement("div");

    // 3) título da tarefa
    const title = document.createElement("h4");
    title.textContent = task.titulo;
    leftDiv.appendChild(title);

    // 4) descrição (se não tiver, deixa vazio)
    const desc = document.createElement("small");
    desc.textContent = task.descricao || "";
    leftDiv.appendChild(desc);

    // 5) data/hora formatadas
    const dataFormatada = task.data_compromisso
      ? new Date(task.data_compromisso).toLocaleDateString("pt-BR")
      : "Sem data";

    const horaFormatada = task.hora_compromisso || "Sem hora";

    // 6) cria o elemento que mostra data/hora
    const dateTimeSmall = document.createElement("small");
    dateTimeSmall.style.display = "block";
    dateTimeSmall.style.marginTop = "6px";
    dateTimeSmall.style.color = "#cbd5e1";
    dateTimeSmall.textContent = `📅 ${dataFormatada}  ⏰ ${horaFormatada}`;
    leftDiv.appendChild(dateTimeSmall);

    // 7) badge de status
    const badgeWrap = document.createElement("div");
    badgeWrap.style.marginTop = "6px";

    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = task.status;

    badgeWrap.appendChild(badge);
    leftDiv.appendChild(badgeWrap);

    // 8) cria a coluna da direita (botões)
    const actionsDiv = document.createElement("div");
    actionsDiv.className = "task-actions";

    // botão editar
    const editBtn = document.createElement("button");
    editBtn.className = "btn";
    editBtn.textContent = "Editar";
    editBtn.onclick = () => openEdit(task);

    // botão excluir
    const delBtn = document.createElement("button");
    delBtn.className = "btn";
    delBtn.textContent = "Excluir";
    delBtn.onclick = () => deleteTask(task.id);

    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(delBtn);

    // 9) monta o li final
    li.appendChild(leftDiv);
    li.appendChild(actionsDiv);

    // 10) adiciona na lista
    taskList.appendChild(li);
  });
}

// ===== POST task =====
taskForm.onsubmit = async (e) => {
  e.preventDefault();

  const titulo = document.getElementById("task-title").value;
  const descricao = document.getElementById("task-desc").value;
  const status = document.getElementById("task-status").value;
  const data_compromisso = document.getElementById("task-date").value;
  const hora_compromisso = document.getElementById("task-time").value;


  const res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      titulo,
      descricao,
      status,
      data_compromisso: data_compromisso || null,
      hora_compromisso: hora_compromisso || null
    })
    
  });

  const data = await res.json();
  if (!res.ok) return showFeedback(data.message || "Erro ao criar tarefa", "error");

  showFeedback(data.message);
  taskForm.reset();
  await loadTasks();
};

// ===== PUT task =====
function openEdit(task) {
openModal(task)
editClose.onclick = closeModal;
editCancel.onclick = closeModal;

// fecha se clicar fora do card
editModal.querySelector(".modal-backdrop").onclick = closeModal;

editForm.onsubmit = async (e) => {
  e.preventDefault();

  const id = editId.value;

  const payload = {
    titulo: editTitle.value,
    descricao: editDesc.value,
    status: editStatus.value,
    data_compromisso: editDate.value || null,
    hora_compromisso: editTime.value || null
  };

  await updateTask(id, payload);
  closeModal();
};

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