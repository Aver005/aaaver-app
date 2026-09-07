import type { ComponentType } from 'react'
import { DiaryFigure } from './DiaryFigure'

/** Схемы для проектов без скриншота, по id проекта */
export const FIGURES: Record<string, ComponentType> = {
    diary: DiaryFigure,
}
