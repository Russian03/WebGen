import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SplitText } from "gsap/SplitText";


gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
gsap.registerPlugin(SplitText);

export default function Hero() {

  const topLayerRef = useRef(null);
  const mainTimelineRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const arrow = gsap.timeline({
      repeat: -1,
      repeatDelay: 1,
    });

    arrow
      .to(".scrollArrow", { y: -5, duration: 0.25, ease: "power1.inOut" })
      .to(".scrollArrow", { y: 5, duration: 0.25, ease: "power1.inOut" })
      .to(".scrollArrow", { y: -2, duration: 0.2, ease: "power1.inOut" })
      .to(".scrollArrow", { y: 2, duration: 0.2, ease: "power1.inOut" })
      .to(".scrollArrow", { y: 0, duration: 0.2, ease: "power1.inOut" });

    return () => arrow.kill();
  }, []);

  useEffect(() => {
    const splitWhere = SplitText.create(".infoCol:nth-child(1)", { type: "lines" });
    const splitWhen = SplitText.create(".infoCol:nth-child(2)", { type: "lines" });
    const splitButtons = SplitText.create(".bottomNav", { type: "words" });

    const tl = gsap.timeline({ paused: true, defaults: { duration: 1 } });

    tl.to(topLayerRef.current, {
      clipPath: "inset(0% 0% 100% 0%)",
      ease: "power2.inOut",
    })
      .from(splitWhere.lines, { y: 100, autoAlpha: 0, stagger: 0.1 })
      .from(splitWhen.lines, { y: 100, autoAlpha: 0, stagger: 0.1 }, "-=0.5")
      .from(splitButtons.words, { y: 100, autoAlpha: 0, stagger: 0.3 }, "-=0.5");

    mainTimelineRef.current = tl;

    return () => {
      tl.kill();
      splitWhere.revert();
      splitWhen.revert();
      splitButtons.revert();
    };
  }, []);

  const handleArrowClick = () => {
    mainTimelineRef.current?.play();
  };

  return (
    <main className="stage">
      <section className="canvas layer layerTop" ref={topLayerRef} style={{ backgroundColor: "#EA572E" }} onClick={handleArrowClick}>
        <section className="space"></section>
            <section className="stack">
                
                <p className="subTitle">
                    (KEBABS A
                    <br />
                    CUCHILLO)
                </p>

                <img
                    src="/images/logo.png"
                    alt="Bien Kebab Logo"
                    className="logoBox object-contain"
                />

            </section>
        <section className="space"></section>

        <button className="scrollArrow" data-action="scroll" aria-label="Bajar">
            <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M12 20V4m0 0l-6 6m6-6l6 6" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </button>
      </section>

      <section className="canvas layer layerBottom" style={{ backgroundColor: "#d4d1c6" }}>
        <section className="space"></section>
            <section className="stack">
                
                <p className="subTitle">
                    (KEBABS A
                    <br />
                    CUCHILLO)
                </p>

            <div className="logoBox object-contain logoMask">
                <video
                    src="/videos/videoLogo.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                />
            </div>

            </section>
        <section className="space"></section>

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

        <nav className="bottomNav">
            <a href="/menu" className="navBtn navLinkText">MENU</a>
            <button className="navBtn navLinkText">ABOUT</button>
            <a href="https://www.instagram.com/bienkebab" target="_blank" rel="noopener noreferrer" className="navBtn navLinkText">INSTA</a>

            <button
            className={`hamburgerBtn ${menuOpen ? "hamburgerBtnOpen" : ""}`}
            aria-label="Abrir menú"
            onClick={() => setMenuOpen((prev) => !prev)}
            >
                <svg viewBox="0 0 24 24" width="26" height="26">
                    <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
            </button>
        </nav>

        <nav className={`dropdownMenu dropdownMenuBottom ${menuOpen ? "dropdownMenuOpen" : ""}`}>
            <a href="/menu" className="navBtn" onClick={() => setMenuOpen(false)}>MENU</a>
            <button className="navBtn" onClick={() => setMenuOpen(false)}>ABOUT</button>
            <a href="https://www.instagram.com/bienkebab" target="_blank" rel="noopener noreferrer" className="navBtn" onClick={() => setMenuOpen(false)}>INSTA</a>
        </nav>

      </section>
    </main>
  );
}