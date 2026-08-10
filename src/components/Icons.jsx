const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function Icon({ name, className = 'h-5 w-5' }) {
  const paths = {
    flower: (
      <>
        <circle cx="12" cy="9" r="2.2" />
        <path d="M12 6.8c0-1.8-1-3.3-2.6-3.3S6.8 4.8 7 6.6M12 6.8c0-1.8 1-3.3 2.6-3.3s2.6 1.3 2.4 3.1M9.9 10.2c-1.6-.9-3.4-.6-4.2.8-.8 1.4-.1 3.1 1.5 3.9M14.1 10.2c1.6-.9 3.4-.6 4.2.8.8 1.4.1 3.1-1.5 3.9M12 11.2V21M9 21h6" />
      </>
    ),
    stone: (
      <>
        <path d="M6 21V8a6 6 0 0 1 12 0v13" />
        <path d="M4 21h16M9.5 11h5M9.5 14h5" />
      </>
    ),
    print: (
      <>
        <path d="M7 8V3h10v5" />
        <rect x="4" y="8" width="16" height="8" rx="2" />
        <path d="M7 16v5h10v-5" />
      </>
    ),
    chair: (
      <>
        <path d="M6 3v8h12V3M5 11h14M7 11v10M17 11v10M7 17h10" />
      </>
    ),
    tent: (
      <>
        <path d="M12 3 3 20h18L12 3Z" />
        <path d="M12 3v17M8 20l4-9 4 9" />
      </>
    ),
    tea: (
      <>
        <path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z" />
        <path d="M17 9h2a2.5 2.5 0 0 1 0 5h-2M6 3.5c0 .8.8 1 .8 2M10 3.5c0 .8.8 1 .8 2" />
      </>
    ),
    food: (
      <>
        <path d="M4 4v6a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V4M6 12v8M15 4c-1.5 1-2 2.6-2 4.5S14 12 15.5 12H17v8" />
      </>
    ),
    mic: (
      <>
        <rect x="9" y="3" width="6" height="10" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" />
      </>
    ),
    more: (
      <>
        <circle cx="5" cy="12" r="1.4" />
        <circle cx="12" cy="12" r="1.4" />
        <circle cx="19" cy="12" r="1.4" />
      </>
    ),
    phone: (
      <>
        <path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5L16 12l4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3Z" />
      </>
    ),
    check: <path d="m5 12.5 4.5 4.5L19 7" />,
    chevron: <path d="m14 6-6 6 6 6" />,
    arrow: <path d="M19 12H5m6-7-7 7 7 7" />,
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.2-3.2" />
      </>
    ),
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    close: <path d="M6 6l12 12M18 6 6 18" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    pin: (
      <>
        <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 5 6v6c0 4.4 3 8.1 7 9 4-.9 7-4.6 7-9V6l-7-3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
      {paths[name] || paths.more}
    </svg>
  );
}

export default Icon;
