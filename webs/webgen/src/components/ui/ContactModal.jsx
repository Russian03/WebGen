import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import emailjs from "@emailjs/browser";
import "react-phone-input-2/lib/style.css";
import { PhoneInput } from "react-international-phone";
  
import "react-international-phone/style.css";

export default function ContactModal({
  isOpen,
  onClose,
  t
}) {

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {

      await emailjs.send(
        "service_zy40qjn",
        "template_145cjlf",
        {
            from_name: form.name,
            from_email: form.email,
            phone: form.phone,
            message: form.message
        },
        "-WVPBivPz4HD5D0nr"
      );

      alert(t.contact.success);

      setForm({
        name: "",
        email: "",
        phone: "",
        message: ""
      });

      onClose();

    } catch (error) {

      console.error(error);
      alert(t.contact.error);

    }

    setLoading(false);
  };

  return (

    <AnimatePresence>

      {isOpen && (

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}

          className="
            fixed
            inset-0
            z-50
            bg-black/70
            backdrop-blur-md
            flex
            items-center
            justify-center
            p-6
          "
        >

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
              y: 30
            }}

            animate={{
              opacity: 1,
              scale: 1,
              y: 0
            }}

            exit={{
              opacity: 0,
              scale: 0.9
            }}

            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20
            }}

            className="
              w-full
              max-w-2xl
              rounded-3xl
              border
              border-white/10
              bg-zinc-950
              p-10
            "
          >

            <div className="flex justify-between items-center mb-8">

              <h2 className="text-4xl font-bold">
              {t.contact.title}
              </h2>

              <button
                onClick={onClose}
                className="text-white/60 hover:text-white text-2xl"
              >
                ×
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              <input
                type="text"
                name="name"
                placeholder={t.contact.name}
                value={form.name}
                onChange={handleChange}
                required
                className="
                  w-full
                  rounded-2xl
                  bg-white/5
                  border
                  border-white/10
                  px-6
                  py-4
                  outline-none
                "
              />

                <PhoneInput
                defaultCountry="es"
                value={form.phone}
                onChange={(phone) =>
                    setForm({
                    ...form,
                    phone
                    })
                }
                />

              <input
                type="email"
                name="email"
                placeholder={t.contact.email}
                value={form.email}
                onChange={handleChange}
                required
                className="
                  w-full
                  rounded-2xl
                  bg-white/5
                  border
                  border-white/10
                  px-6
                  py-4
                  outline-none
                "
              />

              <textarea
                name="message"
                placeholder={t.contact.message}
                value={form.message}
                onChange={handleChange}
                rows="5"
                required
                className="
                  w-full
                  rounded-2xl
                  bg-white/5
                  border
                  border-white/10
                  px-6
                  py-4
                  outline-none
                "
              />

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  rounded-2xl
                  bg-white
                  text-black
                  py-4
                  font-semibold
                "
              >
                {loading
                  ? t.contact.sending
                  : t.contact.send}
              </button>

            </form>

          </motion.div>

        </motion.div>

      )}

    </AnimatePresence>
  );
}