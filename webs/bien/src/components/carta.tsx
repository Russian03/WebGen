import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const platos = [
  { img: "entrante1", categoria: "ENTRANTE", numero: "01", titulo: "Croquetas de Kebab", descripcion: "Croquetas crujientes rellenas de kebab, servidas sobre base de salsa de mango." },
  { img: "entrante2", categoria: "ENTRANTE", numero: "02", titulo: "Patatas Fritas", descripcion: "Ración de patatas fritas doradas y crujientes, cortadas en bastón." },
  { img: "entrante3", categoria: "ENTRANTE", numero: "03", titulo: "Patatas con Carne", descripcion: "Patatas fritas cubiertas con carne, salsa tahini y pico de gallo (tomate, cebolla y cilantro)." },
  { img: "entrante4", categoria: "ENTRANTE", numero: "04", titulo: "Berenjena Frita", descripcion: "Bastones de berenjena frita, dorados y crujientes, acompañados de crema de queso feta." },
  { img: "entrante5", categoria: "ENTRANTE", numero: "05", titulo: "Baba Ganoush", descripcion: "Baba ganoush cremoso de berenjena con aceite de oliva, pistacho, granada, hierbas y toque de sumac." },
  { img: "entrante6", categoria: "ENTRANTE", numero: "06", titulo: "Labneh", descripcion: "Labneh cremoso (yogur colado) con pistachos, sumac y menta; contraste crujiente y toque cítrico y herbal." },
  { img: "entrante7", categoria: "ENTRANTE", numero: "07", titulo: "Hummus con Carne", descripcion: "Hummus cremoso cubierto con carne picada, cebolla morada y perejil." },
  { img: "entrante8", categoria: "ENTRANTE", numero: "08", titulo: "Hummus Bien", descripcion: "Crema suave de garbanzos (hummus) con aceite de harissa, servida con pan de pita para mojar.." },
  { img: "pita1", categoria: "PITA", numero: "09", titulo: "Vegetariano", descripcion: "Pita o durum relleno de falafel de garbanzos con lechuga, cebolla y salsa." },
  { img: "pita2", categoria: "PITA", numero: "10", titulo: "Mixto", descripcion: "Pita o durum relleno de carne mixta de ternera y pollo con verduras." },
  { img: "durum1", categoria: "DURUM", numero: "11", titulo: "Ternera de Girona", descripcion: "Pan plano enrollado (pita o durum) relleno de ternera madurada de Girona." },
  { img: "durum2", categoria: "DURUM", numero: "12", titulo: "Pollo de Corral", descripcion: "Pita o durum relleno de pollo de corral con mezcla de verduras y salsa." },
  { img: "postre1", categoria: "POSTRE", numero: "13", titulo: "Cheesecake", descripcion: "Porción de tarta de queso con pistacho molido, textura cremosa y base de galleta." },
  { img: null, categoria: null, numero: null, titulo: null, descripcion: null },
];

