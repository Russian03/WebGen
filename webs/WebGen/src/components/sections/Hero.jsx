import { motion } from "framer-motion";
import Button from "../ui/Button";

export default function Hero({ t }) {
  return (
    <section className="min-h-screen flex items-center relative overflow-hidden">
      <div className="container-custom grid lg:grid-cols-2 gap-20 items-center">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="uppercase tracking-[0.3em] text-white/50 mb-6 text-sm">
            WEBS PER NEGOCIS
          </p>

          <h1 className="text-6xl lg:text-8xl font-bold leading-none mb-8">
            {t.hero.title}
          </h1>

          <p className="text-xl text-white/70 max-w-xl mb-10">
            {t.hero.subtitle}
          </p>

          <div className="flex gap-4">
            <Button>{t.hero.primaryButton}</Button>
            <Button>{t.hero.secondaryButton}</Button>
          </div>
        </motion.div>

        <div className="relative h-[600px] hidden lg:block">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl" />

          <div className="absolute top-20 right-10 w-[420px] rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <div className="h-[300px] rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900" />
          </div>
        </div>
      </div>
    </section>
  );
}