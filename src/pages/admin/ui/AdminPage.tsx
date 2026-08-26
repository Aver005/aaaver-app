import { useCallback, useEffect, useState } from 'react'
import {
    createSite,
    fetchMe,
    fetchSites,
    logout,
    patchSite,
    reloadSites,
    removeSite,
    type AdminSite,
    type AuthState,
    type SiteFormValues,
} from '../api'
import { SiteForm } from './SiteForm'
import { SitesTable } from './SitesTable'

function Shell({ children }: { children?: React.ReactNode }) {
    return <div className="min-h-svh bg-ink text-paper">{children}</div>
}

/** Экран на весь рост — для всего, что не таблица: вход, загрузка, отказ. */
function Centered({ children }: { children: React.ReactNode }) {
    return (
        <Shell>
            <div className="flex min-h-svh items-center justify-center px-6">
                <div className="w-full max-w-md text-center">{children}</div>
            </div>
        </Shell>
    )
}

function LoginScreen() {
    return (
        <Centered>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-paper-faint">
                aaaver.ru
            </p>
            <h1 className="mt-3 font-display text-2xl">Панель управления</h1>
            <p className="mt-3 text-sm text-paper-dim">
                Вход через панель root.kiviuly.ru — там уже есть пароль и второй фактор.
            </p>
            {/*
                Обычная ссылка, а не Link роутера и не fetch: это переход между
                сайтами, его должен делать браузер целиком.
            */}
            <a
                href="/api/admin/login"
                className="mt-8 inline-flex items-center justify-center gap-2.5 bg-ember px-6 py-3.5 font-mono text-xs font-medium uppercase tracking-[0.22em] text-ink transition-colors hover:bg-ember-bright"
            >
                Войти через панель
            </a>
        </Centered>
    )
}

function Notice({ title, detail }: { title: string; detail: string }) {
    return (
        <Centered>
            <h1 className="font-display text-xl">{title}</h1>
            <p className="mt-3 text-sm text-paper-dim">{detail}</p>
        </Centered>
    )
}

function Header({ email, onLogout }: { email: string; onLogout: () => void }) {
    return (
        <header className="sticky top-0 z-10 border-b hairline bg-ink/90 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-paper-faint">
                    aaaver.ru / панель
                </span>
                <div className="flex items-center gap-4">
                    <span className="hidden text-xs text-paper-dim sm:inline">{email}</span>
                    <button
                        onClick={onLogout}
                        className="cursor-pointer font-mono text-[0.65rem] uppercase tracking-[0.18em] text-paper-faint transition-colors hover:text-ember"
                    >
                        Выйти
                    </button>
                </div>
            </div>
        </header>
    )
}

const toolButton =
    'cursor-pointer font-mono text-[0.65rem] uppercase tracking-[0.18em] text-paper-faint transition-colors hover:text-ember disabled:cursor-wait disabled:opacity-50'

type Mode = { kind: 'idle' } | { kind: 'creating' } | { kind: 'editing'; site: AdminSite }

function formValues(site: AdminSite): SiteFormValues {
    return {
        slug: site.slug,
        title: site.title,
        provider: site.source?.provider ?? 'github',
        repo: site.source?.repo ?? '',
        asset: site.source?.asset ?? '',
        tag: site.source?.tag ?? '',
    }
}

