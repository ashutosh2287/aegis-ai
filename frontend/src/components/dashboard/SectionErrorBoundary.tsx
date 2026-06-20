import { Component, type ReactNode } from 'react';
import { DashboardSectionError } from './DashboardSectionError';

interface SectionErrorBoundaryProps {
  children: ReactNode;
  title: string;
}

interface SectionErrorBoundaryState {
  hasError: boolean;
}

export class SectionErrorBoundary extends Component<
  SectionErrorBoundaryProps,
  SectionErrorBoundaryState
> {
  constructor(props: SectionErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): SectionErrorBoundaryState {
    return { hasError: true };
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <DashboardSectionError
          title={this.props.title}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}
