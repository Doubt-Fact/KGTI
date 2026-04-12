/**
 * KGTI 考古人格分析 - 前端逻辑
 */

// ==================== 状态管理 ====================
let questions = [];       // 题目数据
let personalities = [];   // 人格数据
let announcement = '';    // 公告内容
let currentIndex = 0;     // 当前题号(0-based)
let answers = {};         // { questionId: selectedOptionIndex }
let hasTriggeredHiddenEgg = false; // 是否触发隐藏彩蛋

// ==================== DOM 元素缓存 ====================
const elements = {};

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    bindEvents();
    loadData();
});

// 缓存DOM元素
function cacheElements() {
    elements.modal = document.getElementById('announcement-modal');
    elements.announcementText = document.getElementById('announcement-text');
    elements.btnKnow = document.getElementById('btn-know');
    elements.btnStart = document.getElementById('btn-start');
    elements.btnRestart = document.getElementById('btn-restart');
    elements.btnGalleryFromResult = document.getElementById('btn-gallery-from-result');
    elements.btnBack = document.getElementById('btn-back');
    elements.progressBar = document.getElementById('progress-bar');
    elements.questionNumber = document.getElementById('question-number');
    elements.questionText = document.getElementById('question-text');
    elements.optionsContainer = document.getElementById('options-container');
    elements.resultName = document.getElementById('result-name');
    elements.resultNickname = document.getElementById('result-nickname');
    elements.resultDescription = document.getElementById('result-description');
    elements.subTendency = document.getElementById('sub-tendency');
    elements.subTendencyName = document.getElementById('sub-tendency-name');
    elements.galleryCards = document.getElementById('gallery-cards');
    elements.progressBarContainer = document.querySelector('.progress-bar-container');
}

// 绑定事件
function bindEvents() {
    elements.btnKnow.addEventListener('click', closeAnnouncement);
    elements.btnStart.addEventListener('click', startQuiz);
    elements.btnRestart.addEventListener('click', restartQuiz);
    elements.btnGalleryFromResult.addEventListener('click', () => showGallery('result'));
    elements.btnBack.addEventListener('click', goBackFromGallery);
    elements.progressBarContainer.addEventListener('click', handleProgressBarClick);
}

// ==================== 数据加载 ====================
async function loadData() {
    try {
        const [announcementRes, questionsRes, personalitiesRes] = await Promise.all([
            fetch('/api/announcement'),
            fetch('/api/questions'),
            fetch('/api/personalities')
        ]);

        const announcementData = await announcementRes.json();
        questions = await questionsRes.json();
        const personalityData = await personalitiesRes.json();

        // 处理公告数据
        announcement = announcementData.text || announcementData.content || announcementData;
        elements.announcementText.innerHTML = formatAnnouncement(announcement);

        // 处理人格数据
        personalities = personalityData.personalities || [];

    } catch (error) {
        console.error('数据加载失败:', error);
        elements.announcementText.textContent = '数据加载失败，请刷新页面重试。';
    }
}

// 格式化公告内容（支持换行）
function formatAnnouncement(text) {
    return text.replace(/\n/g, '<br>');
}

// ==================== 页面切换 ====================
function showSection(id) {
    // 隐藏所有section
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // 显示指定section
    const targetSection = document.getElementById(id);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== 公告弹窗 ====================
function closeAnnouncement() {
    elements.modal.classList.remove('active');
    showSection('home');
}

// ==================== 答题流程 ====================
function startQuiz() {
    currentIndex = 0;
    answers = {};
    showSection('quiz');
    renderQuestion(0);
}

function renderQuestion(index) {
    currentIndex = index;
    const question = questions[index];

    if (!question) return;

    // 更新进度条
    const progress = ((index + 1) / questions.length) * 100;
    elements.progressBar.style.width = `${progress}%`;

    // 更新题号
    elements.questionNumber.textContent = `${index + 1}/${questions.length}`;

    // 更新题目文字
    elements.questionText.textContent = question.question;

    // 渲染选项
    renderOptions(question);
}

function renderOptions(question) {
    elements.optionsContainer.innerHTML = '';

    question.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.dataset.index = index;

        // 如果该题已有答案，标记已选状态
        if (answers[question.id] === index) {
            btn.classList.add('selected');
        }

        btn.innerHTML = `
            <span class="option-label">${option.label}</span>
            <span class="option-text">${option.text}</span>
        `;

        btn.addEventListener('click', () => selectOption(question.id, index));
        elements.optionsContainer.appendChild(btn);
    });
}

