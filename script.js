/* =========================================================
   SAFAR — TAXI ONLINE
   script.js
========================================================= */

"use strict";

/* =========================
   APP STATE
========================= */

const state = {
    currentScreen: "screen-home",

    selectedPayment: "humo",
    selectedService: "econom",

    subscriptionActive: false,
    subscriptionDate: null,
    subscriptionExpiry: null,

    orderActive: false,
    orderCreated: false,
    tripNumber: null,

    destinationIndex: 0,

    notificationsEnabled: true,
    darkMode: false,

    language: "tg"
};


/* =========================
   DESTINATIONS
========================= */

const destinations = [
    "Маркази шаҳр",
    "Клуб",
    "Боғи Рӯдакӣ",
    "Маркази савдо",
    "Донишгоҳ",
    "Хонаи дӯст",
    "Кафе"
];


/* =========================
   HELPERS
========================= */

function $(selector) {
    return document.querySelector(selector);
}

function $all(selector) {
    return document.querySelectorAll(selector);
}


/* =========================
   SCREEN SYSTEM
========================= */

function showScreen(screenId) {

    const screens = $all(".screen");

    screens.forEach(screen => {
        screen.classList.remove("active");
    });

    const target = document.getElementById(screenId);

    if (!target) {
        console.warn("Screen not found:", screenId);
        return;
    }

    target.classList.add("active");

    state.currentScreen = screenId;

    updateBottomNavigation(screenId);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================
   HOME
========================= */

function goHome() {
    showScreen("screen-home");
}


/* =========================
   SUBSCRIPTION
========================= */

function openSubscription() {
    showScreen("screen-subscription");
}


function openOrder() {

    checkSubscription();

    if (!state.subscriptionActive) {

        showToast(
            "Аввал обунаи SAFAR-ро фаъол кунед"
        );

        showScreen("screen-subscription");

        return;
    }

    showScreen("screen-order");
}


/* =========================
   PAYMENT METHOD
========================= */

function selectPayment(method) {

    state.selectedPayment = method;

    $all(".payment-method").forEach(item => {
        item.classList.remove("selected");
    });

    const selected = document.querySelector(
        `[data-payment="${method}"]`
    );

    if (selected) {
        selected.classList.add("selected");
    }
}


/* =========================
   PAYMENT
========================= */

function paySubscription() {

    if (!state.selectedPayment) {

        showToast(
            "Усули пардохтро интихоб кунед"
        );

        return;
    }

    openPaymentModal();
}


function openPaymentModal() {

    const modal = $("#modal");

    if (!modal) return;

    modal.innerHTML = `

        <div class="modal-content">

            <div class="modal-header">

                <h3>
                    Тасдиқи пардохт
                </h3>

                <button
                    class="modal-close"
                    onclick="closeModal()"
                >
                    ✕
                </button>

            </div>

            <p
                style="
                    font-size:14px;
                    color:#777;
                    line-height:1.7;
                    margin-bottom:18px;
                "
            >

                Обунаи моҳонаи SAFAR:

                <strong
                    style="color:#111;"
                >
                    2 сомонӣ
                </strong>

            </p>

            <div
                class="badge badge-green"
                style="margin-bottom:15px;"
            >
                ● Усули интихобшуда:
                ${getPaymentName()}
            </div>

            <button
                class="yellow-btn"
                onclick="finishSubscriptionPayment()"
            >
                Пардохтро тасдиқ кардан
            </button>

            <div style="height:10px;"></div>

            <button
                class="secondary-btn"
                onclick="closeModal()"
            >
                Бекор кардан
            </button>

        </div>
    `;

    modal.classList.add("active");
}


function getPaymentName() {

    const names = {

        humo: "Хумо",

        bank: "Корти бонкӣ",

        alif: "Alif Pay",

        eskhata: "Эсхата",

        click: "Click"
    };

    return names[state.selectedPayment]
        || "Пардохт";
}


/* =========================
   FINISH PAYMENT
========================= */

function finishSubscriptionPayment() {

    const now = new Date();

    const expiry = new Date(now);

    expiry.setMonth(
        expiry.getMonth() + 1
    );

    state.subscriptionActive = true;

    state.subscriptionDate =
        now.toISOString();

    state.subscriptionExpiry =
        expiry.toISOString();

    saveState();

    closeModal();

    updateSubscriptionUI();

    showScreen(
        "screen-payment-success"
    );

    setTimeout(() => {

        showToast(
            "Обуна бомуваффақият фаъол шуд"
        );

    }, 500);
}


/* =========================
   CHECK SUBSCRIPTION
========================= */

function checkSubscription() {

    if (
        !state.subscriptionActive ||
        !state.subscriptionExpiry
    ) {
        return;
    }

    const expiry =
        new Date(
            state.subscriptionExpiry
        );

    const now = new Date();

    if (now >= expiry) {

        state.subscriptionActive = false;

        saveState();

        updateSubscriptionUI();

        showToast(
            "Мӯҳлати обуна ба охир расид"
        );
    }
}


/* =========================
   DATE
========================= */

function formatDate(dateString) {

    if (!dateString) {
        return "—";
    }

    const date =
        new Date(dateString);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "—";
    }

    return date.toLocaleDateString(
        "tg-TJ",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}


/* =========================
   SUBSCRIPTION UI
========================= */

function updateSubscriptionUI() {

    checkSubscription();

    const statusElements =
        $all(".subscription-status");

    statusElements.forEach(el => {

        if (state.subscriptionActive) {

            el.textContent =
                "Фаъол";

            el.classList.add(
                "active"
            );

        } else {

            el.textContent =
                "Ғайрифаъол";

            el.classList.remove(
                "active"
            );
        }
    });


    const dateElements =
        $all(".subscription-expiry");

    dateElements.forEach(el => {

        el.textContent =
            state.subscriptionActive

                ? formatDate(
                    state.subscriptionExpiry
                )

                : "—";
    });


    const profileSubscription =
        $(".profile-subscription");

    if (profileSubscription) {

        profileSubscription.style.display =
            state.subscriptionActive
                ? "block"
                : "none";
    }
}


/* =========================
   DESTINATION
========================= */

function changeDestination() {

    state.destinationIndex =
        (
            state.destinationIndex + 1
        ) % destinations.length;

    const destination =
        destinations[
            state.destinationIndex
        ];


    const elements =
        $all(".destination-value");

    elements.forEach(el => {

        el.textContent =
            destination;
    });


    showToast(
        `Мақсад: ${destination}`
    );
}


/* =========================
   SERVICE
========================= */

function selectService(service) {

    state.selectedService =
        service;


    $all(".service-card")
        .forEach(card => {

            card.classList.remove(
                "selected"
            );
        });


    const selected =
        document.querySelector(
            `[data-service="${service}"]`
        );


    if (selected) {

        selected.classList.add(
            "selected"
        );
    }


    const names = {

        econom: "Эконом",

        comfort: "Комфорт",

        business: "Бизнес"
    };


    showToast(
        `Хизмат интихоб шуд: ${
            names[service] || service
        }`
    );
}


/* =========================
   CREATE TAXI ORDER
========================= */

function createOrder() {

    checkSubscription();

    if (!state.subscriptionActive) {

        showToast(
            "Барои фармоиш аввал обуна фаъол кунед"
        );

        showScreen(
            "screen-subscription"
        );

        return;
    }


    const tripNumber =
        Math.floor(
            100 + Math.random() * 900
        );


    state.tripNumber =
        tripNumber;

    state.orderActive =
        true;

    state.orderCreated =
        true;


    saveState();


    showScreen(
        "screen-active-trip"
    );


    updateTripUI();


    showToast(
        `Фармоиш №${tripNumber} қабул шуд`
    );


    setTimeout(() => {

        const status =
            $(".trip-status");

        if (
            status &&
            state.orderActive
        ) {

            status.textContent =
                "Ронанда ба тарафи шумо ҳаракат дорад";
        }

    }, 2500);
}


/* =========================
   TRIP UI
========================= */

function updateTripUI() {

    const elements =
        $all(".trip-number");


    elements.forEach(el => {

        el.textContent =
            state.tripNumber

                ? `№${state.tripNumber}`

                : "—";
    });
}


/* =========================
   CANCEL ORDER
========================= */

function cancelOrder() {

    if (!state.orderActive) {

        showToast(
            "Фармоиши фаъол вуҷуд надорад"
        );

        return;
    }


    const confirmed =
        window.confirm(
            "Оё мехоҳед фармоишро бекор кунед?"
        );


    if (!confirmed) {
        return;
    }


    state.orderActive =
        false;

    state.orderCreated =
        false;


    saveState();


    showToast(
        "Фармоиш бекор карда шуд"
    );


    showScreen(
        "screen-home"
    );
}


/* =========================
   OTHER SCREENS
========================= */

function openTrips() {

    showScreen(
        "screen-trips"
    );
}


function openProfile() {

    showScreen(
        "screen-profile"
    );
}


function openMySubscription() {

    showScreen(
        "screen-my-subscription"
    );
}


function openSupport() {

    showScreen(
        "screen-support"
    );
}


/* =========================
   MODAL
========================= */

function openModal(
    title,
    content
) {

    const modal =
        $("#modal");

    if (!modal) return;


    modal.innerHTML = `

        <div class="modal-content">

            <div class="modal-header">

                <h3>
                    ${title}
                </h3>

                <button
                    class="modal-close"
                    onclick="closeModal()"
                >
                    ✕
                </button>

            </div>

            <div>
                ${content}
            </div>

        </div>
    `;


    modal.classList.add(
        "active"
    );
}


function closeModal() {

    const modal =
        $("#modal");

    if (!modal) return;

    modal.classList.remove(
        "active"
    );
}


/* =========================
   SUPPORT CHAT
========================= */

function openChat() {

    openModal(
        "Чати дастгирӣ",

        `

        <p
            style="
                font-size:14px;
                color:#777;
                line-height:1.7;
                margin-bottom:15px;
            "
        >
            Саволи худро нависед.
            Дастгирии SAFAR ба шумо ҷавоб медиҳад.
        </p>

        <textarea
            id="support-message"
            class="form-control"
            placeholder="Паёми шумо..."
        ></textarea>

        <div style="height:12px;"></div>

        <button
            class="yellow-btn"
            onclick="sendSupportMessage()"
        >
            Фиристодан
        </button>

        `
    );
}


function sendSupportMessage() {

    const input =
        $("#support-message");


    if (
        !input ||
        !input.value.trim()
    ) {

        showToast(
            "Паёмро нависед"
        );

        return;
    }


    closeModal();


    showToast(
        "Паём фиристода шуд"
    );
}


/* =========================
   SUPPORT CALL
========================= */

function callSupport() {

    openModal(
        "Дастгирии SAFAR",

        `

        <p
            style="
                font-size:14px;
                color:#777;
                line-height:1.7;
            "
        >
            Барои кӯмак метавонед
            бо оператори SAFAR тамос гиред.
        </p>

        <div style="height:15px;"></div>

        <a
            href="tel:+992000000000"
            class="yellow-btn"
            style="
                display:flex;
                align-items:center;
                justify-content:center;
                text-decoration:none;
                color:#111;
            "
        >
            📞 Занг задан
        </a>

        `
    );
}


/* =========================
   FAQ
========================= */

function openFAQ() {

    openModal(
        "Саволҳои маъмул",

        `

        <div
            style="
                display:grid;
                gap:10px;
            "
        >

            <div class="support-card">

                <strong>
                    Чӣ тавр таксӣ фармоиш диҳам?
                </strong>

                <p>
                    Обунаро фаъол кунед,
                    ҷойи рафтан ва мақсадро интихоб кунед,
                    сипас хизматро интихоб карда фармоиш диҳед.
                </p>

            </div>


            <div class="support-card">

                <strong>
                    Обуна чанд пул аст?
                </strong>

                <p>
                    Обунаи моҳонаи SAFAR —
                    2 сомонӣ.
                </p>

            </div>


            <div class="support-card">

                <strong>
                    Чӣ тавр фармоишро бекор кунам?
                </strong>

                <p>
                    Дар экрани сафари фаъол
                    тугмаи бекоркуниро истифода баред.
                </p>

            </div>

        </div>

        `
    );
}


/* =========================
   NOTIFICATIONS
========================= */

function toggleNotifications() {

    if (!state.notificationsEnabled) {

        showToast(
            "Огоҳиномаҳо хомӯшанд"
        );

        return;
    }


    const panel =
        $("#notification-panel");

    if (!panel) return;


    panel.classList.toggle(
        "active"
    );
}


/* =========================
   MENU
========================= */

function toggleMenu() {

    const menu =
        $("#menu-overlay");

    if (!menu) return;


    menu.classList.toggle(
        "active"
    );
}


function closeMenu() {

    const menu =
        $("#menu-overlay");

    if (!menu) return;


    menu.classList.remove(
        "active"
    );
}


/* =========================
   SETTINGS
========================= */

function toggleNotificationsSetting() {

    state.notificationsEnabled =
        !state.notificationsEnabled;


    saveState();


    showToast(

        state.notificationsEnabled

            ? "Огоҳиномаҳо фаъол шуданд"

            : "Огоҳиномаҳо хомӯш шуданд"
    );
}


function toggleDarkMode() {

    state.darkMode =
        !state.darkMode;


    document.body.classList.toggle(
        "dark-mode",
        state.darkMode
    );


    saveState();


    showToast(

        state.darkMode

            ? "Ҳолати торик фаъол шуд"

            : "Ҳолати равшан фаъол шуд"
    );
}


/* =========================
   LANGUAGE
========================= */

function changeLanguage() {

    const languages = [
        "tg",
        "ru",
        "en"
    ];


    const currentIndex =
        languages.indexOf(
            state.language
        );


    state.language =
        languages[
            (currentIndex + 1)
            % languages.length
        ];


    saveState();


    const names = {

        tg: "Тоҷикӣ",

        ru: "Русский",

        en: "English"
    };


    showToast(
        `Забон: ${names[state.language]}`
    );
}


/* =========================
   ABOUT
========================= */

function openAbout() {

    openModal(
        "Дар бораи SAFAR",

        `

        <p
            style="
                font-size:14px;
                color:#777;
                line-height:1.7;
            "
        >

            <strong
                style="color:#111;"
            >
                SAFAR
            </strong>

            — платформаи замонавии
            фармоиши таксӣ.

            Интерфейси зуд,
            қулай ва касбӣ барои
            муштариён.

        </p>

        <div style="height:15px;"></div>

        <div class="badge badge-green">
            ● SAFAR онлайн
        </div>

        `
    );
}


/* =========================
   LOGOUT
========================= */

function logout() {

    const confirmed =
        window.confirm(
            "Оё мехоҳед аз аккаунт бароед?"
        );


    if (!confirmed) {
        return;
    }


    showToast(
        "Шумо аз аккаунт баромадед"
    );


    goHome();
}


/* =========================
   BOTTOM NAVIGATION
========================= */

function updateBottomNavigation(
    screenId
) {

    $all(".nav-item")
        .forEach(item => {

            item.classList.remove(
                "active"
            );
        });


    if (
        screenId ===
        "screen-home"
    ) {

        const home =
            document.querySelector(
                '[data-nav="home"]'
            );

        if (home) {
            home.classList.add(
                "active"
            );
        }
    }


    if (
        screenId ===
        "screen-trips"
    ) {

        const trips =
            document.querySelector(
                '[data-nav="trips"]'
            );

        if (trips) {
            trips.classList.add(
                "active"
            );
        }
    }


    if (
        screenId ===
        "screen-profile"
    ) {

        const profile =
            document.querySelector(
                '[data-nav="profile"]'
            );

        if (profile) {
            profile.classList.add(
                "active"
            );
        }
    }
}


/* =========================
   TOAST
========================= */

function showToast(
    message
) {

    const toast =
        $("#toast");

    if (!toast) return;


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        window.toastTimer
    );


    window.toastTimer =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 2600);
}


