import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { fallback: ReactNode; onError?: () => void; children: ReactNode };
type State = { failed: boolean };

/** Catches WebGL / model-loading errors so the page shows a static fallback instead of a blank canvas. */
export default class SceneBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.warn('[3D scene disabled]', error, info.componentStack);
    this.props.onError?.();
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
