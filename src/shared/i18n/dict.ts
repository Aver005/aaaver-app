export type Locale = 'ru' | 'en'

/** Строка в двух языках — для контента в entities */
export type L10n = Record<Locale, string>

const ru = {
    nav: {
        about: 'Обо мне',
        experience: 'Опыт',
        projects: 'Проекты',
        opensource: 'Open Source',
        stack: 'Стек',
        contact: 'Связаться',
        menuOpen: 'Открыть меню',
        menuClose: 'Закрыть меню',
        localeSwitch: 'Switch to English',
    },
    hero: {
        kicker: 'front-end · тимлид · fullstack',
        firstName: 'Артемий',
        lastName: 'Аверьянов',
        lede: 'Делаю быстрые и аккуратные интерфейсы, веду фронтенд-команду в продуктовой разработке и не представляю день без строчки кода.',
        ctaProjects: 'Смотреть проекты',
        ctaContact: 'Написать мне',
        status: 'открыт к интересным задачам',
        scroll: 'листайте',
    },
    about: {
        title: 'Обо мне',
        statementA: 'Интерфейс — это ремесло.',
        statementB: 'Собираю продукты от макета до продакшена и довожу детали до состояния, когда ими приятно пользоваться.',
        body: 'Сейчас веду фронтенд-разработку в РТА Технологии: интерфейсы продуктов, архитектура клиентской части, команда и код-ревью. Один из проектов — OtaScribe, сервис транскрибации. Четыре года до этого преподавал программирование: Python, JavaScript, Unity. Преподавание научило меня главному — объяснять сложное просто. Тем же принципом я руководствуюсь и в интерфейсах.',
        facts: [
            { value: '7+', label: 'лет пишу код' },
            { value: '55+', label: 'публичных репозиториев' },
            { value: '4', label: 'года преподавал разработку' },
            { value: '10+', label: 'проектов в продакшене' },
        ],
    },
    experience: {
        title: 'Опыт',
        present: 'наст. время',
    },
    projects: {
        title: 'Проекты',
        subtitle: 'Избранное из продакшена — то, что можно потрогать руками.',
        visit: 'Открыть сайт',
    },
    openSource: {
        title: 'Open Source',
        subtitle: 'Подтягивается из GitHub автоматически — без устаревших списков.',
        viewAll: 'Все репозитории',
        error: 'GitHub сейчас не отвечает — загляните в профиль напрямую.',
    },
    stack: {
        title: 'Стек',
        subtitle: 'Инструменты, которыми пользуюсь каждый день.',
    },
    contact: {
        title: 'Контакт',
        subtitle: 'Расскажите о задаче — отвечу в течение дня.',
        channelsLabel: 'Напрямую',
        nameLabel: 'Имя',
        namePh: 'Как к вам обращаться',
        contactLabel: 'Как связаться',
        contactPh: 'Telegram, почта или телефон',
        messageLabel: 'Сообщение',
        messagePh: 'Пара слов о задаче — или просто привет',
        slideIdle: 'Проведите, чтобы отправить',
        slideArming: 'Готовлю защиту от ботов…',
        slideSending: 'Отправляю…',
        slideDone: 'Доставлено',
        success: 'Сообщение уже у меня в Telegram. Отвечу скоро.',
        errValidation: 'Проверьте поля — что-то не заполнено или слишком коротко.',
        errRateLimit: 'Слишком много сообщений с вашего адреса. Попробуйте через час.',
        errCaptcha: 'Проверка не пройдена. Обновите страницу и попробуйте ещё раз.',
        errServer: 'Не получилось отправить. Напишите мне напрямую в Telegram.',
        hint: 'Без капчи с светофорами: пока вы печатаете, браузер незаметно решает криптографическую задачу, а ползунок подтверждает, что вы человек.',
        consentLabel: 'Я даю согласие на обработку персональных данных',
        consentOpen: 'читать соглашение',
        consentRequired: 'Чтобы отправить сообщение, подтвердите согласие на обработку данных.',
        consentModalTitle: 'Согласие на обработку персональных данных',
        consentModalLead:
            'Отправляя форму, вы свободно, своей волей и в своём интересе даёте согласие на обработку персональных данных в соответствии с Федеральным законом РФ № 152-ФЗ "О персональных данных".',
        consentSections: [
            {
                title: 'Оператор',
                body: 'Оператором персональных данных является владелец сайта aaaver.ru Артемий Аверьянов, ИНН 771392766430. Для связи по вопросам обработки персональных данных: aver.tema.005@ya.ru.',
            },
            {
                title: 'Какие данные обрабатываются',
                body: 'Имя, контакт для обратной связи, текст сообщения, технические данные запроса и антиспам-метрики, необходимые для защиты формы от автоматических отправок.',
            },
            {
                title: 'Цель обработки',
                body: 'Обработка данных нужна только для обратной связи по вашему обращению, защиты формы от спама и хранения истории сообщений, чтобы ни одно обращение не потерялось.',
            },
            {
                title: 'Что происходит с данными',
                body: 'Данные передаются через форму сайта, сохраняются на сервере и пересылаются владельцу сайта в Telegram для ответа на обращение. Данные не публикуются и не передаются третьим лицам без законных оснований.',
            },
            {
                title: 'Срок и отзыв согласия',
                body: 'Согласие действует до достижения цели обработки или до его отзыва. Вы можете отозвать согласие, написав на aver.tema.005@ya.ru с теми же контактными данными, которые указали в форме.',
            },
        ],
        consentClose: 'Понятно',
    },
    footer: {
        builtWith: 'Собрано руками на React, Bun и SQLite',
        source: 'Исходники',
        rights: '© 2026 Артемий Аверьянов',
        top: 'Наверх',
    },
}

