/**
 * Theme configuration for IV Architecture website
 * This file centralizes styling configurations for better maintainability
 */

const colors = {
  primary: '#1F2A44', // Midnight Blue
  secondary: '#A9A9A9', // Pewter Grey
  accent: '#C9A28C', // Clay Rose
  light: '#F5F3EF', // Warm Sand
  bronze: '#A38C5E', // Brushed Bronze
  
  // Extended color palette
  indigo: {
    500: '#6366f1',
    700: '#4338ca',
  },
  emerald: {
    500: '#10b981',
    700: '#047857',
  },
  amber: {
    500: '#f59e0b',
    700: '#b45309',
  },
  teal: {
    500: '#14b8a6',
    700: '#0f766e',
  },
  purple: {
    500: '#a855f7',
    700: '#7e22ce',
  },
  rose: {
    500: '#f43f5e',
    700: '#be123c',
  },
};

const typography = {
  headings: {
    fontFamily: 'Playfair Display, serif',
    h1: {
      fontSize: ['2.25rem', '3rem'], // [mobile, desktop]
      lineHeight: '1.2',
      fontWeight: '600',
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '1.5rem',
      lineHeight: '1.3',
      fontWeight: '600',
      marginTop: '2.5rem',
      marginBottom: '1rem',
    },
    h3: {
      fontSize: '1.25rem',
      lineHeight: '1.4',
      fontWeight: '600',
      marginTop: '1.5rem',
      marginBottom: '0.75rem',
    }
  },
  prose: {
    fontSize: '1.125rem',
    lineHeight: '1.75',
    maxWidth: '65ch',
    paragraphSpacing: '1.5rem',
    fontWeight: '400',
    letterSpacing: '0.015em',
    paragraphStyles: {
      color: '#4B5563', // Slightly lighter than headings for better readability
      textRendering: 'optimizeLegibility',
    },
    linkStyles: {
      color: colors.accent,
      fontWeight: '500',
      borderBottom: `1px solid ${colors.accent}30`,
      paddingBottom: '0.125rem',
      transition: 'all 0.2s ease-in-out',
      hoverStyles: {
        borderColor: colors.accent,
        textDecoration: 'underline',
        color: colors.teal[700],
      }
    },
    lists: {
      padding: '0 0 0 1.5rem',
      margin: '0 0 1.5rem 0',
      listStyleType: 'disc',
      listItemSpacing: '0.5rem',
    },
    legal: {
      // Privacy and Terms pages specific styles
      h2: {
        privacy: {
          color: colors.indigo[700],
          borderLeftColor: colors.indigo[500],
        },
        terms: {
          color: colors.teal[700],
          borderLeftColor: colors.teal[500],
        }
      },
      h3: {
        privacy: {
          color: colors.emerald[700],
        },
        terms: {
          color: colors.purple[700],
        }
      },
      strong: {
        privacy: {
          color: colors.amber[700],
        },
        terms: {
          color: colors.rose[700],
        }
      }
    }
  }
};

// Button styles
const buttons = {
  base: {
    padding: '0.75rem 1.5rem',
    borderRadius: '0.25rem',
    fontWeight: '500',
    transition: 'background-color 0.15s ease-in-out, border-color 0.15s ease-in-out',
    letterSpacing: '0.01em',
    cursor: 'pointer',
    display: 'inline-block',
    textAlign: 'center',
    minWidth: '10rem',
  },
  primary: {
    backgroundColor: colors.primary,
    color: colors.light,
    hoverBg: '#2B3A5B', // Slightly lighter than Midnight Blue
    activeBg: '#192336', // Slightly darker for pressed state
    borderColor: 'transparent',
  },
  secondary: {
    backgroundColor: colors.bronze,
    color: colors.light,
    hoverBg: '#B69C6D', // Slightly lighter than Brushed Bronze
    activeBg: '#8A774C', // Slightly darker for pressed state
    borderColor: 'transparent',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: '1px',
    borderColor: colors.primary,
    color: colors.primary,
    hoverBg: 'rgba(31, 42, 68, 0.1)',
    activeBg: 'rgba(31, 42, 68, 0.15)',
  },
  text: {
    backgroundColor: 'transparent',
    color: colors.accent,
    hoverColor: '#B5917A', // Slightly lighter Clay Rose
    padding: '0.25rem 0.5rem',
    minWidth: 'auto',
    textDecoration: 'none',
    borderBottom: '1px solid transparent',
    hoverBorderColor: '#B5917A',
  },
  disabled: {
    backgroundColor: '#E5E7EB',
    color: '#9CA3AF',
    cursor: 'not-allowed',
    opacity: '0.7',
  }
};

const spacing = {
  section: {
    padding: {
      y: {
        sm: '4rem',
        lg: '6rem',
      },
      x: {
        sm: '1rem',
        lg: '2rem',
      }
    },
    margin: {
      y: {
        sm: '4rem',
        lg: '6rem',
      }
    }
  }
};

export { colors, typography, spacing, buttons }; 