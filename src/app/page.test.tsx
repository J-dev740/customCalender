import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import DatePicker from './page';
import { format, startOfToday } from 'date-fns';

describe('DatePicker', () => {
  test('renders the current month and year', () => {
    render(<DatePicker />);
    const today = startOfToday();
    const monthYear = screen.getByText(format(today, 'MMMM yyyy'));
    expect(monthYear).toBeInTheDocument();  
    console.log('here')  
  });

  test('navigates to the previous month', () => {
    render(<DatePicker />);
    const prevMonthButton = screen.getByLabelText('Previous month');
    fireEvent.click(prevMonthButton);
    const today = startOfToday();
    const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const monthYear = screen.getByText(format(prevMonth, 'MMMM yyyy'));
    expect(monthYear).toBeInTheDocument();
  });

  test('navigates to the next month', () => {
    render(<DatePicker />);
    const nextMonthButton = screen.getByLabelText('Next month');
    fireEvent.click(nextMonthButton);
    const today = startOfToday();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const monthYear = screen.getByText(format(nextMonth, 'MMMM yyyy'));
    expect(monthYear).toBeInTheDocument();
  });

  test('selects a day', () => {
    render(<DatePicker />);
    const today = startOfToday();
    const dayButton = screen.getByText(format(today, 'd'));
    fireEvent.click(dayButton);
    expect(dayButton).toHaveClass('text-white');
  });

  test('toggles the reminder options', () => {
    render(<DatePicker />);
    const repeatButton = screen.getByText('Repeat');
    fireEvent.click(repeatButton);
    const dailyOption = screen.getByText('Daily');
    expect(dailyOption).toBeInTheDocument();
  });

  test('selects a recurring option', () => {
    render(<DatePicker />);
    const repeatButton = screen.getByText('Repeat');
    fireEvent.click(repeatButton);
    const dailyOption = screen.getByText('Daily');
    fireEvent.click(dailyOption);
    expect(screen.getByText('Every')).toBeInTheDocument();
  });

  test('clears the selected day', () => {
    render(<DatePicker />);
    const clearButton = screen.getByText('clear');
    fireEvent.click(clearButton);
    const today = startOfToday();
    const dayButton = screen.getByText(format(today, 'd'));
    expect(dayButton).not.toHaveClass('text-white');
  });

  test('opens custom recurring options', () => {
    render(<DatePicker />);
    const repeatButton = screen.getByText('Repeat');
    fireEvent.click(repeatButton);
    const customOption = screen.getByText('Custom');
    fireEvent.click(customOption);
    expect(screen.getByText('Every')).toBeInTheDocument();
  });

  test('selects a custom recurring option', () => {
    render(<DatePicker />);
    const repeatButton = screen.getByText('Repeat');
    fireEvent.click(repeatButton);
    const customOption = screen.getByText('Custom');
    fireEvent.click(customOption);
    const weekOption = screen.getByText('Week');
    fireEvent.click(weekOption);
    expect(screen.getByText('S')).toBeInTheDocument();
  });

  test('selects a weekday in custom recurring options', () => {
    render(<DatePicker />);
    const repeatButton = screen.getByText('Repeat');
    fireEvent.click(repeatButton);
    const customOption = screen.getByText('Custom');
    fireEvent.click(customOption);
    const weekOption = screen.getByText('Week');
    fireEvent.click(weekOption);
    const mondayButton = screen.getByText('M');
    fireEvent.click(mondayButton);
    expect(mondayButton).toHaveClass('bg-cyan-500');
  });

  test('selects a month day in custom recurring options', () => {
    render(<DatePicker />);
    const repeatButton = screen.getByText('Repeat');
    fireEvent.click(repeatButton);
    const customOption = screen.getByText('Custom');
    fireEvent.click(customOption);
    const monthOption = screen.getByText('Month');
    fireEvent.click(monthOption);
    const eachOption = screen.getByText('Each');
    fireEvent.click(eachOption);
    const dayButton = screen.getByText('1');
    fireEvent.click(dayButton);
    expect(dayButton).toHaveClass('bg-cyan-400');
  });

  test('selects a yearly recurring option', () => {
    render(<DatePicker />);
    const repeatButton = screen.getByText('Repeat');
    fireEvent.click(repeatButton);
    const customOption = screen.getByText('Custom');
    fireEvent.click(customOption);
    const yearOption = screen.getByText('Year');
    fireEvent.click(yearOption);
    const eachOption = screen.getByText('Each');
    fireEvent.click(eachOption);
    expect(screen.getByText('MMMM')).toBeInTheDocument();
  });

  test('selects a specific date in yearly recurring options', () => {
    render(<DatePicker />);
    const repeatButton = screen.getByText('Repeat');
    fireEvent.click(repeatButton);
    const customOption = screen.getByText('Custom');
    fireEvent.click(customOption);
    const yearOption = screen.getByText('Year');
    fireEvent.click(yearOption);
    const eachOption = screen.getByText('Each');
    fireEvent.click(eachOption);
    const dayButton = screen.getByText('1');
    fireEvent.click(dayButton);
    expect(dayButton).toHaveClass('text-white');
  });
});
