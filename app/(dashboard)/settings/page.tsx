export default function SettingsPage() {
  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-semibold text-zinc-900">Settings</h2>
        <p className="text-sm text-zinc-600">
          Organization and account settings will be implemented in the next phase.
        </p>
      </header>

      <article className="rounded-lg border border-zinc-200 bg-white p-5">
        <h3 className="text-base font-semibold text-zinc-900">Workspace</h3>
        <p className="mt-2 text-sm text-zinc-600">
          Current scope includes authentication, tasks, and member invitation flows.
        </p>
      </article>
    </section>
  );
}
