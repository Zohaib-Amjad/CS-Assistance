document.addEventListener('DOMContentLoaded', () => {
  setupThemeToggle();
  setupAuthTabs();

  if (document.body.dataset.loggedIn === 'true') {
    loadDashboard();
  }

  attachAuthHandlers();
  attachModuleHandlers();
  attachAdminHandlers();
  attachFeedbackHandler();
});

function setupThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  const saved = localStorage.getItem('cyberguard-theme');
  if (saved === 'dark') {
    document.body.classList.add('dark');
    toggle.textContent = '☀️';
  }

  toggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('cyberguard-theme', isDark ? 'dark' : 'light');
    toggle.textContent = isDark ? '☀️' : '🌙';
  });
}

function setupAuthTabs() {
  const tabs = document.querySelectorAll('.auth-tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.target;
      document.querySelectorAll('.auth-body').forEach((panel) => {
        panel.classList.toggle('active', panel.id === targetId);
      });
      document.querySelectorAll('.auth-tab').forEach((item) => {
        item.classList.toggle('active', item === tab);
      });
    });
  });
}

function attachAuthHandlers() {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      await submitForm('/api/auth/login', loginForm);
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      await submitForm('/api/auth/signup', signupForm);
    });
  }
}

function attachModuleHandlers() {
  const emailForm = document.getElementById('emailForm');
  const passwordForm = document.getElementById('passwordForm');
  const urlForm = document.getElementById('urlForm');
  const chatForm = document.getElementById('chatForm');
  const quizForm = document.getElementById('quizForm');

  if (emailForm) {
    emailForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const result = await submitForm('/api/email-analyze', emailForm);
      renderResult('emailResult', result);
    });
  }

  if (passwordForm) {
    passwordForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const result = await submitForm('/api/password-check', passwordForm);
      renderResult('passwordResult', result);
    });
  }

  if (urlForm) {
    urlForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const result = await submitForm('/api/url-check', urlForm);
      renderResult('urlResult', result);
    });
  }

  if (chatForm) {
    chatForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(chatForm);
      const question = formData.get('question')?.toString().trim();
      if (!question) return;

      const chatMessages = document.getElementById('chatMessages');
      const userMessage = document.createElement('div');
      userMessage.className = 'message user';
      userMessage.textContent = question;
      chatMessages.appendChild(userMessage);
      chatForm.reset();

      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      const botMessage = document.createElement('div');
      botMessage.className = 'message bot';
      botMessage.textContent = data.reply || 'I could not respond right now.';
      chatMessages.appendChild(botMessage);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
  }

  if (quizForm) {
    quizForm.addEventListener('submit', (event) => {
      event.preventDefault();
      evaluateQuiz();
    });
  }
}

function attachFeedbackHandler() {
  const feedbackForm = document.getElementById('feedbackForm');
  if (!feedbackForm) return;

  feedbackForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const response = await submitForm('/api/feedback', feedbackForm);
    showToast(response.message || 'Feedback sent.');
    feedbackForm.reset();
  });
}

function attachAdminHandlers() {
  const adminQuizForm = document.getElementById('adminQuizForm');
  const adminTipForm = document.getElementById('adminTipForm');

  if (adminQuizForm) {
    adminQuizForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const response = await submitForm('/api/admin/quiz', adminQuizForm);
      showToast(response.message || 'Quiz added.');
      adminQuizForm.reset();
      loadDashboard();
    });
  }

  if (adminTipForm) {
    adminTipForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const response = await submitForm('/api/admin/tip', adminTipForm);
      showToast(response.message || 'Tip added.');
      adminTipForm.reset();
      loadDashboard();
    });
  }
}

async function loadDashboard() {
  try {
    const response = await fetch('/api/dashboard');
    const data = await response.json();

    if (!data.success) {
      showToast(data.message || 'Unable to load dashboard.');
      return;
    }

    const stats = data.stats;
    const totalChecksEl = document.getElementById('totalChecks');
    const safeChecksEl = document.getElementById('safeChecks');
    const suspiciousChecksEl = document.getElementById('suspiciousChecks');
    const dangerousChecksEl = document.getElementById('dangerousChecks');
    const phishingChecksEl = document.getElementById('phishingChecks');

    if (totalChecksEl) totalChecksEl.textContent = stats.totalChecks || 0;
    if (safeChecksEl) safeChecksEl.textContent = stats.safeChecks || 0;
    if (suspiciousChecksEl) suspiciousChecksEl.textContent = stats.suspiciousChecks || 0;
    if (dangerousChecksEl) dangerousChecksEl.textContent = stats.dangerousChecks || 0;
    if (phishingChecksEl) phishingChecksEl.textContent = stats.phishingChecks || 0;

    const dailyTipValue = document.getElementById('dailyTipValue');
    if (dailyTipValue) {
      dailyTipValue.textContent = data.dailyTip || 'No tip available.';
    }

    renderHistory(data.history || []);
    renderTips(data.tips || []);

    if (data.quiz && data.quiz.length) {
      saveQuizData(data.quiz);
      renderQuiz(data.quiz);
    }

    if (data.isAdmin) {
      renderFeedback(data.feedback || []);
    }
  } catch (error) {
    showToast('Dashboard could not be loaded.');
  }
}

