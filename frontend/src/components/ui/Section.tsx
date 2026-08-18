import type { ReactNode } from 'react';
import './Section.css';

type Props = {
  id?: string;
  title: string;
  subtitle?: string;
  divider?: string;
  className?: string;
  children: ReactNode;
};

export function Section({
  id,
  title,
  subtitle,
  divider = '◆ ◇ ◆',
  className = '',
  children,
}: Props) {
  return (
    <section id={id} className={`section ${className}`.trim()}>
      <div className="container">
        <h2 className="section-title">{title}</h2>
        {subtitle ? <p className="section-subtitle">{subtitle}</p> : null}
        <div className="section-divider">{divider}</div>
        {children}
      </div>
    </section>
  );
}