/* =========================
   LOCAL STORAGE
========================= */

function saveState() {

    try {

        localStorage.setItem(
            "safarState",
            JSON.stringify(state)
        );

    } catch (error) {

        console.warn(
            "State save error:",
            error
        );
    }
}


function loadState() {

    try {

        const saved =
            localStorage.getItem(
                "safarState"
            );


        if (!saved) {
            return;
        }


        const parsed =
            JSON.parse(saved);


        Object.assign(
            state,
            parsed
        );

    } catch (error) {

        console.warn(
            "State load error:",
            error
        );
    }
}


/* =========================
   EVENT LISTENERS
========================= */

document.addEventListener(
    "click",
    event => {

        const paymentMethod =
            event.target.closest(
                ".payment-method"
            );


        if (paymentMethod) {

            const method =
                paymentMethod.dataset.payment;


            if (method) {

                selectPayment(
                    method
                );
            }
        }


        const serviceCard =
            event.target.closest(
                ".service-card"
            );


        if (serviceCard) {

            const service =
                serviceCard.dataset.service;


            if (service) {

                selectService(
                    service
                );
            }
        }
    }
);


/* =========================
   ESCAPE
========================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeModal();

            closeMenu();


            const panel =
                $("#notification-panel");


            if (panel) {

                panel.classList.remove(
                    "active"
                );
            }
        }
    }
);


/* =========================
   START APP
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadState();

        checkSubscription();

        updateSubscriptionUI();

        updateTripUI();

        applyDarkMode();

        goHome();

        console.log(
            "SAFAR application initialized"
        );
    }
);


/* =========================
   DARK MODE
========================= */

