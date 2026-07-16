import NavRail from '../components/NavRail'

export default function StubView({ icon, title, subtitle }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface">
      <NavRail />
      <main className="ml-20 flex-1 flex flex-col items-center justify-center bg-surface animate-content-entrance">
        <span className="material-symbols-outlined text-6xl text-outline/30 mb-4">{icon}</span>
        <h2 className="text-headline-xl font-headline-xl text-on-surface">{title}</h2>
        <p className="text-body-lg text-outline mt-1">{subtitle}</p>
      </main>
    </div>
  )
}
