export default function HistoriaPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10">
        <p className="mb-2 text-[11px] font-semibold tracking-[0.3em] text-gold-500 uppercase">
          Nuestra historia
        </p>
        <h1 className="text-3xl font-light tracking-tight text-zinc-950">
          Quiénes somos
        </h1>
        <div className="mt-4 h-px w-12 bg-gold-500" />
      </div>

      <div className="prose prose-zinc max-w-none text-zinc-600 leading-relaxed space-y-5">
        <p>
          {/* Pega aquí el contenido de https://www.somosglamourmodels.com/historia/ */}
          Glamour Models es una agencia de talento y modelos con presencia en México y Colombia,
          especializada en la representación de personal para eventos, pasarelas, comerciales y
          activaciones de marca.
        </p>
        <p>
          Fundada con la visión de conectar a las mejores marcas con el talento más destacado de
          la región, hemos construido una red de profesionales comprometidos con la excelencia
          y la imagen.
        </p>
        <p>
          A lo largo de nuestra trayectoria hemos colaborado con marcas reconocidas a nivel
          nacional e internacional, consolidándonos como un referente en la industria del
          talento y la representación artística.
        </p>
      </div>
    </div>
  );
}
