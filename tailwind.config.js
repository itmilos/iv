/** @type {import('tailwindcss').Config} */
import { colors, typography, spacing, buttons } from './src/styles/theme.js';

// Initialize plugins array
const plugins = [];

// Try to load the typography plugin safely
try {
  const typographyPlugin = require('@tailwindcss/typography');
  if (typographyPlugin) {
    plugins.push(typographyPlugin);
  }
} catch (error) {
  console.warn('Warning: @tailwindcss/typography plugin not found. Some typography features may be limited.');
}

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors,
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: typography.prose.maxWidth,
            color: typography.prose.paragraphStyles?.color || '#374151',
            lineHeight: typography.prose.lineHeight,
            letterSpacing: typography.prose.letterSpacing,
            fontWeight: typography.prose.fontWeight,
            textRendering: typography.prose.paragraphStyles?.textRendering,
            p: {
              marginTop: typography.prose.paragraphSpacing,
              marginBottom: typography.prose.paragraphSpacing,
              color: typography.prose.paragraphStyles?.color,
            },
            'h1, h2, h3, h4': {
              fontFamily: typography.headings.fontFamily,
              fontWeight: typography.headings.h2.fontWeight,
            },
            h2: {
              fontSize: typography.headings.h2.fontSize,
              lineHeight: typography.headings.h2.lineHeight,
              marginTop: typography.headings.h2.marginTop,
              marginBottom: typography.headings.h2.marginBottom,
            },
            h3: {
              fontSize: typography.headings.h3.fontSize,
              lineHeight: typography.headings.h3.lineHeight,
              marginTop: typography.headings.h3.marginTop,
              marginBottom: typography.headings.h3.marginBottom,
            },
            a: {
              color: colors.accent,
              fontWeight: typography.prose.linkStyles.fontWeight,
              textDecoration: 'none',
              borderBottomWidth: '1px',
              borderBottomStyle: 'solid',
              borderBottomColor: `${colors.accent}30`,
              paddingBottom: typography.prose.linkStyles.paddingBottom,
              transition: typography.prose.linkStyles.transition,
              '&:hover': {
                borderBottomColor: colors.accent,
                textDecoration: 'underline',
                color: typography.prose.linkStyles.hoverStyles.color,
              },
            },
            ul: {
              paddingLeft: typography.prose.lists.padding.split(' ')[3],
              marginTop: typography.prose.lists.margin.split(' ')[0],
              marginBottom: typography.prose.lists.margin.split(' ')[2],
            },
            li: {
              marginBottom: typography.prose.lists.listItemSpacing,
            },
          },
        },
      },
      spacing: {
        section: spacing.section,
      },
      // Add button component styles
      button: buttons,
    },
  },
  plugins: [
    ...plugins,
    function({ addComponents }) {
      addComponents({
        '.btn': {
          ...buttons.base,
          '&:focus-visible': {
            outline: `2px solid ${colors.accent}`,
            outlineOffset: '2px',
          },
        },
        '.btn-primary': {
          backgroundColor: buttons.primary.backgroundColor,
          color: buttons.primary.color,
          borderColor: buttons.primary.borderColor,
          '&:hover': {
            backgroundColor: buttons.primary.hoverBg,
          },
          '&:active': {
            backgroundColor: buttons.primary.activeBg,
          },
        },
        '.btn-secondary': {
          backgroundColor: buttons.secondary.backgroundColor,
          color: buttons.secondary.color,
          borderColor: buttons.secondary.borderColor,
          '&:hover': {
            backgroundColor: buttons.secondary.hoverBg,
          },
          '&:active': {
            backgroundColor: buttons.secondary.activeBg,
          },
        },
        '.btn-outline': {
          backgroundColor: buttons.outline.backgroundColor,
          color: buttons.outline.color,
          borderWidth: buttons.outline.borderWidth,
          borderColor: buttons.outline.borderColor,
          '&:hover': {
            backgroundColor: buttons.outline.hoverBg,
          },
          '&:active': {
            backgroundColor: buttons.outline.activeBg,
          },
        },
        '.btn-text': {
          backgroundColor: buttons.text.backgroundColor,
          color: buttons.text.color,
          padding: buttons.text.padding,
          minWidth: buttons.text.minWidth,
          textDecoration: buttons.text.textDecoration,
          borderBottom: buttons.text.borderBottom,
          '&:hover': {
            color: buttons.text.hoverColor,
            borderBottomColor: buttons.text.hoverBorderColor,
          },
        },
        '.btn-disabled': {
          backgroundColor: buttons.disabled.backgroundColor,
          color: buttons.disabled.color,
          cursor: buttons.disabled.cursor,
          opacity: buttons.disabled.opacity,
          '&:hover': {
            backgroundColor: buttons.disabled.backgroundColor,
          },
        },
      });
    },
  ],
} 