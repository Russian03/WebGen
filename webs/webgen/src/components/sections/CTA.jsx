import Button from "../ui/Button";

export default function CTA({ t }) {
  return (
    <section className="section-spacing">
      <div className="container-custom">

        <div className="rounded-[3rem] border border-white/10 bg-white/5 p-20 text-center">

          <h2 className="text-6xl font-bold mb-8 max-w-4xl mx-auto">
            {t.cta.title}
          </h2>

          <Button>
            {t.cta.button}
          </Button>

        </div>
      </div>
    </section>
  );
}