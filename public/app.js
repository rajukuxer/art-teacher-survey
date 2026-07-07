const form = document.getElementById("feedbackForm");
const cards = [...document.querySelectorAll(".question-card")];
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const formStatus = document.getElementById("formStatus");
const portraitText = document.getElementById("portraitText");
const adminNodes = document.getElementById("adminNodes");
const adminPath = document.getElementById("adminPath");
const mapLabel = document.getElementById("mapLabel");
const timeSaved = document.getElementById("timeSaved");
const timeSavedValue = document.getElementById("timeSavedValue");
const timeBrush = document.getElementById("timeBrush");
const successModal = document.getElementById("successModal");
const closeSuccess = document.getElementById("closeSuccess");
const introPanel = document.querySelector(".intro-panel");
const hero3d = document.querySelector(".hero-3d");

let currentStep = 0;

const taskPositions = {
  Bookings: [110, 32],
  Payments: [174, 68],
  "Parent messages": [178, 150],
  Reminders: [98, 188],
  "Student records": [38, 136],
  Attendance: [52, 62],
  Marketing: [146, 28],
  "Lesson planning": [34, 88]
};

function activeCard() {
  return cards[currentStep];
}

function fieldIsFilled(field) {
  if (field.type === "radio") {
    return Boolean(form.querySelector(`input[name="${field.name}"]:checked`));
  }
  if (field.type === "checkbox") return true;
  return field.value.trim().length > 0;
}

function validateCurrentStep() {
  const requiredFields = [...activeCard().querySelectorAll("[required]")];
  const valid = requiredFields.every(fieldIsFilled);
  activeCard().classList.toggle("has-error", !valid);
  formStatus.textContent = valid ? "" : "Please answer this question before moving on.";
  return valid;
}

function updateProgress() {
  cards.forEach((card, index) => {
    card.classList.toggle("active", index === currentStep);
  });

  const percent = ((currentStep + 1) / cards.length) * 100;
  progressBar.style.width = `${percent}%`;
  progressText.textContent = `Question ${currentStep + 1} of ${cards.length}`;
  backBtn.disabled = currentStep === 0;
  nextBtn.hidden = currentStep === cards.length - 1;
  submitBtn.hidden = currentStep !== cards.length - 1;
}

function selectedValues(name) {
  return [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value);
}

function updateTimeVisual() {
  const value = Number(timeSaved.value);
  timeSavedValue.textContent = value;
  timeBrush.style.width = `${value * 10}%`;
}

function updatePortrait() {
  const audience = form.querySelector('input[name="audience"]:checked')?.value;
  const tasks = selectedValues("adminTasks");
  const hours = Number(timeSaved.value);

  if (!audience && !tasks.length) {
    portraitText.textContent = "Choose a few answers and this space will reflect the shape of your studio day.";
    return;
  }

  const audienceText = audience ? `You teach ${audience.toLowerCase()}` : "Your studio";
  const taskText = tasks.length
    ? `, and ${tasks.slice(0, 3).join(", ").toLowerCase()} seem to be pulling attention away from teaching`
    : " has admin details that deserve a calmer system";
  const timeText = hours >= 7
    ? " That is a serious amount of creative energy to reclaim."
    : hours >= 4
      ? " Even a modest assistant could protect meaningful studio time."
      : " Small, careful automation might be the right starting point.";

  portraitText.textContent = `${audienceText}${taskText}. Saving around ${hours} hours each week would matter.${timeText}`;
  updateAdminMap(tasks, hours);
}

