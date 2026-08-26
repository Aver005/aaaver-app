import type { AdminSite, SiteStatus } from '../api'
import { formatBytes, formatDate, shortVersion } from '../lib/format'

const head = 'px-4 py-3 text-left font-mono text-[0.6rem] uppercase tracking-[0.18em] text-paper-faint'
const cell = 'px-4 py-3 align-middle'

const STATUS: Record<SiteStatus, { text: string; className: string; hint: string }> = {
    live: { text: 'живой', className: 'text-ember', hint: 'в реестре, на диске, обновляется' },
    disabled: {
        text: 'заморожен',
        className: 'text-paper-dim',
        hint: 'раздаётся, но обновление выключено',
    },
    pending: {
        text: 'ждёт',
        className: 'text-paper-dim',
        hint: 'в реестре есть, на диске ещё нет — апдейтер не сходил',
    },
    unmanaged: {
        text: 'вне реестра',
        className: 'text-paper-dim',
        hint: 'на диске есть, в реестре нет: залито руками или убрано из него',
    },
}

function StatusBadge({ status }: { status: SiteStatus }) {
    const info = STATUS[status]
    return (
        <span
            title={info.hint}
            className={`font-mono text-[0.65rem] uppercase tracking-[0.14em] ${info.className}`}
        >
            {info.text}
        </span>
    )
}

const action =
    'cursor-pointer font-mono text-[0.6rem] uppercase tracking-[0.14em] text-paper-faint transition-colors hover:text-ember disabled:cursor-not-allowed disabled:opacity-40'

export interface SitesTableProps {
    sites: AdminSite[]
    busySlug: string | null
    onEdit: (site: AdminSite) => void
    onToggle: (site: AdminSite) => void
    onRemove: (site: AdminSite) => void
}

export function SitesTable({ sites, busySlug, onEdit, onToggle, onRemove }: SitesTableProps) {
    if (sites.length === 0) {
        return (
            <p className="border hairline px-4 py-8 text-center text-sm text-paper-dim">
                Ни одного сайта: ни в реестре, ни на диске.
            </p>
        )
    }

    return (
        // Таблица уезжает в горизонтальную прокрутку внутри себя: страница
        // целиком ездить вбок не должна.
        <div className="overflow-x-auto border hairline">
            <table className="w-full min-w-[54rem] border-collapse text-sm">
                <thead>
                    <tr className="border-b hairline">
                        <th className={head}>Слаг</th>
                        <th className={head}>Состояние</th>
                        <th className={head}>Источник</th>
                        <th className={head}>Развёрнуто</th>
                        <th className={head}>Размер</th>
                        <th className={head} />
                    </tr>
                </thead>
                <tbody>
                    {sites.map((site) => {
                        const busy = busySlug === site.slug
                        return (
                            <tr key={site.slug} className="border-b hairline last:border-0">
                                <td className={cell}>
                                    <a
                                        href={`/${site.slug}/`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-mono text-paper transition-colors hover:text-ember"
                                    >
                                        /{site.slug}/
                                    </a>
                                    {site.title !== site.slug && (
                                        <span className="ml-2 text-xs text-paper-faint">{site.title}</span>
                                    )}
                                </td>
                                <td className={cell}>
                                    <StatusBadge status={site.status} />
                                </td>
                                <td className={`${cell} font-mono text-xs text-paper-dim`}>
                                    {site.source ? (
                                        <>
                                            {site.source.provider}:{site.source.repo}
                                            {site.source.tag && ` @${site.source.tag}`}
                                        </>
                                    ) : (
                                        '—'
                                    )}
                                </td>
                                <td className={`${cell} text-xs text-paper-dim`}>
                                    {site.deployed ? (
                                        <>
                                            {formatDate(site.deployed.deployedAt)}
                                            <span className="ml-2 font-mono text-paper-faint">
                                                {shortVersion(site.deployed.version)}
                                            </span>
                                        </>
                                    ) : (
                                        '—'
                                    )}
                                </td>
                                <td className={`${cell} tabular-nums text-xs text-paper-dim`}>
                                    {site.deployed
                                        ? `${formatBytes(site.deployed.bytes)} · ${site.deployed.files} ф.`
                                        : '—'}
                                </td>
                                <td className={`${cell} text-right whitespace-nowrap`}>
                                    {site.source && (
                                        <>
                                            <button
                                                className={action}
                                                disabled={busy}
                                                onClick={() => onToggle(site)}
                                                title={
                                                    site.source.enabled
                                                        ? 'перестать обновлять; файлы останутся'
                                                        : 'снова обновлять по релизам'
                                                }
                                            >
                                                {site.source.enabled ? 'заморозить' : 'разморозить'}
                                            </button>
                                            <button
                                                className={`${action} ml-4`}
                                                disabled={busy}
                                                onClick={() => onEdit(site)}
                                            >
                                                править
                                            </button>
                                            <button
                                                className={`${action} ml-4`}
                                                disabled={busy}
                                                onClick={() => onRemove(site)}
                                                title="убрать из реестра; файлы останутся на диске"
                                            >
                                                убрать
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
