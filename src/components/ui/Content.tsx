import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Check, Minus, Star, X, Quote } from 'lucide-react';
import { Card } from './Card';
import { Avatar } from './DataDisplay';
import './Content.css';

/* ---------------------------------------------------------------- */
/* Accordion                                                          */
/* ---------------------------------------------------------------- */

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
  icon?: ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** Allow several panels open at once. */
  multiple?: boolean;
  defaultOpen?: string[];
  variant?: 'joined' | 'separated';
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({ items, multiple = false, defaultOpen = [], variant = 'joined', className = '' }) => {
  const id = useId();
  const [open, setOpen] = useState<string[]>(defaultOpen);
  const toggle = (itemId: string) => setOpen((prev) => {
    if (prev.includes(itemId)) return prev.filter((x) => x !== itemId);
    return multiple ? [...prev, itemId] : [itemId];
  });
  return (
    <div className={`ui-accordion ui-accordion--${variant} ${className}`}>
      {items.map((it) => {
        const isOpen = open.includes(it.id);
        return (
          <div key={it.id} className={`ui-accordion__item ${isOpen ? 'ui-accordion__item--open' : ''}`}>
            <h3 className="ui-accordion__heading">
              <button
                type="button"
                className="ui-accordion__trigger"
                aria-expanded={isOpen}
                aria-controls={`${id}-${it.id}`}
                id={`${id}-${it.id}-trigger`}
                onClick={() => toggle(it.id)}
              >
                {it.icon && <span className="ui-accordion__icon" aria-hidden="true">{it.icon}</span>}
                <span className="ui-accordion__title">{it.title}</span>
                <ChevronDown size={16} className="ui-accordion__chevron" aria-hidden="true" />
              </button>
            </h3>
            <div className="ui-accordion__panel" id={`${id}-${it.id}`} role="region" aria-labelledby={`${id}-${it.id}-trigger`} hidden={!isOpen}>
              <div className="ui-accordion__content">{it.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* Chip + ChipGroup                                                   */
/* ---------------------------------------------------------------- */

export interface ChipProps {
  children: ReactNode;
  icon?: ReactNode;
  /** Selectable (filter) chip. */
  selected?: boolean;
  onClick?: () => void;
  /** Shows a remove button (input chip). */
  onRemove?: () => void;
  size?: 'sm' | 'md';
  disabled?: boolean;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({ children, icon, selected, onClick, onRemove, size = 'md', disabled, className = '' }) => {
  const classes = `ui-chip ui-chip--${size} ${selected ? 'ui-chip--selected' : ''} ${onClick ? 'ui-chip--interactive' : ''} ${disabled ? 'ui-chip--disabled' : ''} ${className}`;
  const body = (
    <>
      {selected && onClick ? <Check size={14} className="ui-chip__check" aria-hidden="true" /> : icon && <span className="ui-chip__icon" aria-hidden="true">{icon}</span>}
      <span className="ui-chip__label">{children}</span>
    </>
  );
  if (onClick) {
    return (
      <span className={classes}>
        <button type="button" className="ui-chip__main" aria-pressed={selected} onClick={onClick} disabled={disabled}>{body}</button>
        {onRemove && <button type="button" className="ui-chip__remove" onClick={onRemove} aria-label="Remove" disabled={disabled}><X size={12} /></button>}
      </span>
    );
  }
  return (
    <span className={classes}>
      <span className="ui-chip__main">{body}</span>
      {onRemove && <button type="button" className="ui-chip__remove" onClick={onRemove} aria-label="Remove" disabled={disabled}><X size={12} /></button>}
    </span>
  );
};

export interface ChipGroupProps {
  options: { value: string; label: ReactNode; icon?: ReactNode }[];
  value: string[];
  onChange: (value: string[]) => void;
  /** Single choice behaves like a radio group of chips. */
  multiple?: boolean;
  label: string;
  size?: 'sm' | 'md';
  /** Keep chips on one scrollable row (mobile filters). */
  scroll?: boolean;
  className?: string;
}

export const ChipGroup: React.FC<ChipGroupProps> = ({ options, value, onChange, multiple = true, label, size = 'md', scroll = false, className = '' }) => (
  <div className={`ui-chip-group ${scroll ? 'ui-chip-group--scroll' : ''} ${className}`} role="group" aria-label={label}>
    {options.map((o) => (
      <Chip
        key={o.value}
        size={size}
        icon={o.icon}
        selected={value.includes(o.value)}
        onClick={() => {
          if (multiple) onChange(value.includes(o.value) ? value.filter((v) => v !== o.value) : [...value, o.value]);
          else onChange([o.value]);
        }}
      >
        {o.label}
      </Chip>
    ))}
  </div>
);

/* ---------------------------------------------------------------- */
/* Carousel                                                           */
/* ---------------------------------------------------------------- */

export interface CarouselProps {
  slides: ReactNode[];
  label: string;
  /** Controlled index. */
  index?: number;
  onIndexChange?: (index: number) => void;
  /** Slides visible at once; fractions leave a peek of the next slide. */
  slidesPerView?: number;
  showArrows?: boolean;
  showDots?: boolean;
  className?: string;
}

export const Carousel: React.FC<CarouselProps> = ({ slides, label, index, onIndexChange, slidesPerView = 1, showArrows = true, showDots = true, className = '' }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [internal, setInternal] = useState(0);
  const current = index ?? internal;
  const lastIndex = Math.max(0, slides.length - Math.floor(slidesPerView));
  const fromScroll = useRef(false);

  const setCurrent = useCallback((i: number) => {
    setInternal(i);
    onIndexChange?.(i);
  }, [onIndexChange]);

  // Bring the active slide into view when the index changes from outside the track (dots, arrows, parent).
  useEffect(() => {
    if (fromScroll.current) { fromScroll.current = false; return; }
    const track = trackRef.current;
    const slide = track?.children[current] as HTMLElement | undefined;
    if (!track || !slide || typeof track.scrollTo !== 'function') return;
    track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: 'smooth' });
  }, [current]);

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const first = track.children[0] as HTMLElement | undefined;
    if (!first) return;
    const step = first.offsetWidth + (parseFloat(getComputedStyle(track).columnGap) || 0);
    const i = Math.max(0, Math.min(lastIndex, Math.round(track.scrollLeft / (step || 1))));
    if (i !== current) { fromScroll.current = true; setCurrent(i); }
  };

  const go = (i: number) => setCurrent(Math.max(0, Math.min(lastIndex, i)));

  return (
    <div className={`ui-carousel ${className}`} role="region" aria-roledescription="carousel" aria-label={label} style={{ '--carousel-per-view': slidesPerView } as React.CSSProperties}>
      <div className="ui-carousel__viewport">
        <div className="ui-carousel__track" ref={trackRef} onScroll={onScroll}>
          {slides.map((s, i) => (
            <div key={i} className={`ui-carousel__slide ${i === current ? 'ui-carousel__slide--active' : ''}`} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${slides.length}`}>
              {s}
            </div>
          ))}
        </div>
        {showArrows && slides.length > 1 && (
          <>
            <button type="button" className="ui-carousel__arrow ui-carousel__arrow--prev" onClick={() => go(current - 1)} disabled={current <= 0} aria-label="Previous slide"><ChevronLeft size={18} /></button>
            <button type="button" className="ui-carousel__arrow ui-carousel__arrow--next" onClick={() => go(current + 1)} disabled={current >= lastIndex} aria-label="Next slide"><ChevronRight size={18} /></button>
          </>
        )}
      </div>
      {showDots && lastIndex > 0 && (
        <div className="ui-carousel__dots" role="group" aria-label="Choose slide">
          {Array.from({ length: lastIndex + 1 }, (_, i) => (
            <button key={i} type="button" className={`ui-carousel__dot ${i === current ? 'ui-carousel__dot--active' : ''}`} aria-label={`Go to slide ${i + 1}`} aria-current={i === current ? 'true' : undefined} onClick={() => go(i)} />
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* Rating                                                             */
/* ---------------------------------------------------------------- */

export interface RatingProps {
  value: number;
  max?: number;
  /** Makes the rating editable. */
  onChange?: (value: number) => void;
  size?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export const Rating: React.FC<RatingProps> = ({ value, max = 5, onChange, size = 16, label = 'Rating', showValue = false, className = '' }) => {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value;
  const stars = Array.from({ length: max }, (_, i) => {
    const fill = Math.max(0, Math.min(1, shown - i));
    return (
      <span key={i} className="ui-rating__star" style={{ width: size, height: size }}>
        <Star size={size} className="ui-rating__empty" aria-hidden="true" />
        <span className="ui-rating__fill" style={{ width: `${fill * 100}%` }}><Star size={size} aria-hidden="true" /></span>
      </span>
    );
  });
  if (!onChange) {
    return (
      <span className={`ui-rating ${className}`} role="img" aria-label={`${label}: ${value} out of ${max}`}>
        {stars}
        {showValue && <span className="ui-rating__value">{value.toFixed(1)}</span>}
      </span>
    );
  }
  return (
    <span className={`ui-rating ui-rating--interactive ${className}`} role="radiogroup" aria-label={label} onMouseLeave={() => setHover(null)}>
      {stars.map((star, i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={Math.round(value) === i + 1}
          aria-label={`${i + 1} star${i ? 's' : ''}`}
          className="ui-rating__btn"
          onMouseEnter={() => setHover(i + 1)}
          onFocus={() => setHover(i + 1)}
          onBlur={() => setHover(null)}
          onClick={() => onChange(i + 1)}
        >
          {star}
        </button>
      ))}
      {showValue && <span className="ui-rating__value">{value.toFixed(1)}</span>}
    </span>
  );
};

/* ---------------------------------------------------------------- */
/* Pricing card                                                       */
/* ---------------------------------------------------------------- */

export interface PricingFeature {
  label: ReactNode;
  included?: boolean;
}

export interface PricingCardProps {
  name: string;
  price: ReactNode;
  period?: string;
  description?: ReactNode;
  features: PricingFeature[];
  cta: ReactNode;
  featured?: boolean;
  badge?: ReactNode;
  className?: string;
}

export const PricingCard: React.FC<PricingCardProps> = ({ name, price, period, description, features, cta, featured = false, badge, className = '' }) => (
  <Card variant={featured ? 'elevated' : 'default'} className={`ui-pricing ${featured ? 'ui-pricing--featured' : ''} ${className}`}>
    <div className="ui-pricing__head">
      <h3 className="ui-pricing__name">{name}</h3>
      {badge}
    </div>
    {description && <p className="ui-pricing__desc">{description}</p>}
    <div className="ui-pricing__price">
      <span className="ui-pricing__amount">{price}</span>
      {period && <span className="ui-pricing__period">{period}</span>}
    </div>
    <ul className="ui-pricing__features">
      {features.map((f, i) => (
        <li key={i} className={`ui-pricing__feature ${f.included === false ? 'ui-pricing__feature--off' : ''}`}>
          {f.included === false ? <Minus size={14} aria-label="Not included" /> : <Check size={14} aria-label="Included" />}
          <span>{f.label}</span>
        </li>
      ))}
    </ul>
    <div className="ui-pricing__cta">{cta}</div>
  </Card>
);

/* ---------------------------------------------------------------- */
/* Testimonial                                                        */
/* ---------------------------------------------------------------- */

export interface TestimonialProps {
  quote: ReactNode;
  name: string;
  role?: string;
  rating?: number;
  variant?: 'card' | 'plain';
  className?: string;
}

export const Testimonial: React.FC<TestimonialProps> = ({ quote, name, role, rating, variant = 'card', className = '' }) => {
  const body = (
    <figure className="ui-testimonial__figure">
      <Quote size={20} className="ui-testimonial__mark" aria-hidden="true" />
      {rating !== undefined && <Rating value={rating} size={14} label={`${name}'s rating`} />}
      <blockquote className="ui-testimonial__quote">{quote}</blockquote>
      <figcaption className="ui-testimonial__author">
        <Avatar name={name} size="md" />
        <span className="ui-testimonial__who">
          <span className="ui-testimonial__name">{name}</span>
          {role && <span className="ui-testimonial__role">{role}</span>}
        </span>
      </figcaption>
    </figure>
  );
  return variant === 'card'
    ? <Card className={`ui-testimonial ${className}`}>{body}</Card>
    : <div className={`ui-testimonial ui-testimonial--plain ${className}`}>{body}</div>;
};