function applyDarkMode() {

    document.body.classList.toggle(
        "dark-mode",
        state.darkMode
    );
}


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.showScreen =
    showScreen;

window.goHome =
    goHome;

window.openSubscription =
    openSubscription;

window.openOrder =
    openOrder;

window.selectPayment =
    selectPayment;

window.paySubscription =
    paySubscription;

window.finishSubscriptionPayment =
    finishSubscriptionPayment;

window.changeDestination =
    changeDestination;

window.selectService =
    selectService;

window.createOrder =
    createOrder;

window.cancelOrder =
    cancelOrder;

window.openTrips =
    openTrips;

window.openProfile =
    openProfile;

window.openMySubscription =
    openMySubscription;

window.openSupport =
    openSupport;

window.openPaymentModal =
    openPaymentModal;

window.openModal =
    openModal;

window.closeModal =
    closeModal;

window.openChat =
    openChat;

window.sendSupportMessage =
    sendSupportMessage;

window.callSupport =
    callSupport;

window.openFAQ =
    openFAQ;

window.toggleNotifications =
    toggleNotifications;

window.toggleMenu =
    toggleMenu;

window.closeMenu =
    closeMenu;

window.toggleNotificationsSetting =
    toggleNotificationsSetting;

window.toggleDarkMode =
    toggleDarkMode;

window.changeLanguage =
    changeLanguage;

window.openAbout =
    openAbout;

window.logout =
    logout;

window.showToast =
    showToast;