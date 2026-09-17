/** Simple line icons for property neighbourhood / connectivity. */
export default function InfraIcon({ name, className }) {
  const common = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.6',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }

  switch (name) {
    case 'metro':
      return (
        <svg {...common}>
          <rect x="5" y="4" width="14" height="12" rx="2" />
          <path d="M8 16v3M16 16v3M7 20h10M9 8h6M9 11h6" />
        </svg>
      )
    case 'school':
      return (
        <svg {...common}>
          <path d="M3 10 12 5l9 5-9 5-9-5Z" />
          <path d="M7 12.5V17c0 1 2.5 2.5 5 2.5s5-1.5 5-2.5v-4.5" />
        </svg>
      )
    case 'hospital':
      return (
        <svg {...common}>
          <rect x="5" y="4" width="14" height="16" rx="1.5" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      )
    case 'building':
    case 'it':
      return (
        <svg {...common}>
          <path d="M5 20V7l7-3 7 3v13" />
          <path d="M9 20v-5h6v5M9 10h.01M15 10h.01M9 13h.01M15 13h.01" />
        </svg>
      )
    case 'road':
      return (
        <svg {...common}>
          <path d="M8 4 5 20M16 4l3 16M12 6v3M12 12v3M12 18v2" />
        </svg>
      )
    case 'family':
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="2.2" />
          <circle cx="15.5" cy="9" r="1.8" />
          <path d="M4.5 18c.4-2.6 2.4-4 4.5-4s4.1 1.4 4.5 4M13 18c.2-1.8 1.4-2.8 2.8-2.8 1.5 0 2.7 1 3 2.8" />
        </svg>
      )
    case 'green':
      return (
        <svg {...common}>
          <path d="M12 20V10" />
          <path d="M12 14c-3-1.5-4.5-4-4.5-7C10.5 7 12 9 12 10c0-1 1.5-3 4.5-3 0 3-1.5 5.5-4.5 7Z" />
        </svg>
      )
    case 'amenities':
      return (
        <svg {...common}>
          <path d="M4 20h16M6 20V9l6-4 6 4v11" />
          <path d="M10 20v-5h4v5" />
        </svg>
      )
    case 'opportunity':
      return (
        <svg {...common}>
          <path d="M4 18 10 10l4 4 6-8" />
          <path d="M15 6h5v5" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="7" />
          <path d="M12 9v3l2 2" />
        </svg>
      )
  }
}