function updateAdminMap(tasks, hours) {
  if (!adminNodes || !adminPath) return;

  const activeTasks = tasks.length ? tasks : ["Bookings", "Payments", "Parent messages"];
  const points = activeTasks
    .map((task) => taskPositions[task])
    .filter(Boolean);
  const path = points.length
    ? `M110 110 ${points.map(([x, y]) => `L${x} ${y}`).join(" ")} Z`
    : "M110 110 L110 32 L174 68 L178 150 L98 188 L38 136 L52 62 Z";

  adminPath.setAttribute("d", path);
  adminPath.style.opacity = tasks.length ? "0.88" : "0.32";
  mapLabel.textContent = tasks.length ? `${tasks.length} admin pulls` : "studio";
  adminNodes.innerHTML = "";

  Object.entries(taskPositions).forEach(([task, [x, y]], index) => {
    const selected = tasks.includes(task);
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", selected ? String(7 + Math.min(hours, 8) * 0.42) : "4.5");
    circle.setAttribute("class", selected ? "map-node active" : "map-node");
    circle.style.animationDelay = `${index * 70}ms`;
    adminNodes.appendChild(circle);
  });
}

function formPayload() {
  const data = new FormData(form);
  return {
    audience: data.get("audience"),
    classSetup: data.get("classSetup"),
    adminTasks: selectedValues("adminTasks"),
    otherAdminTask: data.get("otherAdminTask"),
    timeSaved: Number(data.get("timeSaved")),
    worksWell: data.get("worksWell"),
    wish: data.get("wish"),
    name: data.get("name"),
    email: data.get("email"),
    submittedAt: new Date().toISOString()
  };
}

function encodedFormBody(payload) {
  const body = new URLSearchParams();
  body.set("form-name", "artTeacherFeedback");
  Object.entries(payload).forEach(([key, value]) => {
    body.set(key, Array.isArray(value) ? value.join(", ") : String(value ?? ""));
  });
  return body.toString();
}

function shouldUseNetlifyForms() {
  const localHosts = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);
  return form.dataset.netlify === "true" && !localHosts.has(window.location.hostname);
}

async function submitFeedback(payload) {
  if (shouldUseNetlifyForms()) {
    const response = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encodedFormBody(payload)
    });
    if (!response.ok) throw new Error("Could not save Netlify form response");
    return;
  }

  const response = await fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error("Could not save response");
}

function showSuccess() {
  successModal.classList.add("open");
  successModal.setAttribute("aria-hidden", "false");
}

function hideSuccess() {
  successModal.classList.remove("open");
  successModal.setAttribute("aria-hidden", "true");
}

nextBtn.addEventListener("click", () => {
  if (!validateCurrentStep()) return;
  currentStep = Math.min(currentStep + 1, cards.length - 1);
  formStatus.textContent = "";
  updateProgress();
});

backBtn.addEventListener("click", () => {
  currentStep = Math.max(currentStep - 1, 0);
  activeCard().classList.remove("has-error");
  formStatus.textContent = "";
  updateProgress();
});

form.addEventListener("input", () => {
  activeCard().classList.remove("has-error");
  formStatus.textContent = "";
  updateTimeVisual();
  updatePortrait();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!validateCurrentStep()) return;

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";
  formStatus.textContent = "";

  try {
    await submitFeedback(formPayload());

    form.reset();
    currentStep = 0;
    updateTimeVisual();
    updatePortrait();
    updateProgress();
    showSuccess();
  } catch (error) {
    formStatus.textContent = "Sorry, the note could not be saved. Please try again.";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Send my studio note";
  }
});

closeSuccess.addEventListener("click", hideSuccess);
successModal.addEventListener("click", (event) => {
  if (event.target === successModal) hideSuccess();
});

if (introPanel && hero3d) {
  introPanel.addEventListener("pointermove", (event) => {
    const rect = introPanel.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    hero3d.style.transform = `rotateX(${y * -5}deg) rotateY(${x * 7}deg) translate3d(${x * 10}px, ${y * 8}px, 0)`;
  });

  introPanel.addEventListener("pointerleave", () => {
    hero3d.style.transform = "";
  });
}

updateTimeVisual();
updateAdminMap([], Number(timeSaved.value));
updateProgress();
