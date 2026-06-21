import { useCallback } from 'react'
import type { ReactNode } from 'react'

import { ThemeIcon, UnstyledButton } from '@mantine/core'
import { IconCircleFilled, IconEqual, IconMoonFilled, IconX } from '@tabler/icons-react'

import styles from './Cell.module.css'
import { ToggleDirection } from '@/types/ToggleDirection'

interface CellProps {
  canToggle?: boolean
  onToggle?: (direction: ToggleDirection) => void
  position: number
  right?: string
  bottom?: string
  children?: ReactNode
}

const Cell = ({ canToggle = true, onToggle, position, right, bottom, children } : CellProps) => {
  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.preventDefault()

    if (!canToggle) return

    if (e.type === 'contextmenu') {
      onToggle?.(ToggleDirection.Backward)
    } else {
      onToggle?.(ToggleDirection.Forward)
    }
  }, [canToggle, onToggle])

  const row = Math.floor(position / 6) + 1
  const column = (position % 6) + 1
  const valueLabel = children === 'O' ? 'sun' : children === 'X' ? 'moon' : 'empty'
  const stateLabel = canToggle ? 'Playable' : 'Locked'

  return (
    <UnstyledButton
      type="button"
      className={styles.container}
      onClick={handleClick}
      onContextMenu={handleClick}
      disabled={!canToggle}
      aria-label={`${stateLabel} cell at row ${row}, column ${column}; currently ${valueLabel}`}>
      <ThemeIcon className={styles.mark} variant="transparent" bg={canToggle ? 'var(--tango-surface-board)' : 'var(--tango-surface-cell-locked)'} color={children === 'O' ? 'yellow' : 'indigo'} size="100%">
        { 
          children === 'O' ? (
            <IconCircleFilled size="45%" />
          ) : children === 'X' ? (
            <IconMoonFilled size="45%" />
          ) : null
        }
      </ThemeIcon>

      {
        right && (
          right === '=' ? <IconEqual size="35%" className={styles.right} /> : <IconX size="35%" className={styles.right} />
        )
      }

      {
        bottom && (
          bottom === '=' ? <IconEqual size="35%" className={styles.bottom} /> : <IconX size="35%" className={styles.bottom} />
        )
      }
    </UnstyledButton>
  )
}

export default Cell