function renderHistory(history) {
  const list = document.getElementById('historyList');
  if (!list) return;

  if (!history.length) {
    list.innerHTML = '<li><span>No activity yet.</span></li>';
    return;
  }

  list.innerHTML = history
    .map(
      (item) => `
        <li>
          <div>
            <strong>${item.module}</strong>
            <span>${item.result}</span>
          </div>
          <small>${new Date(item.created_at).toLocaleDateString()}</small>
        </li>
      `
    )
    .join('');
}

function renderTips(tips) {
  const tipList = document.getElementById('tipList');
  if (!tipList) return;

  tipList.innerHTML = '';

  if (!tips.length) {
    tipList.innerHTML = '<div class="tip-item">No tips available yet.</div>';
    return;
  }

  tips.forEach((tip) => {
    const div = document.createElement('div');
    div.className = 'tip-item';
    div.textContent = typeof tip === 'string' ? tip : tip.text || 'Tip not available.';
    tipList.appendChild(div);
  });
}

function renderQuiz(questions) {
  const container = document.getElementById('quizContainer');
  if (!container) return;

  container.innerHTML = questions
    .map(
      (question, idx) => `
        <div class="quiz-question">
          <h4>${idx + 1}. ${question.question}</h4>
          <div class="quiz-options">
            <label class="quiz-option"><input type="radio" name="q_${question.id}" value="1" required> A. ${question.option_a}</label>
            <label class="quiz-option"><input type="radio" name="q_${question.id}" value="2"> B. ${question.option_b}</label>
            <label class="quiz-option"><input type="radio" name="q_${question.id}" value="3"> C. ${question.option_c}</label>
            <label class="quiz-option"><input type="radio" name="q_${question.id}" value="4"> D. ${question.option_d}</label>
          </div>
        </div>
      `
    )
    .join('');
}

function evaluateQuiz() {
  const quizContainer = document.getElementById('quizContainer');
  const resultBox = document.getElementById('quizResult');

  if (!quizContainer || !resultBox) return;

  const questionBlocks = quizContainer.querySelectorAll('.quiz-question');
  const result = [];
  let score = 0;

  questionBlocks.forEach((block, idx) => {
    const radioButtons = block.querySelectorAll('input[type="radio"]');
    let selectedValue = null;
    radioButtons.forEach((radio) => {
      if (radio.checked) selectedValue = radio.value;
    });

    const questionData = JSON.parse(sessionStorage.getItem('quizData'))?.[idx];
    if (questionData && String(selectedValue) === String(questionData.correct_option)) {
      score += 1;
    }

    const explanation = questionData ? questionData.explanation : 'No explanation available.';
    result.push(
      `<div class="quiz-option-result"><strong>Q${idx + 1}:</strong> ${selectedValue ? 'Answered' : 'Not answered'} - ${questionData ? explanation : ''}</div>`
    );
  });

  resultBox.className = 'result-box';
  resultBox.innerHTML = `
    <strong>Score: ${score}/${questionBlocks.length}</strong><br />
    ${result.join('<br />')}
  `;
  resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderFeedback(feedback) {
  const feedbackList = document.getElementById('feedbackList');
  if (!feedbackList) return;

  if (!feedback.length) {
    feedbackList.innerHTML = '<div class="feedback-item">No feedback submitted yet.</div>';
    return;
  }

  feedbackList.innerHTML = feedback
    .map(
      (item) => `
        <div class="feedback-item">
          <strong>${item.name}</strong>
          <small>${item.email} • ${item.rating}/5</small>
          <p>${item.message}</p>
          <small>${new Date(item.created_at).toLocaleString()}</small>
        </div>
      `
    )
    .join('');
}

async function submitForm(endpoint, form) {
  const formData = new FormData(form);
  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    showToast(result.message || 'Request failed.');
    return result;
  }

  if (result.message) {
    showToast(result.message);
  }

  if (result.success && endpoint.includes('/auth/')) {
    window.location.reload();
  }

  return result;
}

function renderResult(targetId, result) {
  const resultBox = document.getElementById(targetId);
  if (!resultBox) return;

  const category = (result.category || '').toLowerCase();
  resultBox.className = `result-box ${category}`;

  if (result.success === false) {
    resultBox.classList.add('dangerous');
    resultBox.innerHTML = `<strong>Notice:</strong> ${result.reason}`;
    return;
  }

  let html = `<strong>${result.category || 'Result'}:</strong><br />${result.reason || ''}`;

  if (result.score !== undefined) {
    html += `<br /><br /><strong>Score:</strong> ${result.score}/100`;
  }

  if (result.weaknesses && result.weaknesses.length) {
    html += `<br /><strong>Weaknesses:</strong> ${result.weaknesses.join(' • ')}`;
  }

  if (result.suggestion) {
    html += `<br /><strong>Suggested password:</strong> ${result.suggestion}`;
  }

  if (result.matched_terms && result.matched_terms.length) {
    html += `<br /><strong>Detected terms:</strong> ${result.matched_terms.join(', ')}`;
  }

  resultBox.innerHTML = html;
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.remove('hidden');

  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    toast.classList.add('hidden');
  }, 2500);
}

function saveQuizData(questions) {
  sessionStorage.setItem('quizData', JSON.stringify(questions));
}
