// ========================================
// TgAuto Admin — Liquid Glass UI
// ========================================

const demoData = {
    7: {
        labels: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
        values: [820, 1120, 950, 1480, 1260, 1740, 1122]
    },
    14: {
        labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14"],
        values: [500, 700, 650, 900, 800, 1100, 950, 1200, 1000, 1400, 1250, 1600, 1350, 1700]
    },
    30: {
        labels: ["1", "4", "7", "10", "13", "16", "19", "22", "25", "28", "30"],
        values: [450, 600, 550, 900, 750, 1100, 950, 1350, 1200, 1550, 1700]
    }
};

const events = [
    {
        type: "message",
        icon: "✉",
        title: "Новое сообщение сохранено",
        description: "Александр отправил сообщение",
        time: "2 минуты назад"
    },
    {
        type: "edit",
        icon: "↻",
        title: "Сообщение отредактировано",
        description: "Пользователь изменил сообщение",
        time: "8 минут назад"
    },
    {
        type: "delete",
        icon: "⌫",
        title: "Сообщение удалено",
        description: "Удалённое сообщение сохранено в архиве",
        time: "15 минут назад"
    },
    {
        type: "message",
        icon: "✉",
        title: "Новое подключение",
        description: "Подключён новый Business-аккаунт",
        time: "24 минуты назад"
    }
];

// ========================================
// ЭЛЕМЕНТЫ
// ========================================

const chartArea = document.getElementById("chart-area");
const chartLine = document.getElementById("chart-line-path");
const chartLabels = document.getElementById("chart-labels");
const chartTotal = document.getElementById("chart-total");
const chartTooltip = document.getElementById("chart-tooltip");

const modeSwitch = document.getElementById("mode-switch");
const modeLabel = document.getElementById("mode-label");
const modeIndicator = document.querySelector(".mode-indicator");
const apiWarning = document.getElementById("api-warning");

const periodDropdown = document.getElementById("period-dropdown");
const periodButton = document.getElementById("period-button");
const periodLabel = document.getElementById("period-label");
const periodMenu = document.getElementById("period-menu");

let currentMode = "demo";
let currentPeriod = 7;

// ========================================
// ГРАФИК
// ========================================

function renderChart(period = 7) {
    const data = demoData[period];

    if (!data) return;

    currentPeriod = Number(period);

    const width = 800;
    const height = 220;
    const left = 12;
    const right = 12;
    const top = 20;
    const bottom = 15;

    const maxValue = Math.max(...data.values) * 1.15;
    const step = (width - left - right) / (data.values.length - 1);

    const points = data.values.map((value, index) => {
        const x = left + index * step;
        const y = height - bottom -
            (value / maxValue) * (height - top - bottom);

        return { x, y, value };
    });

    let linePath = "";

    points.forEach((point, index) => {
        linePath += `${index === 0 ? "M" : "L"} ${point.x} ${point.y} `;
    });

    const areaPath =
        linePath +
        `L ${points[points.length - 1].x} ${height - bottom} ` +
        `L ${points[0].x} ${height - bottom} Z`;

    // Небольшая анимация смены графика
    chartLine.style.opacity = "0";
    chartArea.style.opacity = "0";

    setTimeout(() => {
        chartLine.setAttribute("d", linePath);
        chartArea.setAttribute("d", areaPath);

        chartLine.style.opacity = "1";
        chartArea.style.opacity = "1";
    }, 120);

    chartLabels.innerHTML = data.labels
        .map(label => `<span>${label}</span>`)
        .join("");

    const total = data.values.reduce((sum, value) => sum + value, 0);

    chartTotal.textContent = total.toLocaleString("ru-RU");

    // Точки графика
    const chart = document.getElementById("activity-chart");

    chart.querySelectorAll(".chart-point").forEach(point => point.remove());

    points.forEach((point, index) => {
        const dot = document.createElement("div");

        dot.className = "chart-point";

        Object.assign(dot.style, {
            position: "absolute",
            left: `${point.x / width * 100}%`,
            top: `${point.y / height * 100}%`,
            width: "9px",
            height: "9px",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            background: "#b49aff",
            border: "2px solid #171723",
            cursor: "pointer",
            zIndex: "2",
            opacity: "0"
        });

        setTimeout(() => {
            dot.style.transition = "opacity .3s ease";
            dot.style.opacity = "1";
        }, index * 35);

        dot.addEventListener("mouseenter", () => {
            chartTooltip.style.display = "block";

            chartTooltip.textContent =
                `${point.value.toLocaleString("ru-RU")} сообщений`;

            chartTooltip.style.left = `${point.x / width * 100}%`;
            chartTooltip.style.top = `${point.y / height * 100}%`;
        });

        dot.addEventListener("mouseleave", () => {
            chartTooltip.style.display = "none";
        });

        chart.appendChild(dot);
    });
}

// ========================================
// ВЫПАДАЮЩЕЕ МЕНЮ ПЕРИОДА
// ========================================

function closePeriodMenu() {
    periodDropdown.classList.remove("open");
    periodButton.setAttribute("aria-expanded", "false");
}

periodButton.addEventListener("click", event => {
    event.stopPropagation();

    const isOpen = periodDropdown.classList.toggle("open");

    periodButton.setAttribute("aria-expanded", String(isOpen));
});

