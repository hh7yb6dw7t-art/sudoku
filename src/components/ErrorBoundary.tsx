import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="h-full flex flex-col items-center justify-center px-6 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-lg font-bold text-red-600 mb-2">页面出错了</h2>
          <p className="text-sm text-gray-500 mb-4 break-all">{this.state.error.message}</p>
          <button
            onClick={() => {
              this.setState({ error: null });
              window.location.reload();
            }}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm active:bg-blue-600"
          >
            重新加载
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
