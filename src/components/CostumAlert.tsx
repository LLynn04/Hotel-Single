"use client"

import { useEffect } from "react"

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  type?: "danger" | "warning" | "info"
}

export const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  type = "warning",
}: ConfirmModalProps) => {
  if (!isOpen) return null

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: "🚨",
          iconBg: "bg-red-100",
          iconColor: "text-red-600",
          confirmBtn: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
        }
      case "warning":
        return {
          icon: "⚠️",
          iconBg: "bg-yellow-100",
          iconColor: "text-yellow-600",
          confirmBtn: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
        }
      case "info":
        return {
          icon: "ℹ️",
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600",
          confirmBtn: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
        }
      default:
        return {
          icon: "⚠️",
          iconBg: "bg-yellow-100",
          iconColor: "text-yellow-600",
          confirmBtn: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center mr-4`}>
              <span className="text-2xl">{styles.icon}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
          </div>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex space-x-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${styles.confirmBtn}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface NotificationProps {
  isOpen: boolean
  title: string
  message: string
  type: "success" | "error" | "info" | "warning"
  onClose: () => void
  autoClose?: boolean
  duration?: number
}

export const Notification = ({
  isOpen,
  title,
  message,
  type,
  onClose,
  autoClose = true,
  duration = 4000,
}: NotificationProps) => {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isOpen, autoClose, duration, onClose])

  if (!isOpen) return null

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          icon: "✅",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          iconBg: "bg-green-100",
          iconColor: "text-green-600",
          titleColor: "text-green-800",
          messageColor: "text-green-700",
          closeBtn: "text-green-400 hover:text-green-600",
        }
      case "error":
        return {
          icon: "❌",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          iconBg: "bg-red-100",
          iconColor: "text-red-600",
          titleColor: "text-red-800",
          messageColor: "text-red-700",
          closeBtn: "text-red-400 hover:text-red-600",
        }
      case "warning":
        return {
          icon: "⚠️",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          iconBg: "bg-yellow-100",
          iconColor: "text-yellow-600",
          titleColor: "text-yellow-800",
          messageColor: "text-yellow-700",
          closeBtn: "text-yellow-400 hover:text-yellow-600",
        }
      case "info":
        return {
          icon: "ℹ️",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600",
          titleColor: "text-blue-800",
          messageColor: "text-blue-700",
          closeBtn: "text-blue-400 hover:text-blue-600",
        }
      default:
        return {
          icon: "ℹ️",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600",
          titleColor: "text-blue-800",
          messageColor: "text-blue-700",
          closeBtn: "text-blue-400 hover:text-blue-600",
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div
        className={`${styles.bgColor} ${styles.borderColor} border rounded-lg shadow-lg p-4 transform transition-all duration-300 ease-in-out`}
      >
        <div className="flex items-start">
          <div className={`w-8 h-8 rounded-full ${styles.iconBg} flex items-center justify-center mr-3 flex-shrink-0`}>
            <span className="text-lg">{styles.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-semibold ${styles.titleColor}`}>{title}</h4>
            <p className={`text-sm mt-1 ${styles.messageColor}`}>{message}</p>
          </div>
          <button
            onClick={onClose}
            className={`ml-3 flex-shrink-0 ${styles.closeBtn} hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
