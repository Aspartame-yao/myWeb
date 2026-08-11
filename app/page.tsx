"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { siGithub, siTiktok, siWechat, siXiaohongshu } from "simple-icons";

type Project = { title: string; type: string; summary: string; contribution: string; demoUrl: string | null };

const projects: readonly Project[] = [
  { title: "VoxelLab", type: "AI Product · 2026", summary: "A spatial AI workspace that turns fragmented inspiration into visible, testable product directions.", contribution: "Product strategy, interaction design, rapid prototyping", demoUrl: null },
  { title: "AI Ad Ecosystem", type: "Platform · 2025", summary: "An intelligent advertising workflow exploring how creative generation, delivery and feedback can form one system.", contribution: "Product architecture, AI workflow, experience design", demoUrl: null },
  { title: "Unknown Orbit", type: "Experimental · Coming soon", summary: "A placeholder for an upcoming interactive product experiment.", contribution: "Details will be added with the project release", demoUrl: null },
  { title: "Signal / 04", type: "Experimental · Coming soon", summary: "A placeholder for an upcoming visual and interaction study.", contribution: "Details will be added with the project release", demoUrl: null },
  { title: "Field Notes / 05", type: "Research · Coming soon", summary: "A placeholder for a future research-led product story.", contribution: "Details will be added with the project release", demoUrl: null },
];

const skillLabels = ["AI PRODUCT", "STRATEGY", "PROTOTYPE", "UX SYSTEM", "RESEARCH", "STORYTELLING", "3D / WEBGL", "AI WORKFLOW", "INTERACTION", "PRODUCT DESIGN"];
const skills = skillLabels.map((title, index) => ({
  title,
  image: `/tube/im${(index % 5) + 1}.jpg`,
}));

type WorkItem = {
  title: string;
  image: string;
  kind: "project" | "skill";
  project?: Project;
};

const workItems: readonly WorkItem[] = [
  ...projects.map((project, index) => ({ title: project.title, image: `/tube/im${index + 1}.jpg`, kind: "project" as const, project })),
  ...skills.map((skill) => ({ ...skill, kind: "skill" as const })),
];

function GlassCat() {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/models/geometric-cat-head.glb");
  const roomReflection = useTexture("/hero/mglab-room.png");
  const model = useRef(scene.clone(true));
  const iceNormal = useMemo(() => {
    const size = 128;
    const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const index = (y * size + x) * 4;
        const ridge = Math.sin(x * 0.31 + Math.sin(y * 0.17) * 2.4);
        const grain = Math.sin((x + y) * 1.73) * 0.45 + Math.sin(x * 2.13 - y * 1.41) * 0.25;
        data[index] = 128 + Math.round((ridge + grain) * 17);
        data[index + 1] = 128 + Math.round((Math.cos(y * 0.27) - grain) * 15);
        data[index + 2] = 238;
        data[index + 3] = 255;
      }
    }
    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3.2, 3.2);
    texture.needsUpdate = true;
    return texture;
  }, []);

  useEffect(() => {
    roomReflection.mapping = THREE.EquirectangularReflectionMapping;
    roomReflection.colorSpace = THREE.SRGBColorSpace;
    model.current.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#010203"),
        metalness: 0.08,
        roughness: 0.015,
        transmission: 0.99,
        thickness: 2.25,
        ior: 1.52,
        transparent: true,
        opacity: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0.005,
        reflectivity: 1,
        envMap: roomReflection,
        envMapIntensity: 8.5,
        normalMap: iceNormal,
        normalScale: new THREE.Vector2(0.18, 0.18),
        side: THREE.DoubleSide,
      });
    });
  }, [iceNormal, roomReflection]);

  useFrame(({ clock, pointer }) => {
    if (!group.current) return;
    group.current.rotation.y = clock.elapsedTime * 0.24 + pointer.x * 0.16;
    group.current.rotation.x = Math.sin(clock.elapsedTime * 0.5) * 0.035 - pointer.y * 0.06;
    group.current.position.y = Math.sin(clock.elapsedTime * 0.8) * 0.05 - 0.9;
  });

  return <group ref={group} scale={2.35}><primitive object={model.current} /></group>;
}

