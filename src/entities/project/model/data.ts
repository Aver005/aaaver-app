import type { Project } from './types'

export const PROJECTS: Project[] = [
    {
        id: 'pocacall',
        title: 'Pocacall',
        url: 'https://pocacall.kiviuly.ru',
        image: '/projects/pocacall.png',
        description: {
            ru: 'Платформа для видеозвонков без регистрации: зашёл по ссылке — и уже в комнате. Отзывчивый интерфейс, WebRTC под капотом.',
            en: 'A video-call platform with zero sign-up: open the link and you are in the room. Responsive UI, WebRTC under the hood.',
        },
        tags: ['WebRTC', 'React', 'UI/UX'],
    },
    {
        id: 'order-maushi',
        title: 'Order Maushi',
        url: 'https://order.maushi.ru',
        image: '/projects/order-maushi.png',
        description: {
            ru: 'Минималистичный анимированный сайт бронирования автоматизированных звукозаписывающих студий — от выбора слота до оплаты.',
            en: 'A minimalist animated booking site for automated recording studios — from picking a slot to payment.',
        },
        tags: ['Booking', 'Animation', 'Minimalism'],
    },
    {
        id: 'rtatex',
        title: 'RtaTex',
        url: 'https://rtatex.ru',
        image: '/projects/rtatex.png',
        description: {
            ru: 'Главный сайт компании «РТА Технологии»: презентация продуктов, услуг и команды.',
            en: 'The main website of RTA Technologies: products, services and the team.',
        },
        tags: ['Corporate', 'Presentation'],
    },
    {
        id: 'otascribe',
        title: 'OtaScribe',
        url: 'http://app.otascribe.ru',
        image: '/projects/otascribe.png',
        description: {
            ru: 'Сервис транскрибации аудио и видео: загрузил запись — получил текст с таймкодами.',
            en: 'An audio & video transcription service: upload a recording, get text with timecodes.',
        },
        tags: ['AI', 'Transcription', 'Audio'],
    },
]
