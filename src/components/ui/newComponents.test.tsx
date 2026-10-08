import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Accordion, ChipGroup, Carousel, Rating, PricingCard } from './Content';
import { TabBar, PinInput, ChatBubble, AppBar } from './Mobile';

describe('Accordion', () => {
  const items = [
    { id: 'a', title: 'First', content: 'Alpha' },
    { id: 'b', title: 'Second', content: 'Beta' }
  ];

  it('opens one panel at a time by default', () => {
    render(<Accordion items={items} defaultOpen={['a']} />);
    const first = screen.getByRole('button', { name: 'First' });
    const second = screen.getByRole('button', { name: 'Second' });
    expect(first).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(second);
    expect(second).toHaveAttribute('aria-expanded', 'true');
    expect(first).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Beta')).toBeVisible();
  });

  it('keeps several panels open when multiple', () => {
    render(<Accordion items={items} multiple />);
    fireEvent.click(screen.getByRole('button', { name: 'First' }));
    fireEvent.click(screen.getByRole('button', { name: 'Second' }));
    expect(screen.getAllByRole('button', { expanded: true })).toHaveLength(2);
  });
});

describe('ChipGroup', () => {
  const Harness = ({ multiple }: { multiple: boolean }) => {
    const [value, setValue] = useState<string[]>(['x']);
    return <ChipGroup label="Filters" multiple={multiple} value={value} onChange={setValue} options={[{ value: 'x', label: 'X' }, { value: 'y', label: 'Y' }]} />;
  };

  it('toggles chips independently when multiple', () => {
    render(<Harness multiple />);
    fireEvent.click(screen.getByRole('button', { name: 'Y' }));
    expect(screen.getByRole('button', { name: 'X' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Y' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('behaves like a radio group when single', () => {
    render(<Harness multiple={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Y' }));
    expect(screen.getByRole('button', { name: 'X' })).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('Carousel', () => {
  it('moves with dots and arrows and reports the index', () => {
    const onIndexChange = vi.fn();
    render(<Carousel label="Slides" onIndexChange={onIndexChange} slides={['One', 'Two', 'Three']} />);
    fireEvent.click(screen.getByRole('button', { name: 'Go to slide 3' }));
    expect(onIndexChange).toHaveBeenLastCalledWith(2);
    expect(screen.getByRole('button', { name: 'Next slide' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Previous slide' }));
    expect(onIndexChange).toHaveBeenLastCalledWith(1);
  });
});

describe('Rating', () => {
  it('is read-only without onChange', () => {
    render(<Rating value={4.5} label="Score" />);
    expect(screen.getByRole('img', { name: 'Score: 4.5 out of 5' })).toBeInTheDocument();
  });

  it('is a radio group with onChange', () => {
    const onChange = vi.fn();
    render(<Rating value={2} onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: '4 stars' }));
    expect(onChange).toHaveBeenCalledWith(4);
  });
});

describe('PricingCard', () => {
  it('marks excluded features', () => {
    render(<PricingCard name="Pro" price="$9" features={[{ label: 'Yes' }, { label: 'No', included: false }]} cta={<button>Buy</button>} />);
    expect(screen.getByLabelText('Not included')).toBeInTheDocument();
    expect(screen.getByLabelText('Included')).toBeInTheDocument();
  });
});

describe('TabBar', () => {
  it('marks the active tab and fires the centre action', () => {
    const onSelect = vi.fn();
    const onCreate = vi.fn();
    render(<TabBar items={[{ id: 'a', label: 'Home', icon: 'h' }, { id: 'b', label: 'Me', icon: 'm', badge: 2 }]} active="a" onSelect={onSelect} center={{ icon: '+', label: 'Create', onClick: onCreate }} />);
    expect(screen.getByText('Home').closest('button')).toHaveAttribute('aria-current', 'page');
    fireEvent.click(screen.getByText('Me').closest('button')!);
    expect(onSelect).toHaveBeenCalledWith('b');
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect(onCreate).toHaveBeenCalled();
  });
});

describe('PinInput', () => {
  const Harness = ({ onComplete }: { onComplete: (v: string) => void }) => {
    const [value, setValue] = useState('');
    return <PinInput length={4} value={value} onChange={setValue} onComplete={onComplete} />;
  };

  it('fills digit by digit, completes, and pastes', () => {
    const onComplete = vi.fn();
    render(<Harness onComplete={onComplete} />);
    const boxes = screen.getAllByRole('textbox');
    fireEvent.change(boxes[0], { target: { value: '1' } });
    fireEvent.change(boxes[1], { target: { value: 'a' } });
    expect(boxes[1]).toHaveValue('');
    fireEvent.paste(boxes[1], { clipboardData: { getData: () => '987' } });
    expect(boxes.map((b) => (b as HTMLInputElement).value).join('')).toBe('1987');
    expect(onComplete).toHaveBeenCalledWith('1987');
    fireEvent.keyDown(boxes[3], { key: 'Backspace' });
    expect(boxes[3]).toHaveValue('');
  });
});

describe('ChatBubble and AppBar', () => {
  it('shows delivery state on my messages and a back button when asked', () => {
    const onBack = vi.fn();
    render(<><AppBar title="Chat" onBack={onBack} /><ChatBubble from="me" status="read" time="9:00">Hi</ChatBubble></>);
    expect(screen.getByLabelText('read')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalled();
  });
});