function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 7.4], fov: 34 }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={1.35} />
      <directionalLight position={[4, 5, 6]} intensity={5.5} color="#dff8ff" />
      <pointLight position={[-4, 1, 3]} intensity={55} color="#167dff" distance={9} />
      <pointLight position={[4, -1, 2]} intensity={42} color="#35f0b7" distance={8} />
      <Environment resolution={192}>
        <Lightformer intensity={7} color="#ffffff" position={[0, 4, 4]} scale={[7, 1, 1]} />
        <Lightformer intensity={5} color="#64c8ff" position={[-4, 0, 2]} rotation-y={Math.PI / 2} scale={[5, 1, 1]} />
        <Lightformer intensity={4} color="#8fffd8" position={[4, -1, 1]} rotation-y={-Math.PI / 2} scale={[4, 1, 1]} />
      </Environment>
      <GlassCat />
    </Canvas>
  );
}

function StaggeredGrid({ onSelect }: { onSelect: (project: Project) => void }) {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!section.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const root = section.current;
    const grid = root.querySelector<HTMLElement>(".grid");
    const gridImages = root.querySelectorAll<HTMLElement>(".grid__item-imgwrap");
    const marqueeInner = root.querySelector<HTMLElement>(".mark__inner");
    if (!grid || !marqueeInner) return;

    const lenis = new Lenis({ lerp: 0.12 });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const context = gsap.context(() => {
      gridImages.forEach((imageWrap, index) => {
        const imgEl = imageWrap.querySelector<HTMLElement>(".grid__item-img");
        // The grid always has two columns. Derive the animation direction from
        // the stable DOM order instead of a transformed runtime rectangle.
        // getBoundingClientRect() can cross the viewport midpoint during a
        // ScrollTrigger refresh and make adjacent cards use the same side.
        const leftSide = index % 2 === 0;
        gsap.timeline({
          scrollTrigger: {
            trigger: imageWrap,
            start: "top bottom+=10%",
            end: "bottom top-=25%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
          .from(imageWrap, {
            startAt: { filter: "blur(0px) brightness(100%) contrast(100%)" },
            z: 300,
            rotateX: 70,
            rotateZ: leftSide ? 5 : -5,
            xPercent: leftSide ? -40 : 40,
            skewX: leftSide ? -20 : 20,
            yPercent: 100,
            filter: "blur(7px) brightness(0%) contrast(400%)",
            ease: "sine",
          })
          .to(imageWrap, {
            z: 300,
            rotateX: -50,
            rotateZ: leftSide ? -1 : 1,
            xPercent: leftSide ? -20 : 20,
            skewX: leftSide ? 10 : -10,
            filter: "blur(4px) brightness(0%) contrast(500%)",
            ease: "sine.in",
          })
          .from(imgEl, { scaleY: 1.8, ease: "sine" }, 0)
          .to(imgEl, { scaleY: 1.8, ease: "sine.in" }, ">");
      });

      gsap.timeline({
        scrollTrigger: { trigger: grid, start: "top bottom", end: "bottom top", scrub: true },
      }).fromTo(marqueeInner, { x: "100vw" }, { x: "-100%", ease: "sine" });
    }, root);

    const refresh = () => ScrollTrigger.refresh(true);
    const refreshFrame = requestAnimationFrame(refresh);
    window.addEventListener("load", refresh);
    Promise.all(Array.from({ length: 5 }, (_, index) => new Promise<void>((resolve) => {
      const image = new Image();
      image.onload = image.onerror = () => resolve();
      image.src = `/tube/im${index + 1}.jpg`;
    }))).then(refresh);
    return () => {
      cancelAnimationFrame(refreshFrame);
      window.removeEventListener("load", refresh);
      context.revert();
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <section className="works" id="works" ref={section}>
      <div className="works-heading">
        <p>Selected experiments · 2024—2026</p>
        <h2>Ideas become<br />visible here.</h2>
      </div>
      <div className="grid">
        {Array.from({ length: workItems.length * 2 }, (_, index) => {
          const item = workItems[index % workItems.length];
          return (
          <figure className={`grid__item grid__item--${item.kind}`} key={`${item.title}-${index}`}>
            <button className="grid__item-imgwrap" onClick={() => item.project ? onSelect(item.project) : document.getElementById("skills")?.scrollIntoView({ behavior: "smooth" })} aria-label={item.project ? `Open ${item.title} project details` : `Explore ${item.title} skill`}>
              <span className="grid__item-img" style={{ backgroundImage: `url(${item.image})` }} />
              {item.kind === "skill" && <span className="grid-skill-label">{item.title}</span>}
              <span className="grid-card-hover"><strong>{item.title}</strong><small>{item.project ? "Click to explore ↗" : "View skill ↓"}</small></span>
            </button>
          </figure>
          );
        })}
      </div>
      <div className="mark" aria-hidden="true"><div className="mark__inner"><span>MGLAB</span><span>MAKE IDEAS REAL</span><span>MGLAB</span><span>MAKE IDEAS REAL</span><span>MGLAB</span><span>MAKE IDEAS REAL</span></div></div>
    </section>
  );
}

type ModuleKind = "projects" | "skills" | "about" | "contact";
const socialLinks = [
  { icon: siGithub.path, label: "GitHub", href: "https://github.com/Aspartame-yao", detail: "github.com/Aspartame-yao" },
  { icon: siWechat.path, label: "WeChat", href: "#contact", qr: "/contact/wechat.jpg" },
  { icon: siXiaohongshu.path, label: "Xiaohongshu", href: "#contact", qr: "/contact/xiaohongshu.jpg" },
  { icon: siTiktok.path, label: "Douyin", href: "#contact", qr: "/contact/douyin.jpg" },
  { icon: "M2.25 5.25A2.25 2.25 0 0 1 4.5 3h15a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 19.5 21h-15a2.25 2.25 0 0 1-2.25-2.25V5.25Zm2.02-.75L12 10.52 19.73 4.5H4.27Zm15.98 1.66-7.33 5.7a1.5 1.5 0 0 1-1.84 0l-7.33-5.7v12.59c0 .41.34.75.75.75h15a.75.75 0 0 0 .75-.75V6.16Z", label: "Email", href: "mailto:wangmengarc@163.com", detail: "wangmengarc@163.com" },
];

function ModuleCell({ kind, index }: { kind: ModuleKind; index: number }) {
  if (kind === "skills") {
    const skill = skills[index % skills.length];
    return <div className="module-cell module-cell--skill" style={{ backgroundImage: `url(${skill.image})` }}><strong>{skill.title}</strong></div>;
  }
  return null;
}

function ShowcaseModule({ kind, title, id, onSelect }: { kind: ModuleKind; title: string; id: string; onSelect: (project: Project) => void }) {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!section.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const root = section.current;
    const titleElement = root.querySelector<HTMLElement>(".module-title__word");
    const characters = root.querySelectorAll<HTMLElement>(".module-title__char");
    const fullGrid = root.querySelector<HTMLElement>(".module-grid");
    const gridItems = Array.from(root.querySelectorAll<HTMLElement>(".module-grid__item"));
    const listItems = root.querySelectorAll<HTMLElement>(".module-list__item");
    const aboutPanel = root.querySelector<HTMLElement>(".about-panel");
    if (!titleElement) return;

    const context = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: { trigger: titleElement, start: "top bottom", end: "center center-=25%", scrub: true },
      }).from(characters, {
        ease: "sine",
        yPercent: 300,
        autoAlpha: 0,
        stagger: { each: 0.04, from: "center" },
      });

      if (fullGrid && gridItems.length) {
        const numberOfColumns = getComputedStyle(fullGrid).gridTemplateColumns.split(" ").length;
        const middleColumn = Math.floor(numberOfColumns / 2);
        const columns = Array.from({ length: numberOfColumns }, () => [] as HTMLElement[]);
        gridItems.forEach((item, index) => columns[index % numberOfColumns].push(item));
        columns.forEach((columnItems, columnIndex) => {
          gsap.timeline({
            scrollTrigger: { trigger: fullGrid, start: "top bottom", end: "center center", scrub: true },
          }).from(columnItems, {
            yPercent: 450,
            autoAlpha: 0,
            delay: Math.abs(columnIndex - middleColumn) * 0.2,
            ease: "sine",
          });
        });
      }
      if (listItems.length) gsap.from(listItems, { yPercent: 160, autoAlpha: 0, stagger: 0.12, ease: "sine", scrollTrigger: { trigger: ".module-list", start: "top bottom", end: "center center", scrub: true } });
      if (aboutPanel) gsap.from(aboutPanel, { yPercent: 90, rotateX: 35, autoAlpha: 0, transformOrigin: "50% 0%", ease: "sine", scrollTrigger: { trigger: aboutPanel, start: "top bottom", end: "center center", scrub: true } });
    }, root);

    const refresh = requestAnimationFrame(() => ScrollTrigger.refresh(true));
    return () => { cancelAnimationFrame(refresh); context.revert(); };
  }, []);

  const split = (value: string, className: string) => Array.from(value).map((character, index) => (
    <span className={className} key={`${character}-${index}`}>{character === " " ? "\u00a0" : character}</span>
  ));

  return (
    <section className={`showcase-module showcase-module--${kind}`} id={id} ref={section}>
      <div className="module-title">
        <h2 className="module-title__word" aria-label={title}>{split(title, "module-title__char")}</h2>
      </div>
      {kind === "projects" && <div className="module-list">{projects.map((project, index) => <button className="module-list__item" key={project.title} onClick={() => onSelect(project)}><span>0{index + 1}</span><strong>{project.title}</strong><i>{project.type}</i><b>↗</b></button>)}</div>}
      {kind === "skills" && <div className="module-grid module-grid--skills">{Array.from({ length: 10 }, (_, index) => <figure className="module-grid__item" key={index}><ModuleCell kind={kind} index={index} /></figure>)}</div>}
      {kind === "about" && <div className="about-panel"><p>A small laboratory for turning ambiguous ideas into products people can see, touch and use.</p></div>}
      {kind === "contact" && <div className="contact-links">{socialLinks.map((social) => <a className="contact-link" key={social.label} href={social.href} target={social.href.startsWith("http") ? "_blank" : undefined} rel={social.href.startsWith("http") ? "noreferrer" : undefined} aria-label={social.label}><span className="contact-link__icon"><svg viewBox="0 0 24 24" role="img" aria-hidden="true"><path d={social.icon} /></svg></span><span className={`contact-link__reveal${social.qr ? " is-qr" : ""}`}>{social.qr ? <img src={social.qr} alt={`${social.label} QR code`} /> : social.detail}</span></a>)}</div>}
    </section>
  );
}

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setSelectedProject(null); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = selectedProject ? "hidden" : "";
    return () => { document.documentElement.style.overflow = ""; };
  }, [selectedProject]);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <main>
      <header className="site-header">
        <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>MGLAB</button>
        <nav aria-label="Primary navigation">
          <button onClick={() => go("works")}>Works</button>
          <button onClick={() => go("projects")}>Projects</button>
          <button onClick={() => go("skills")}>Skills</button>
          <button onClick={() => go("about")}>About</button>
        </nav>
      </header>

      <section className="hero" aria-label="MGLAB introduction">
        <div className="hero-background" aria-hidden="true" />
        <h1>MGLAB</h1>
        <div className="hero-canvas"><HeroScene /></div>
        <p className="hero-line">Make Ideas Real</p>
        <button className="scroll-cue" onClick={() => go("works")}><span>Explore</span><i /></button>
      </section>

      <StaggeredGrid onSelect={setSelectedProject} />
      <ShowcaseModule kind="projects" title="PROJECTS" id="projects" onSelect={setSelectedProject} />
      <ShowcaseModule kind="skills" title="SKILLS" id="skills" onSelect={setSelectedProject} />
      <ShowcaseModule kind="about" title="ABOUT" id="about" onSelect={setSelectedProject} />
      <ShowcaseModule kind="contact" title="CONTACT" id="contact" onSelect={setSelectedProject} />

      {selectedProject && (
        <div className="project-modal" role="dialog" aria-modal="true" aria-labelledby="project-title" onClick={() => setSelectedProject(null)}>
          <article onClick={(event) => event.stopPropagation()}>
            <button className="project-close" onClick={() => setSelectedProject(null)} aria-label="Close project details">×</button>
            <div className="project-media">
              <div className="project-visual" style={{ backgroundImage: `url(/tube/im${projects.indexOf(selectedProject) + 1}.jpg)` }} role="img" aria-label={`${selectedProject.title} demo preview`} />
              <span>Demo preview · Image / video</span>
            </div>
            <div className="project-details">
              <p>{selectedProject.type}</p>
              <h2 id="project-title">{selectedProject.title}</h2>
              <p>{selectedProject.summary}</p>
              <dl><dt>Contribution</dt><dd>{selectedProject.contribution}</dd></dl>
              {selectedProject.demoUrl ? <a className="demo-link" href={selectedProject.demoUrl} target="_blank" rel="noreferrer">Experience demo ↗</a> : <span className="demo-link is-disabled">Demo coming soon</span>}
            </div>
          </article>
        </div>
      )}
    </main>
  );
}

useGLTF.preload("/models/geometric-cat-head.glb");