periodMenu.addEventListener("click", event => {
    const option = event.target.closest(".period-option");

    if (!option) return;

    const period = Number(option.dataset.period);

    currentPeriod = period;

    periodLabel.textContent = `Последние ${period} дней`;

    document.querySelectorAll(".period-option").forEach(item => {
        item.classList.toggle("active", item === option);
    });

    closePeriodMenu();

    if (currentMode === "demo") {
        renderChart(period);
    }
});

document.addEventListener("click", event => {
    if (!periodDropdown.contains(event.target)) {
        closePeriodMenu();
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closePeriodMenu();
    }
});

// ========================================
// СОБЫТИЯ
// ========================================

function renderEvents() {
    const container = document.getElementById("events-list");

    container.innerHTML = events.map(event => `
        <div class="event">
            <div class="event-icon ${event.type}">
                ${event.icon}
            </div>

            <div class="event-text">
                <strong>${event.title}</strong>
                <span>${event.description}</span>
            </div>

            <div class="event-time">${event.time}</div>
        </div>
    `).join("");
}

// ========================================
// СТРАНИЦЫ
// ========================================

const pages = {
    dashboard: {
        title: "Главная",
        description: "Добро пожаловать в панель управления TgAuto.",
        icon: "◫",
        heading: "Раздел в разработке",
        text: "Здесь появится подробная информация о системе."
    },

    archive: {
        title: "Архив сообщений",
        description: "Просмотр сохранённых переписок и изменений.",
        icon: "▤",
        heading: "Архив сообщений",
        text: "Здесь появятся переписки, история редактирования и удалённые сообщения."
    },

    users: {
        title: "Пользователи",
        description: "Управление подключёнными аккаунтами.",
        icon: "♙",
        heading: "Пользователи",
        text: "Здесь появится список Business-подключений."
    },

    blocks: {
        title: "Блокировки",
        description: "Управление доступом пользователей.",
        icon: "⊘",
        heading: "Управление блокировками",
        text: "Здесь появится список заблокированных пользователей."
    },

    settings: {
        title: "Настройки",
        description: "Настройка источника данных и параметров панели.",
        icon: "⚙",
        heading: "Настройки панели",
        text: "Здесь будут находиться настройки подключения и интерфейса."
    }
};

function openPage(page) {
    const info = pages[page];

    if (!info) return;

    document.querySelectorAll(".nav-item").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === page
        );
    });

    document.getElementById("breadcrumb").textContent = info.title;
    document.getElementById("page-title").textContent = info.title;
    document.getElementById("page-description").textContent = info.description;

    const isDashboard = page === "dashboard";

    document.getElementById("dashboard-page")
        .classList.toggle("hidden", !isDashboard);

    document.getElementById("other-page")
        .classList.toggle("hidden", isDashboard);

    document.getElementById("empty-icon").textContent = info.icon;
    document.getElementById("empty-title").textContent = info.heading;
    document.getElementById("empty-description").textContent = info.text;

    document.body.classList.toggle("dashboard-active", isDashboard);

    closePeriodMenu();
}

document.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", () => {
        openPage(button.dataset.page);
    });
});

// ========================================
// РЕЖИМЫ ДАННЫХ
// ========================================

function setMode(mode) {
    currentMode = mode;

    const isApi = mode === "api";

    modeSwitch.classList.toggle("enabled", isApi);

    modeLabel.textContent = isApi
        ? "Режим API"
        : "Тестовый режим";

    modeIndicator.style.background = isApi
        ? "#42d6a0"
        : "#e9ae54";

    apiWarning.classList.toggle("hidden", !isApi);

    document.querySelectorAll("[data-demo]").forEach(element => {
        element.textContent = isApi
            ? "—"
            : element.dataset.demo;
    });

    if (isApi) {
        chartTotal.textContent = "—";
        chartLine.setAttribute("d", "");
        chartArea.setAttribute("d", "");
        chartLabels.innerHTML = "";

        document.querySelectorAll(".chart-point").forEach(point => {
            point.remove();
        });
    } else {
        renderChart(currentPeriod);
    }

    localStorage.setItem("tgauto-mode", mode);
}

modeSwitch.addEventListener("click", () => {
    setMode(currentMode === "demo" ? "api" : "demo");
});

// ========================================
// ОБНОВЛЕНИЕ
// ========================================

document.getElementById("refresh-button").addEventListener("click", () => {
    const button = document.getElementById("refresh-button");

    if (button.classList.contains("loading")) return;

    button.classList.add("loading");

    setTimeout(() => {
        button.classList.remove("loading");

        if (currentMode === "demo") {
            renderChart(currentPeriod);
            renderEvents();
        }
    }, 550);
});

// ========================================
// ДАТА
// ========================================

function updateDate() {
    const date = new Date();

    document.getElementById("current-date").textContent =
        date.toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
}

// ========================================
// ЗАПУСК
// ========================================

renderChart(7);
renderEvents();
updateDate();

document.body.classList.add("dashboard-active");

const savedMode = localStorage.getItem("tgauto-mode");

if (savedMode === "api") {
    setMode("api");
} else {
    setMode("demo");
}