import Link from "next/link";

export default function NotAvailableRegionPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card rounded-3xl p-8 text-center animate-slide-up relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/20 rounded-full blur-[50px]"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orange-500/20 rounded-full blur-[50px]"></div>
        
        <div className="relative z-10">
          <div className="w-20 h-20 mx-auto rounded-full bg-surface border border-border/50 flex items-center justify-center mb-6 text-3xl shadow-lg">
            🌍
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-3">Service Unavailable</h1>
          
          <p className="text-muted mb-8 leading-relaxed">
            We're sorry, but FlickFlow's AI Video Generation service is currently not available in your region due to local regulations or infrastructure limitations.
          </p>
          
          <div className="bg-surface-hover/50 border border-border/50 rounded-xl p-4 mb-8">
            <h3 className="text-sm font-semibold text-primary-light mb-1">Unlock Worldwide Access</h3>
            <p className="text-xs text-muted">
              Upgrade to Premium to access FlickFlow from anywhere through our dedicated enterprise nodes.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)]">
              View Premium Plans
            </button>
            <Link 
              href="/"
              className="w-full py-3 rounded-xl bg-surface hover:bg-surface-hover border border-border text-foreground transition-all"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