function selectOption(questionId, optionIndex) {
    // 记录答案
    answers[questionId] = optionIndex;

    // 更新选中样式
    const buttons = elements.optionsContainer.querySelectorAll('.option-btn');
    buttons.forEach((btn, idx) => {
        if (idx === optionIndex) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });

    // 延迟后跳转下一题或显示结果
    setTimeout(() => {
        if (currentIndex < questions.length - 1) {
            renderQuestion(currentIndex + 1);
        } else {
            calculateResult();
        }
    }, 400);
}

// 进度条点击回退
function handleProgressBarClick(e) {
    const rect = elements.progressBarContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const targetIndex = Math.floor(percentage * questions.length);

    // 只能回退到已回答的题目
    if (targetIndex < currentIndex) {
        renderQuestion(targetIndex);
    }
}

// ==================== 人格计算算法 ====================
function calculateResult() {
    // 1. 初始化得分对象
    const scores = {};

    // 2. 遍历所有答案，累加得分
    for (const [qId, optIdx] of Object.entries(answers)) {
        const question = questions.find(q => q.id === parseInt(qId));
        if (!question) continue;

        const option = question.options[optIdx];
        if (!option || !option.scores) continue;

        for (const [personality, score] of Object.entries(option.scores)) {
            scores[personality] = (scores[personality] || 0) + score;
        }
    }

    // 3. 隐藏彩蛋优先判断
    if (scores['退坑隐士'] && scores['退坑隐士'] >= 5) {
        hasTriggeredHiddenEgg = true;
        showResult('退坑隐士', null);
        return;
    }

    // 4. 普通人格判断（排除退坑隐士）
    const sorted = Object.entries(scores)
        .filter(([name]) => name !== '退坑隐士')
        .sort((a, b) => b[1] - a[1]);

    if (sorted.length === 0) {
        // 如果没有得分，默认显示第一个普通人格
        const defaultPersonality = personalities.find(p => !p.hidden);
        if (defaultPersonality) {
            showResult(defaultPersonality.name, null);
        }
        return;
    }

    const mainPersonality = sorted[0][0];
    const subTendency = sorted.length > 1 ? sorted[1][0] : null;

    showResult(mainPersonality, subTendency);
}

// ==================== 结果展示 ====================
function showResult(mainName, subName) {
    const main = personalities.find(p => p.name === mainName);

    if (!main) {
        console.error('未找到人格:', mainName);
        return;
    }

    // 填充结果
    elements.resultName.textContent = main.name;
    elements.resultNickname.textContent = main.nickname;
    elements.resultDescription.textContent = main.description;

    // 特殊彩蛋样式
    if (main.hidden) {
        elements.resultName.classList.add('hidden-egg');
    } else {
        elements.resultName.classList.remove('hidden-egg');
    }

    // 辅倾向
    if (subName) {
        elements.subTendency.style.display = 'block';
        elements.subTendencyName.textContent = subName;
    } else {
        elements.subTendency.style.display = 'none';
    }

    showSection('result');
}

// ==================== 重新测试 ====================
function restartQuiz() {
    currentIndex = 0;
    answers = {};
    hasTriggeredHiddenEgg = false;
    showSection('home');
}

// ==================== 人格图鉴 ====================
let galleryBackTarget = 'home';

function showGallery(from) {
    galleryBackTarget = from;
    renderGallery();
    showSection('gallery');
}

function renderGallery() {
    elements.galleryCards.innerHTML = '';

    personalities.forEach(personality => {
        // 默认只显示非隐藏人格
        // 如果触发了隐藏彩蛋，也显示退坑隐士
        if (personality.hidden && !(personality.name === '退坑隐士' && hasTriggeredHiddenEgg)) {
            return;
        }

        const card = document.createElement('div');
        card.className = 'gallery-card';
        if (personality.hidden) {
            card.classList.add('hidden-personality');
        }

        card.innerHTML = `
            <div class="gallery-card-name">${personality.name}</div>
            <div class="gallery-card-nickname">${personality.nickname}</div>
            <div class="gallery-card-description">${personality.description}</div>
        `;

        elements.galleryCards.appendChild(card);
    });
}

function goBackFromGallery() {
    if (galleryBackTarget === 'result') {
        showSection('result');
    } else {
        showSection('home');
    }
}
