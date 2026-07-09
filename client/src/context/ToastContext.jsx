import React from 'react'

const ToastContext = React.createContext()
const MAX_VISIBLE_TOASTS = 3

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = React.useState([])

  const addToast = (message, type = 'default', duration = 3000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const newToast = { id, message, type }
    
    setToasts((prev) => {
      const withoutDuplicate = prev.filter((toast) => toast.message !== message || toast.type !== type)
      return [...withoutDuplicate, newToast].slice(-MAX_VISIBLE_TOASTS)
    })

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const success = (message, duration = 3000) => addToast(message, 'success', duration)
  const error = (message, duration = 5000) => addToast(message, 'error', duration)
  const info = (message, duration = 3000) => addToast(message, 'info', duration)
  const warning = (message, duration = 4000) => addToast(message, 'warning', duration)

  const value = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  )
}
