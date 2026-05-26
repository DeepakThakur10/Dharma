/**
 * Dharma Premium SaaS Logo
 * Minimal geometric tree from interconnected nodes and thin lines
 * Inspiration: Notion, Linear, Stripe, Vercel
 * 
 * Design features:
 * - Geometric tree symbolizing growth and collaboration
 * - Connected nodes forming network
 * - Deep green primary color with gold accents
 * - Symmetrical, minimal, premium aesthetic
 */

export default function DharmaLogo({ size = 'md', variant = 'light', showWordmark = true }) {
    const sizeMap = {
        xs: { icon: 24, text: 12 },
        sm: { icon: 32, text: 14 },
        md: { icon: 40, text: 16 },
        lg: { icon: 52, text: 20 },
        xl: { icon: 64, text: 24 },
    };

    const colors = {
        light: {
            primary: '#1e5631', // Deep green
            accent: '#d4af37', // Gold
            text: '#1a1a1a',
            bg: 'transparent'
        },
        dark: {
            primary: '#4ade80', // Light green for dark bg
            accent: '#fbbf24', // Bright gold for dark bg
            text: '#ffffff',
            bg: 'transparent'
        }
    };

    const currentColors = colors[variant];
    const dimensions = sizeMap[size];

    return (
        <div className="flex items-center gap-3">
            {/* Logo Icon Container */}
            <div 
                className="flex-shrink-0 rounded-lg flex items-center justify-center"
                style={{
                    width: dimensions.icon,
                    height: dimensions.icon,
                    background: variant === 'dark' 
                        ? 'linear-gradient(135deg, #0f172a 0%, #1a1a2e 100%)'
                        : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                    boxShadow: variant === 'dark'
                        ? '0 4px 16px rgba(78, 222, 128, 0.1)'
                        : '0 4px 16px rgba(30, 86, 49, 0.08)'
                }}
            >
                <svg 
                    viewBox="0 0 48 48" 
                    width={dimensions.icon}
                    height={dimensions.icon}
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Root node */}
                    <circle cx="24" cy="38" r="2.5" fill={currentColors.primary} />
                    
                    {/* Connection line: root to trunk */}
                    <line x1="24" y1="35" x2="24" y2="28" stroke={currentColors.primary} strokeWidth="1.2" strokeLinecap="round" />
                    
                    {/* Main trunk node */}
                    <circle cx="24" cy="26" r="2.5" fill={currentColors.primary} />
                    
                    {/* Left branch group */}
                    {/* Connection to left hub */}
                    <line x1="24" y1="24.5" x2="16" y2="18" stroke={currentColors.primary} strokeWidth="1.2" strokeLinecap="round" />
                    
                    {/* Left hub node */}
                    <circle cx="16" cy="16" r="2.2" fill={currentColors.primary} />
                    
                    {/* Left-top branch */}
                    <line x1="16" y1="14.2" x2="12" y2="8" stroke={currentColors.primary} strokeWidth="1" strokeLinecap="round" />
                    <circle cx="11" cy="6.5" r="1.8" fill={currentColors.primary} />
                    
                    {/* Left-middle branch */}
                    <line x1="15.5" y1="16" x2="10" y2="16" stroke={currentColors.primary} strokeWidth="1" strokeLinecap="round" />
                    <circle cx="8.5" cy="16" r="1.8" fill={currentColors.primary} />
                    
                    {/* Left-bottom branch */}
                    <line x1="16" y1="17.8" x2="12" y2="24" stroke={currentColors.primary} strokeWidth="1" strokeLinecap="round" />
                    <circle cx="11" cy="25.5" r="1.8" fill={currentColors.primary} />
                    
                    {/* Right branch group */}
                    {/* Connection to right hub */}
                    <line x1="24" y1="24.5" x2="32" y2="18" stroke={currentColors.primary} strokeWidth="1.2" strokeLinecap="round" />
                    
                    {/* Right hub node */}
                    <circle cx="32" cy="16" r="2.2" fill={currentColors.primary} />
                    
                    {/* Right-top branch */}
                    <line x1="32" y1="14.2" x2="36" y2="8" stroke={currentColors.primary} strokeWidth="1" strokeLinecap="round" />
                    <circle cx="37" cy="6.5" r="1.8" fill={currentColors.primary} />
                    
                    {/* Right-middle branch */}
                    <line x1="32.5" y1="16" x2="38" y2="16" stroke={currentColors.primary} strokeWidth="1" strokeLinecap="round" />
                    <circle cx="39.5" cy="16" r="1.8" fill={currentColors.primary} />
                    
                    {/* Right-bottom branch */}
                    <line x1="32" y1="17.8" x2="36" y2="24" stroke={currentColors.primary} strokeWidth="1" strokeLinecap="round" />
                    <circle cx="37" cy="25.5" r="1.8" fill={currentColors.primary} />
                    
                    {/* Gold accent dots on leaf nodes */}
                    <circle cx="11" cy="6.5" r="0.8" fill={currentColors.accent} opacity="0.7" />
                    <circle cx="8.5" cy="16" r="0.8" fill={currentColors.accent} opacity="0.7" />
                    <circle cx="11" cy="25.5" r="0.8" fill={currentColors.accent} opacity="0.7" />
                    <circle cx="37" cy="6.5" r="0.8" fill={currentColors.accent} opacity="0.7" />
                    <circle cx="39.5" cy="16" r="0.8" fill={currentColors.accent} opacity="0.7" />
                    <circle cx="37" cy="25.5" r="0.8" fill={currentColors.accent} opacity="0.7" />
                </svg>
            </div>

            {/* Wordmark */}
            {showWordmark && (
                <span 
                    className="font-display font-bold tracking-tight"
                    style={{
                        fontSize: dimensions.text,
                        color: currentColors.text,
                        letterSpacing: '-0.02em'
                    }}
                >
                    Dharma
                </span>
            )}
        </div>
    );
}
