import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatCard from './StatCard';

describe('StatCard', () => {
  describe('Basic Rendering', () => {
    it('should render label and value', () => {
      render(<StatCard label="Total Sessions" value={5} />);

      expect(screen.getByText('Total Sessions')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should render string values', () => {
      render(<StatCard label="Status" value="Active" />);

      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render zero value', () => {
      render(<StatCard label="Pending Games" value={0} />);

      expect(screen.getByText('Pending Games')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Icon Display', () => {
    it('should render icon when provided', () => {
      render(<StatCard label="Players" value={10} icon="👥" />);

      expect(screen.getByText('👥')).toBeInTheDocument();
    });

    it('should not render icon section when icon not provided', () => {
      const { container } = render(
        <StatCard label="Players" value={10} />
      );

      // Icon would be in a div with specific background classes
      const iconContainer = container.querySelector('.rounded-full');
      expect(iconContainer).not.toBeInTheDocument();
    });
  });

  describe('Color Variants', () => {
    it('should apply blue color classes', () => {
      const { container } = render(
        <StatCard label="Sessions" value={5} icon="📊" color="blue" />
      );

      const iconContainer = container.querySelector('.bg-blue-100');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should apply green color classes', () => {
      const { container } = render(
        <StatCard label="Active" value={3} icon="✓" color="green" />
      );

      const iconContainer = container.querySelector('.bg-green-100');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should apply purple color classes', () => {
      const { container } = render(
        <StatCard label="Players" value={10} icon="👥" color="purple" />
      );

      const iconContainer = container.querySelector('.bg-purple-100');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should apply orange color classes', () => {
      const { container } = render(
        <StatCard label="Games" value={7} icon="🎮" color="orange" />
      );

      const iconContainer = container.querySelector('.bg-orange-100');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should apply red color classes', () => {
      const { container } = render(
        <StatCard label="Errors" value={2} icon="⚠️" color="red" />
      );

      const iconContainer = container.querySelector('.bg-red-100');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should default to blue when no color specified', () => {
      const { container } = render(
        <StatCard label="Default" value={1} icon="📊" />
      );

      const iconContainer = container.querySelector('.bg-blue-100');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('Trend Indicator', () => {
    it('should display positive trend', () => {
      render(
        <StatCard
          label="Sessions"
          value={10}
          trend={{ value: 15, isPositive: true }}
        />
      );

      expect(screen.getByText(/↑/)).toBeInTheDocument();
      expect(screen.getByText(/15%/)).toBeInTheDocument();
    });

    it('should display negative trend', () => {
      render(
        <StatCard
          label="Sessions"
          value={8}
          trend={{ value: -10, isPositive: false }}
        />
      );

      expect(screen.getByText(/↓/)).toBeInTheDocument();
      expect(screen.getByText(/10%/)).toBeInTheDocument();
    });

    it('should apply green color for positive trend', () => {
      render(
        <StatCard
          label="Growth"
          value={100}
          trend={{ value: 25, isPositive: true }}
        />
      );

      const trendElement = screen.getByText(/↑/).closest('span');
      expect(trendElement).toHaveClass('text-green-600');
    });

    it('should apply red color for negative trend', () => {
      render(
        <StatCard
          label="Decline"
          value={80}
          trend={{ value: -15, isPositive: false }}
        />
      );

      const trendElement = screen.getByText(/↓/).closest('span');
      expect(trendElement).toHaveClass('text-red-600');
    });

    it('should handle zero trend value', () => {
      render(
        <StatCard
          label="Stable"
          value={50}
          trend={{ value: 0, isPositive: true }}
        />
      );

      expect(screen.getByText(/0%/)).toBeInTheDocument();
    });

    it('should not render trend when not provided', () => {
      render(<StatCard label="Sessions" value={10} />);

      expect(screen.queryByText(/↑/)).not.toBeInTheDocument();
      expect(screen.queryByText(/↓/)).not.toBeInTheDocument();
    });
  });

  describe('Subtitle Display', () => {
    it('should render subtitle when provided', () => {
      render(
        <StatCard label="Active Players" value={25} subtitle="Currently online" />
      );

      expect(screen.getByText('Currently online')).toBeInTheDocument();
    });

    it('should render complex subtitle', () => {
      render(
        <StatCard
          label="Online Players"
          value={8}
          subtitle="of 12 total"
        />
      );

      expect(screen.getByText('of 12 total')).toBeInTheDocument();
    });

    it('should not render subtitle when not provided', () => {
      const { container } = render(<StatCard label="Sessions" value={5} />);

      // Subtitle has specific text-xs and text-gray-500 classes
      const subtitle = container.querySelector('.text-xs.text-gray-500');
      expect(subtitle).not.toBeInTheDocument();
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <StatCard label="Test" value={1} className="custom-class" />
      );

      const card = container.firstChild;
      expect(card).toHaveClass('custom-class');
    });

    it('should preserve base classes with custom className', () => {
      const { container } = render(
        <StatCard label="Test" value={1} className="my-4" />
      );

      const card = container.firstChild;
      expect(card).toHaveClass('bg-white');
      expect(card).toHaveClass('border');
      expect(card).toHaveClass('my-4');
    });
  });

  describe('Complete Stat Card', () => {
    it('should render all features together', () => {
      render(
        <StatCard
          label="Total Players"
          value={42}
          icon="👥"
          color="purple"
          trend={{ value: 12, isPositive: true }}
          subtitle="of 50 capacity"
          className="stat-card-custom"
        />
      );

      expect(screen.getByText('Total Players')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('👥')).toBeInTheDocument();
      expect(screen.getByText(/↑/)).toBeInTheDocument();
      expect(screen.getByText(/12%/)).toBeInTheDocument();
      expect(screen.getByText('of 50 capacity')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      const { container } = render(
        <StatCard label="Sessions" value={10} />
      );

      const card = container.firstChild;
      expect(card).toBeInTheDocument();
    });

    it('should render text content accessibly', () => {
      render(<StatCard label="Active Games" value={5} subtitle="In progress" />);

      // All text should be accessible
      expect(screen.getByText('Active Games')).toBeVisible();
      expect(screen.getByText('5')).toBeVisible();
      expect(screen.getByText('In progress')).toBeVisible();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large numbers', () => {
      render(<StatCard label="Views" value={1000000} />);

      expect(screen.getByText('1000000')).toBeInTheDocument();
    });

    it('should handle negative numbers', () => {
      render(<StatCard label="Balance" value={-50} />);

      expect(screen.getByText('-50')).toBeInTheDocument();
    });

    it('should handle decimal numbers', () => {
      render(<StatCard label="Average" value={42.5} />);

      expect(screen.getByText('42.5')).toBeInTheDocument();
    });

    it('should handle empty string value', () => {
      render(<StatCard label="Status" value="" />);

      expect(screen.getByText('Status')).toBeInTheDocument();
      // Empty string should still render but be empty
      const valueElement = screen.getByText('Status')
        .closest('div')
        ?.querySelector('.text-3xl');
      expect(valueElement).toBeInTheDocument();
    });

    it('should handle very long label text', () => {
      const longLabel =
        'This is a very long label that might wrap to multiple lines';
      render(<StatCard label={longLabel} value={1} />);

      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });
  });
});
