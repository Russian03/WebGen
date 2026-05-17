const plans = [
    {
      name: "Basic",
      price: "49€",
      features: [
        "Web corporativa",
        "Hosting",
        "Manteniment"
      ]
    },
    {
      name: "Business",
      price: "99€",
      featured: true,
      features: [
        "SEO",
        "Analytics",
        "Google Business",
        "Tot el Basic"
      ]
    },
    {
      name: "Growth",
      price: "199€",
      features: [
        "Marketing digital",
        "Automatitzacions",
        "Campanyes",
        "Tot el Business"
      ]
    }
  ];
  
  export default function Pricing({ t }) {
    return (
      <section id="pricing" className="section-spacing">
        <div className="container-custom">
  
          <h2 className="text-5xl font-bold mb-16">
            {t.pricing.title}
          </h2>
  
          <div className="grid lg:grid-cols-3 gap-8">
  
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-3xl p-10 border ${
                  plan.featured
                    ? "border-white bg-white text-black scale-105"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <h3 className="text-3xl font-bold mb-4">
                  {plan.name}
                </h3>
  
                <p className="text-5xl font-bold mb-10">
                  {plan.price}
                  <span className="text-lg">/mes</span>
                </p>
  
                <div className="space-y-4">
                  {plan.features.map((feature) => (
                    <p key={feature}>{feature}</p>
                  ))}
                </div>
              </div>
            ))}
  
          </div>
        </div>
      </section>
    );
  }