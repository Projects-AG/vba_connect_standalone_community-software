import LoopMark from './LoopMark'

/**
 * Full Loop brand lockup.
 * variant: 'header' | 'rail' | 'auth' | 'compact'
 */
export default function LoopBrand({
  variant = 'header',
  showTagline = false,
  animated = true,
  className = '',
}) {
  if (variant === 'rail') {
    return (
      <div className={`flex items-center justify-center ${className}`.trim()} title="loop">
        <LoopMark size="sm" animated={animated} />
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`.trim()}>
        <LoopMark size="sm" animated={animated} />
        <span className="loop-wordmark text-[15px] leading-none text-[#0B1638]">loop</span>
      </div>
    )
  }

  if (variant === 'auth') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`.trim()}>
        <div className="loop-brand-glow mb-5">
          <LoopMark size="hero" animated={animated} />
        </div>
        <h1 className="loop-wordmark text-[42px] leading-none tracking-tight text-[#0B1638] mb-3">
          loop
        </h1>
        {(showTagline ?? true) && (
          <p className="loop-tagline text-[11px] font-semibold tracking-[0.22em] uppercase">
            <span className="loop-tagline__a">Connect</span>
            <span className="loop-tagline__dot">.</span>{' '}
            <span className="loop-tagline__b">Collaborate</span>
            <span className="loop-tagline__dot">.</span>{' '}
            <span className="loop-tagline__c">Achieve</span>
            <span className="loop-tagline__dot">.</span>
          </p>
        )}
      </div>
    )
  }

  // header
  return (
    <div className={`flex items-center gap-2.5 ${className}`.trim()}>
      <LoopMark size="md" animated={animated} />
      <div className="flex flex-col justify-center leading-none">
        <span className="loop-wordmark text-[18px] text-[#0B1638]">loop</span>
        {showTagline && (
          <span className="loop-tagline text-[8px] font-semibold tracking-[0.18em] uppercase mt-1">
            <span className="loop-tagline__a">Connect</span>
            <span className="mx-0.5 text-outline">·</span>
            <span className="loop-tagline__b">Collaborate</span>
          </span>
        )}
      </div>
    </div>
  )
}
