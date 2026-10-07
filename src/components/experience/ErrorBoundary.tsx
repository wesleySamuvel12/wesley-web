'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** rendered instead when a child throws */
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * Canvas-level error boundary — a missing texture or shader hiccup must
 * never take down the whole experience.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    if (typeof console !== 'undefined') {
      console.warn('[experience] recovered from:', error)
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null
    }
    return this.props.children
  }
}