const en: typeof ru = {
    nav: {
        about: 'About',
        experience: 'Experience',
        projects: 'Projects',
        opensource: 'Open Source',
        stack: 'Stack',
        contact: 'Contact',
        menuOpen: 'Open menu',
        menuClose: 'Close menu',
        localeSwitch: 'Переключить на русский',
    },
    hero: {
        kicker: 'front-end · team lead · fullstack',
        firstName: 'Artemiy',
        lastName: 'Averyanov',
        lede: 'I craft fast, precise interfaces, lead a front-end team in product development, and can’t imagine a day without writing code.',
        ctaProjects: 'View projects',
        ctaContact: 'Get in touch',
        status: 'open to interesting work',
        scroll: 'scroll',
    },
    about: {
        title: 'About',
        statementA: 'Interfaces are a craft.',
        statementB: 'I build products from mockup to production and polish details until they feel right.',
        body: 'These days I lead front-end development at RTA Technologies: product interfaces, client-side architecture, team and code review. One of those products is OtaScribe, a transcription service. Before that I spent four years teaching programming: Python, JavaScript, Unity. Teaching taught me the most useful skill of all — explaining complex things simply. I apply the same principle to interfaces.',
        facts: [
            { value: '7+', label: 'years writing code' },
            { value: '55+', label: 'public repositories' },
            { value: '4', label: 'years teaching development' },
            { value: '10+', label: 'projects in production' },
        ],
    },
    experience: {
        title: 'Experience',
        present: 'present',
    },
    projects: {
        title: 'Projects',
        subtitle: 'Selected production work — things you can actually try.',
        visit: 'Visit site',
    },
    openSource: {
        title: 'Open Source',
        subtitle: 'Pulled straight from GitHub — no stale lists.',
        viewAll: 'All repositories',
        error: 'GitHub is not responding right now — check the profile directly.',
    },
    stack: {
        title: 'Stack',
        subtitle: 'Tools I reach for every day.',
    },
    contact: {
        title: 'Contact',
        subtitle: 'Tell me about your project — I reply within a day.',
        channelsLabel: 'Direct',
        nameLabel: 'Name',
        namePh: 'What should I call you',
        contactLabel: 'How to reach you',
        contactPh: 'Telegram, email or phone',
        messageLabel: 'Message',
        messagePh: 'A few words about the task — or just say hi',
        slideIdle: 'Slide to send',
        slideArming: 'Arming anti-bot shield…',
        slideSending: 'Sending…',
        slideDone: 'Delivered',
        success: 'Your message is already in my Telegram. I’ll reply soon.',
        errValidation: 'Check the fields — something is missing or too short.',
        errRateLimit: 'Too many messages from your address. Try again in an hour.',
        errCaptcha: 'Verification failed. Refresh the page and try again.',
        errServer: 'Sending failed. Message me directly on Telegram.',
        hint: 'No traffic-light captchas: while you type, the browser quietly solves a cryptographic puzzle, and the slider confirms you’re human.',
        consentLabel: 'I consent to the processing of my personal data',
        consentOpen: 'read the agreement',
        consentRequired: 'To send the message, confirm your consent to personal data processing.',
        consentModalTitle: 'Consent to Personal Data Processing',
        consentModalLead:
            'By sending the form, you freely, knowingly, and in your own interest consent to the processing of your personal data in line with Russian Federal Law No. 152-FZ "On Personal Data".',
        consentSections: [
            {
                title: 'Operator',
                body: 'The personal data operator is Artemiy Averyanov, the owner of aaaver.ru, TIN 771392766430. Contact for any questions about personal data processing: aver.tema.005@ya.ru.',
            },
            {
                title: 'What data is processed',
                body: 'Your name, contact details for follow-up, message text, and technical request / anti-spam metrics needed to protect the form from automated submissions.',
            },
            {
                title: 'Purpose of processing',
                body: 'The data is processed solely to reply to your request, protect the form from spam, and retain message history so no inquiry gets lost.',
            },
            {
                title: 'What happens to the data',
                body: 'Data is sent through the website form, stored on the server, and forwarded to the site owner via Telegram to answer your request. It is not published or shared with third parties without legal grounds.',
            },
            {
                title: 'Retention and withdrawal',
                body: 'Your consent remains valid until the processing purpose is achieved or until you withdraw it. You can withdraw consent by emailing aver.tema.005@ya.ru from the same contact details you used in the form.',
            },
        ],
        consentClose: 'Understood',
    },
    footer: {
        builtWith: 'Hand-built with React, Bun and SQLite',
        source: 'Source code',
        rights: '© 2026 Artemiy Averyanov',
        top: 'Back to top',
    },
}

export const dictionaries: Record<Locale, typeof ru> = { ru, en }
export type Dict = typeof ru
