import { AuthLogo } from './AuthLogo';

export function AuthHero() {
  return (
    <div className="relative flex-1 flex items-center justify-center overflow-hidden">
      {/* Gradient backgrounds */}
      <div className="absolute inset-0 bg-gradient-to-br from-aegis-charcoal via-aegis-black to-aegis-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,168,67,0.08)_0%,_transparent_70%)]" />

      {/* Geometric grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(212,168,67,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,168,67,1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-8 max-w-md">
        <AuthLogo className="justify-center mb-8" />

        <h1 className="text-4xl font-bold tracking-tight text-white mb-4">
          Train Smarter.
          <br />
          <span className="text-aegis-gold">Grow Faster.</span>
        </h1>

        <p className="text-lg text-aegis-muted mb-8">
          Your AI-powered fitness coach that adapts to your goals, tracks your progress, and pushes you further.
        </p>

        {/* Gold divider */}
        <div className="w-16 h-px bg-aegis-gold/30 mx-auto mb-8" />

        {/* Stats */}
        <div className="flex justify-center gap-8">
          {[
            { value: '10K+', label: 'Athletes' },
            { value: '500+', label: 'Exercises' },
            { value: 'AI', label: 'Powered' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-xl font-bold text-aegis-gold">{stat.value}</div>
              <div className="text-xs text-aegis-muted uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
