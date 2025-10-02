export default function Content() {
  return (
    <section className="relative overflow-hidden max-w-7xl bg-[url('https://hoirqrkdgbmvpwutwuwj-all.supabase.co/storage/v1/object/public/assets/assets/0fb4aa0f-5e53-4030-88ae-8f570ef7170c_3840w.jpg')] bg-cover border-white/10 rounded-3xl mt-8 mr-auto ml-auto">
      {/* Overlay con gradientes */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(1000px_400px_at_20%_-10%,rgba(16,185,129,0.18),transparent),radial-gradient(700px_300px_at_90%_10%,rgba(59,130,246,0.12),transparent)] bg-gray-950/40 backdrop-blur-2xl"></div>

      {/* Contenedor */}

      <div className="grid grid-cols-4 grid-rows-5 gap-4 p-4 max-w-7xl mr-0">
        <div className="col-span-3 row-span-5">mapa</div>
        <div className="col-start-4">Buses disponibles</div>
        <div className="col-start-4 row-start-2">3</div>
        <div className="col-start-4 row-start-3">4</div>
        <div className="col-start-4 row-start-4">5</div>
        <div className="col-start-4 row-start-5">6</div>
      </div>
    </section>
  );
}
