import { motion } from "framer-motion";

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

            <motion.div
              key={plan.name}

              whileHover={{
                y: -10,
                scale: 1.02
              }}

              transition={{
                type: "spring",
                stiffness: 300
              }}

              className={`
                rounded-3xl
                p-10
                border
                transition-all
                duration-300

                ${
                  plan.featured
                    ? `
                      border-white
                      bg-white
                      text-black
                      scale-105
                      hover:scale-110
                      hover:shadow-2xl
                    `
                    : `
                      border-white/10
                      bg-white/5
                      hover:border-white/30
                      hover:bg-white/10
                      scale-100
                      hover:scale-105
                      hover:shadow-2xl
                    `
                }
              `}
            >

              <h3 className="text-3xl font-bold mb-4">
                {plan.name}
              </h3>

              <p className="text-5xl font-bold mb-10">
                {plan.price}

                <span className="text-lg">
                  /mes
                </span>
              </p>

              <div className="space-y-4">

                {plan.features.map((feature) => (

                  <motion.p
                    key={feature}

                    whileHover={{
                      x: 5
                    }}

                    transition={{
                      duration: 0.2
                    }}
                  >
                    {feature}
                  </motion.p>

                ))}

              </div>

            </motion.div>

          ))}

        </div>
      </div>
    </section>
  );
}