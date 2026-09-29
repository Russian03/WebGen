export default function Features({ t }) {
    return (
      <section id="features" className="section-spacing">
        <div className="container-custom">
  
          <h2 className="text-5xl font-bold mb-16 max-w-2xl">
            {t.features.title}
          </h2>
  
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  
            {t.features.items.map((item, index) => (
              <div
                key={index}
                className="rounded-3xl border border-white/10 bg-white/5 p-8 hover:bg-white/10 transition-all duration-300"
              >
                <h3 className="text-2xl font-semibold">
                  {item}
                </h3>
              </div>
            ))}
  
          </div>
        </div>
      </section>
    );
  }