export default function Carta() {

  const handRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const wave = gsap.timeline({
      repeat: -1,
      repeatDelay: 2,
    });

    wave
      .to(handRef.current, { rotation: -10, duration: 0.25, ease: "power1.inOut" })
      .to(handRef.current, { rotation: 10, duration: 0.25, ease: "power1.inOut" })
      .to(handRef.current, { rotation: -5, duration: 0.2, ease: "power1.inOut" })
      .to(handRef.current, { rotation: 5, duration: 0.2, ease: "power1.inOut" })
      .to(handRef.current, { rotation: 0, duration: 0.2, ease: "power1.inOut" });

    return () => wave.kill();
  }, []);

  return (
    <main className="cartaPage">

      <nav className="topNav">
        <div className="topNavLeft">
            <img src="/images/logo.png" alt="Bien Kebab Logo" className="topNavLogo" />
            <div className="infoBlock topNavInfo">
                <div className="infoCol">

                    <a  href="https://maps.app.goo.gl/h2rUacuRcNPcZVAG8"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="infoLink infoLabel"
                    >
                        DONDE
                    </a>

                    <a  href="https://maps.app.goo.gl/h2rUacuRcNPcZVAG8"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="infoLink"
                    >
                        Sant Gervasi de Cassoles
                    </a>

                    <a  href="https://maps.app.goo.gl/h2rUacuRcNPcZVAG8"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="infoLink"
                    >
                        Num 43
                    </a>

                    <a  href="https://maps.app.goo.gl/h2rUacuRcNPcZVAG8"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="infoLink"
                    >
                        Barcelona
                    </a>
                </div>

                <div className="infoCol">
                    <p className="infoLabel">HORARIO</p>
                    <p className="infoText">MON-THU: 16:00 - LATE!</p>
                    <p className="infoText">FRI-SAT: 12/14 - LATE!</p>
                    <p className="infoText">SUNDAYS: 12:00 - 16:00</p>
                </div>
            </div>
        </div>

        <div className="topNavLinks">
          <a href="/" className="navBtn">INICIO</a>
          <button className="navBtn">ABOUT</button>
          <a href="https://www.instagram.com/bienkebab" target="_blank" rel="noopener noreferrer" className="navBtn">INSTA</a>
        </div>

        <button
          className="hamburgerBtn"
          aria-label="Abrir menú"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <svg viewBox="0 0 24 24" width="26" height="26">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </button>

        <nav className={`dropdownMenu dropdownMenuTop ${menuOpen ? "dropdownMenuOpen" : ""}`}>
            <a href="/" className="navBtn" onClick={() => setMenuOpen(false)}>INICIO</a>
            <button className="navBtn" onClick={() => setMenuOpen(false)}>ABOUT</button>
            <a href="https://www.instagram.com/bienkebab" target="_blank" rel="noopener noreferrer" className="navBtn" onClick={() => setMenuOpen(false)}>INSTA</a>
        </nav>
      </nav>

      <div className="parent">
        {platos.map((plato, i) => (
          <div className="plato" key={i}>
            {plato.titulo ? (
              <img
                src={`/images/${plato.img}.jpeg`}
                alt={plato.titulo}
                className="platoImg"
              />
            ) : (
              <div className="platoImgEmpty"></div>
            )}

            {plato.titulo && (
              <div className="platoInfo">
                <div className="platoInfoLeft">
                  <p className="platoIndex">{plato.numero} [ {plato.categoria} ]</p>
                  <p className="platoTitle">{plato.titulo}</p>
                </div>
                <div className="platoInfoRight">
                  <p className="platoDesc">{plato.descripcion}</p>
                </div>
              </div>
            )}

            {!plato.titulo && (
            <div className="kebaperoWrapper">
                <div className="kebaperoBox">
                <img
                    src="/images/kebaperoBody.png"
                    alt="Kebapero"
                    className="kebaperoBody"
                />
                <img
                    ref={handRef}
                    src="/images/kebaperoHand2.png"
                    alt="Hand"
                    className="kebaperoHand"
                    style={{ transformOrigin: "20% 70%" }}
                />
                </div>
            </div>
            )}
          </div>
        ))}
      </div>

      <footer className="cartaFooter">
        <div className="infoBlock">
            <div className="infoCol">
                <a  href="https://maps.app.goo.gl/h2rUacuRcNPcZVAG8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="infoLink infoLabel"
                >
                    DONDE
                </a>
                <a  href="https://maps.app.goo.gl/h2rUacuRcNPcZVAG8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="infoLink"
                >
                    Sant Gervasi de Cassoles
                </a>
                <a  href="https://maps.app.goo.gl/h2rUacuRcNPcZVAG8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="infoLink"
                >
                    Num 43
                </a>
                <a  href="https://maps.app.goo.gl/h2rUacuRcNPcZVAG8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="infoLink"
                >
                    Barcelona
                </a>
            </div>

            <div className="infoCol">
                <p className="infoLabel">HORARIO</p>
                <p className="infoText">MON-THU: 16:00 - LATE!</p>
                <p className="infoText">FRI-SAT: 12/14 - LATE!</p>
                <p className="infoText">SUNDAYS: 12:00 - 16:00</p>
            </div>
        </div>
      </footer>
    </main>
  );
}