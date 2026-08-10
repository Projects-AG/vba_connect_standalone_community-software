import NavRail from '../components/NavRail'
import TopHeader from '../components/TopHeader'

/**
 * Shared placeholder for features that are not wired yet.
 */
export default function ComingSoonPage({
  title = 'Coming soon',
  subtitle = 'This area is not available yet. Use Chat, Calls, or Calendar for working features.',
  icon = 'hourglass_top',
}) {
  return (
    <div className="bg-surface min-h-screen">
      <TopHeader />
      <div className="flex h-screen pt-12">
        <NavRail withTopOffset />
        <main className="ml-20 flex-1 flex flex-col items-center justify-center px-8">
          <div className="w-full max-w-md text-center animate-content-entrance">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-secondary-container flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[32px] text-on-secondary-container">
                {icon}
              </span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface mb-2">{title}</h1>
            <p className="text-body-md text-on-surface-variant">{subtitle}</p>
          </div>
        </main>
      </div>
    </div>
  )
}
