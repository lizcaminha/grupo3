const STORAGE_KEY = "requisicoesIFMT";

const form = document.getElementById("requestForm");
const dateInput = document.getElementById("date");
const feedback = document.getElementById("feedback");
const requestsList = document.getElementById("requestsList");

// Impede selecionar uma data anterior ao dia atual.
const today = new Date();
const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

dateInput.min = localToday;
dateInput.value = localToday;

function getRequests() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (error) {
        return [];
    }
}

function showRequests() {
    const requests = getRequests();

    if (requests.length === 0) {
        requestsList.innerHTML = '<p class="empty-message">Nenhuma requisição registrada ainda.</p>';
        return;
    }

    requestsList.innerHTML = requests.map((request) => `
        <article class="request-item">
            <div><strong>Protocolo:</strong> ${escapeHTML(request.id)}</div>
            <div><strong>Nome:</strong> ${escapeHTML(request.name)}</div>
            <div><strong>Professor:</strong> ${escapeHTML(request.professor)}</div>
            <div><strong>Data:</strong> ${escapeHTML(request.date)}</div>
            <div><strong>Horário:</strong> ${escapeHTML(request.time)}</div>
            <div><strong>Justificativa:</strong> ${escapeHTML(request.justification)}</div>
            <div><strong>Situação:</strong> <span class="status-pending">Pendente de autorização</span></div>
        </article>
    `).join("");
}

// Evita que textos digitados pelo usuário sejam interpretados como HTML.
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
        return;
    }

    const request = {
        id: "REQ-" + Date.now(),
        name: document.getElementById("name").value.trim(),
        professor: document.getElementById("professor").value.trim(),
        date: dateInput.value,
        time: document.getElementById("time").value,
        justification: document.getElementById("justification").value.trim(),
        status: "Pendente",
        createdAt: new Date().toISOString()
    };

    if (!request.name || !request.professor || !request.justification) {
        feedback.textContent = "Preencha todos os campos antes de enviar.";
        feedback.className = "feedback error";
        return;
    }

    try {
        const requests = getRequests();
        requests.unshift(request);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));

        feedback.textContent = "Requisição registrada neste navegador! Protocolo: " + request.id;
        feedback.className = "feedback success";

        form.reset();
        dateInput.value = localToday;
        showRequests();
    } catch (error) {
        feedback.textContent = "Não foi possível salvar. Verifique as configurações do navegador.";
        feedback.className = "feedback error";
    }
});

form.addEventListener("reset", () => {
    feedback.textContent = "";
    feedback.className = "feedback";
});

showRequests();