function SitesSection() {
    const [sites, setSites] = useState<AdminSite[] | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [notice, setNotice] = useState<string | null>(null)
    const [mode, setMode] = useState<Mode>({ kind: 'idle' })
    const [formBusy, setFormBusy] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)
    const [busySlug, setBusySlug] = useState<string | null>(null)
    const [syncing, setSyncing] = useState(false)

    const load = useCallback(async () => {
        setError(null)
        try {
            setSites(await fetchSites())
        } catch {
            setError('Не удалось получить список — попробуйте обновить.')
        }
    }, [])

    useEffect(() => {
        void load()
    }, [load])

    async function submit(values: SiteFormValues) {
        // Снимок до setMode: дальше `mode` в замыкании ещё старый, и опираться
        // на это молча — верный способ однажды получить не то сообщение.
        const editing = mode.kind === 'editing'

        setFormBusy(true)
        setFormError(null)

        const result = editing
            ? await patchSite(values.slug, {
                  title: values.title,
                  provider: values.provider,
                  repo: values.repo,
                  asset: values.asset,
                  tag: values.tag,
              })
            : await createSite(values)

        setFormBusy(false)
        if (!result.ok) {
            setFormError(result.detail)
            return
        }

        setMode({ kind: 'idle' })
        setNotice(
            editing
                ? `«${values.slug}» обновлён в реестре.`
                : `«${values.slug}» добавлен. Апдейтер заберёт его в ближайшем цикле — или нажмите «синхронизировать сейчас».`,
        )
        await load()
    }

    async function rowAction(slug: string, run: () => Promise<{ ok: boolean; detail?: string }>) {
        setBusySlug(slug)
        setNotice(null)
        const result = await run()
        setBusySlug(null)
        if (!result.ok) setError(result.detail ?? 'Не получилось')
        await load()
    }

    function toggle(site: AdminSite) {
        if (!site.source) return
        const next = !site.source.enabled
        void rowAction(site.slug, async () => {
            const result = await patchSite(site.slug, { enabled: next })
            if (result.ok) {
                setNotice(
                    next
                        ? `«${site.slug}» снова обновляется по релизам.`
                        : `«${site.slug}» заморожен: файлы на месте и раздаются, но обновляться перестанет.`,
                )
            }
            return result
        })
    }

    function remove(site: AdminSite) {
        const confirmed = window.confirm(
            `Убрать «${site.slug}» из реестра?\n\n` +
                'Файлы демки останутся на диске и продолжат открываться — ' +
                'перестанут только приезжать обновления.',
        )
        if (!confirmed) return

        void rowAction(site.slug, async () => {
            const result = await removeSite(site.slug)
            if (result.ok) {
                setNotice(`«${site.slug}» убран из реестра. Файлы остались — сайт всё ещё открывается.`)
            }
            return result
        })
    }

    async function sync() {
        setSyncing(true)
        setNotice(null)
        setError(null)
        const result = await reloadSites()
        setSyncing(false)
        if (result.ok) setNotice('Апдейтер прошёл цикл.')
        else setError(result.detail)
        await load()
    }

    return (
        <section className="mx-auto max-w-6xl px-6 py-10">
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-4">
                <h1 className="font-display text-xl">Сайты</h1>
                <div className="flex gap-5">
                    <button className={toolButton} onClick={sync} disabled={syncing}>
                        {syncing ? 'синхронизирую…' : 'синхронизировать сейчас'}
                    </button>
                    <button className={toolButton} onClick={() => void load()}>
                        обновить список
                    </button>
                    <button
                        className="cursor-pointer font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ember transition-colors hover:text-ember-bright"
                        onClick={() => {
                            setFormError(null)
                            setMode({ kind: 'creating' })
                        }}
                    >
                        + добавить
                    </button>
                </div>
            </div>

            {mode.kind !== 'idle' && (
                <div className="mb-5">
                    <SiteForm
                        /* Ключ пересоздаёт форму при смене цели: без него
                           «править» на другой строке показало бы поля
                           предыдущей — состояние живёт внутри формы. */
                        key={mode.kind === 'editing' ? `edit:${mode.site.slug}` : 'create'}
                        initial={mode.kind === 'editing' ? formValues(mode.site) : undefined}
                        busy={formBusy}
                        error={formError}
                        submitLabel={mode.kind === 'editing' ? 'Сохранить' : 'Добавить'}
                        onSubmit={(values) => void submit(values)}
                        onCancel={() => setMode({ kind: 'idle' })}
                    />
                </div>
            )}

            {notice && <p className="mb-4 border-l-2 border-ember pl-3 text-sm text-paper-dim">{notice}</p>}
            {error && <p className="mb-4 border-l-2 border-ember pl-3 text-sm text-ember">{error}</p>}

            {sites === null && !error ? (
                <p className="border hairline px-4 py-8 text-center text-sm text-paper-dim">Читаю реестр…</p>
            ) : (
                <SitesTable
                    sites={sites ?? []}
                    busySlug={busySlug}
                    onEdit={(site) => {
                        setFormError(null)
                        setMode({ kind: 'editing', site })
                    }}
                    onToggle={toggle}
                    onRemove={remove}
                />
            )}

            <p className="mt-4 text-xs text-paper-faint">
                Реестр — намерение, диск — факт, и панель показывает оба. Записывать файлы может
                только апдейтер: у сервера каталог демок смонтирован только на чтение.
            </p>
        </section>
    )
}

export function AdminPage() {
    const [auth, setAuth] = useState<AuthState>({ status: 'loading' })

    useEffect(() => {
        void fetchMe().then(setAuth)
    }, [])

    const onLogout = useCallback(() => {
        void logout().then(() => setAuth({ status: 'anonymous' }))
    }, [])

    if (auth.status === 'loading') return <Shell />
    if (auth.status === 'anonymous') return <LoginScreen />
    if (auth.status === 'disabled') {
        return (
            <Notice
                title="Вход не настроен"
                detail="На сервере не заданы SSO_CLIENT_SECRET и ADMIN_EMAILS, поэтому панель закрыта."
            />
        )
    }
    if (auth.status === 'error') return <Notice title="Не получилось" detail={auth.message} />

    return (
        <Shell>
            <Header email={auth.user.email} onLogout={onLogout} />
            <SitesSection />
        </Shell>
    )
}
