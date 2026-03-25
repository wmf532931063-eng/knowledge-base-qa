import { useState, useCallback } from 'react'

interface ConfirmDialogOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'warning' | 'info' | 'danger'
  onConfirm?: () => void
  onCancel?: () => void
}

interface ConfirmDialogState {
  isOpen: boolean
  options: ConfirmDialogOptions
}

export function useConfirmDialog() {
  const [dialogState, setDialogState] = useState<ConfirmDialogState>({
    isOpen: false,
    options: {
      title: '',
      message: '',
      confirmText: '确认',
      cancelText: '取消',
      type: 'warning'
    }
  })

  const showConfirm = useCallback(
    (options: ConfirmDialogOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        setDialogState({
          isOpen: true,
          options: {
            ...options,
            onConfirm: () => {
              options.onConfirm?.()
              resolve(true)
              setDialogState(prev => ({ ...prev, isOpen: false }))
            },
            onCancel: () => {
              options.onCancel?.()
              resolve(false)
              setDialogState(prev => ({ ...prev, isOpen: false }))
            }
          }
        })
      })
    },
    []
  )

  const closeDialog = useCallback(() => {
    setDialogState(prev => ({ ...prev, isOpen: false }))
  }, [])

  const handleConfirm = useCallback(() => {
    dialogState.options.onConfirm?.()
    closeDialog()
  }, [dialogState.options, closeDialog])

  const handleCancel = useCallback(() => {
    dialogState.options.onCancel?.()
    closeDialog()
  }, [dialogState.options, closeDialog])

  return {
    isOpen: dialogState.isOpen,
    options: dialogState.options,
    showConfirm,
    closeDialog,
    handleConfirm,
    handleCancel
  }
}