import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
                // OTC Desk custom colors - now with proper theme support
                otc: {
                    // These will now reference the appropriate light theme values by default
                    background: '#f4f8fc', // Light blue background
                    card: '#FFFFFF', // White cards
                    active: '#edf5ff', // Light blue accent
                    'icon-bg': '#edf5ff', // Light blue icon background
                    icon: '#3b5eeb', // Bright blue for icons
                    text: '#1a2c40', // Dark blue text
                    primary: '#3b5eeb', // Primary blue
                    secondary: '#f7941d', // Orange accent
                    // We keep the theme-specific objects for reference and theme extensions
                    light: {
                        background: '#f4f8fc',
                        card: '#FFFFFF',
                        active: '#edf5ff',
                        'icon-bg': '#edf5ff',
                        icon: '#3b5eeb',
                        text: '#1a2c40',
                        primary: '#3b5eeb',
                        secondary: '#f7941d',
                    },
                    dark: {
                        background: '#0D0D0D',
                        card: '#1A1A1A',
                        active: '#2A2B2C',
                        'icon-bg': '#1E312F',
                        icon: '#33B3A4',
                        text: '#A6A8AE',
                        primary: '#F8B822',
                    }
                },
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			},
            boxShadow: {
                'card': '0 2px 10px rgba(0, 0, 0, 0.08)',
                'hover': '0 5px 15px rgba(0, 0, 0, 0.1)',
                'active': '0 1px 5px rgba(0, 0, 0, 0.1)',
            }
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
