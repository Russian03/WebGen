import { motion } from "framer-motion";
import Button from "../ui/Button";
import { useState } from "react";
import ContactModal from "../ui/ContactModal";

export default function Hero({ t }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  return (
    <section className="min-h-screen flex items-center relative overflow-hidden">
      <div className="container-custom grid lg:grid-cols-2 gap-20 items-center">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="uppercase tracking-[0.3em] text-white/50 mb-6 text-sm">
            {t.hero.pretitle}
          </p>

          <h1 className="text-6xl lg:text-8xl font-bold leading-none mb-8">
            {t.hero.title}
          </h1>

          <p className="text-xl text-white/70 max-w-xl mb-10">
            {t.hero.subtitle}
          </p>

          <div className="flex gap-4">
            <Button>{t.hero.primaryButton}</Button>
            <Button onClick={() => setIsOpen(true)}>
              {t.hero.secondaryButton}
            </Button>
          </div>
        </motion.div>

        <div className="relative h-[600px] hidden lg:block">

          {/* Glow */}
          <div
            className="
              absolute
              top-10
              right-0
              w-[450px]
              h-[450px]
              rounded-full
              bg-white/10
              blur-3xl
            "
          />

          {/* Card principal */}
          <div
            className="
              absolute
              top-20
              right-10
              w-[420px]
              rounded-3xl
              border
              border-white/10
              bg-white/[0.03]
              backdrop-blur-xl
              overflow-hidden
              shadow-2xl
            "
          >

            {/* Fake navbar */}
            <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10">

              <div className="w-3 h-3 rounded-full bg-red-400/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
              <div className="w-3 h-3 rounded-full bg-green-400/70" />

            </div>

            {/* Fake content */}
            <div className="p-6 space-y-4">

              <div className="h-8 rounded-xl bg-white/10 w-2/3" />

              <div className="space-y-3">

                <div className="h-4 rounded bg-white/5" />
                <div className="h-4 rounded bg-white/5 w-5/6" />
                <div className="h-4 rounded bg-white/5 w-4/6" />

              </div>

              <div className="grid grid-cols-2 gap-4 pt-6">

                <div className="h-32 rounded-2xl bg-white/5" />
                <div className="h-32 rounded-2xl bg-white/5" />

              </div>

            </div>

          </div>

        </div>
      </div>
      <ContactModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        t={t}
      />
    </section>
  );
}