import { useState } from 'react'
import type { SiteFormValues, SiteProvider } from '../api'

const field =
    'w-full border hairline bg-ink-raise px-3 py-2 text-sm text-paper outline-none placeholder:text-paper-faint focus:border-ember'
const label = 'block font-mono text-[0.6rem] uppercase tracking-[0.18em] text-paper-faint'

export interface SiteFormProps {
    /** Пусто — создание. Со значениями — правка, и тогда слаг заморожен. */
    initial?: SiteFormValues
    busy: boolean
    error: string | null
    submitLabel: string
    onSubmit: (values: SiteFormValues) => void
    onCancel: () => void
}

const EMPTY: SiteFormValues = {
    slug: '',
    title: '',
    provider: 'github',
    repo: '',
    asset: '',
    tag: '',
}

export function SiteForm({ initial, busy, error, submitLabel, onSubmit, onCancel }: SiteFormProps) {
    const [values, setValues] = useState<SiteFormValues>(initial ?? EMPTY)
    const editing = initial !== undefined

    function set<K extends keyof SiteFormValues>(key: K, value: SiteFormValues[K]) {
        setValues((prev) => ({ ...prev, [key]: value }))
    }

    return (
        <form
            className="border hairline bg-ink-soft p-5"
            onSubmit={(event) => {
                event.preventDefault()
                onSubmit(values)
            }}
        >
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className={label} htmlFor="site-slug">
                        Слаг — адрес /слаг/
                    </label>
                    <input
                        id="site-slug"
                        className={`${field} mt-1.5 font-mono ${editing ? 'text-paper-dim' : ''}`}
                        value={values.slug}
                        onChange={(event) => set('slug', event.target.value)}
                        placeholder="poopseek"
                        /* Слаг — это имя папки на диске и кусок публичного адреса.
                           Смена = переезд файлов и битые внешние ссылки, поэтому
                           при правке он только для чтения. */
                        readOnly={editing}
                        required
                    />
                </div>
                <div>
                    <label className={label} htmlFor="site-title">
                        Название
                    </label>
                    <input
                        id="site-title"
                        className={`${field} mt-1.5`}
                        value={values.title}
                        onChange={(event) => set('title', event.target.value)}
                        placeholder="как звать в панели"
                    />
                </div>
                <div>
                    <label className={label} htmlFor="site-provider">
                        Где лежит
                    </label>
                    <select
                        id="site-provider"
                        className={`${field} mt-1.5`}
                        value={values.provider}
                        onChange={(event) => set('provider', event.target.value as SiteProvider)}
                    >
                        <option value="github">GitHub</option>
                        <option value="gitlab">GitLab</option>
                    </select>
                </div>
                <div>
                    <label className={label} htmlFor="site-repo">
                        Репозиторий
                    </label>
                    <input
                        id="site-repo"
                        className={`${field} mt-1.5 font-mono`}
                        value={values.repo}
                        onChange={(event) => set('repo', event.target.value)}
                        placeholder="Aver005/poopseek-landing"
                        required
                    />
                </div>
                <div>
                    <label className={label} htmlFor="site-asset">
                        Ассет релиза
                    </label>
                    <input
                        id="site-asset"
                        className={`${field} mt-1.5 font-mono`}
                        value={values.asset}
                        onChange={(event) => set('asset', event.target.value)}
                        placeholder="dist.tar.gz"
                    />
                </div>
                <div>
                    <label className={label} htmlFor="site-tag">
                        Тег
                    </label>
                    <input
                        id="site-tag"
                        className={`${field} mt-1.5 font-mono`}
                        value={values.tag}
                        onChange={(event) => set('tag', event.target.value)}
                        placeholder="latest"
                    />
                </div>
            </div>

            <p className="mt-3 text-xs text-paper-faint">
                Пустые «ассет» и «тег» означают умолчания: <code>dist.tar.gz</code> из скользящего
                релиза <code>latest</code>.
            </p>

            {error && <p className="mt-3 text-sm text-ember">{error}</p>}

            <div className="mt-5 flex gap-3">
                <button
                    type="submit"
                    disabled={busy}
                    className="cursor-pointer bg-ember px-5 py-2.5 font-mono text-[0.65rem] font-medium uppercase tracking-[0.18em] text-ink transition-colors hover:bg-ember-bright disabled:cursor-wait disabled:opacity-60"
                >
                    {busy ? 'Сохраняю…' : submitLabel}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="cursor-pointer border hairline px-5 py-2.5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-paper-dim transition-colors hover:border-ember hover:text-ember"
                >
                    Отмена
                </button>
            </div>
        </form>
    )
}
