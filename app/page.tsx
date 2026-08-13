"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { siGithub, siTiktok, siWechat, siXiaohongshu } from "simple-icons";

type Project = { title: string; type: string; summary: string; contribution: string; demoUrl: string | null; githubUrl: string | null };
type Skill = { title: string; type: string; summary: string; contribution: string; image: string; githubUrl: string };
type DetailItem = (Project & { image: string; linkLabel: string }) | (Skill & { linkLabel: string });
type Language = "en" | "zh";

const zhContent: Record<string, Partial<Pick<DetailItem, "title" | "type" | "summary" | "contribution">>> = {
  "Tashan Stone": { title: "他山之石", type: "AI 产品 · 广告复刻", summary: "一款 AI 驱动的广告复刻工作室，帮助团队研究参考作品、拆解视觉语言，并将洞察转化为可执行的创意方向。", contribution: "产品概念 · AI 工作流 · 交互设计" },
  "AI Ad Ecosystem": { title: "AI 广告生态", type: "平台 · 2025", summary: "探索创意生成、投放与反馈如何形成统一系统的智能广告工作流。", contribution: "产品架构 · AI 工作流 · 体验设计" },
  "Unknown Orbit": { title: "未知轨道", type: "实验项目 · 即将推出", summary: "一个即将发布的交互产品实验占位项目。", contribution: "将在项目发布时补充详情" },
  "Signal / 04": { title: "信号 / 04", type: "实验项目 · 即将推出", summary: "一个即将发布的视觉与交互研究占位项目。", contribution: "将在项目发布时补充详情" },
  "Field Notes / 05": { title: "田野笔记 / 05", type: "研究 · 即将推出", summary: "一个未来研究驱动型产品故事的占位项目。", contribution: "将在项目发布时补充详情" },
};

const ui = {
  en: { works: "Works", projects: "Projects", skills: "Skills", about: "About", contact: "Contact", explore: "Explore", demoPreview: "Demo preview · Image / video", contribution: "Contribution", demo: "Experience demo ↗", github: "View on GitHub ↗", demoSoon: "Demo coming soon", click: "Click to explore ↗", selected: "Selected experiments · 2024—2026", heading: <>Ideas become<br />visible here.</>, aboutText: "A small laboratory for turning ambiguous ideas into products people can see, touch and use." },
  zh: { works: "作品", projects: "项目", skills: "技能", about: "关于", contact: "联系", explore: "探索", demoPreview: "演示预览 · 图片 / 视频", contribution: "我的贡献", demo: "体验 Demo ↗", github: "查看 GitHub ↗", demoSoon: "Demo 即将推出", click: "点击查看 ↗", selected: "精选实验 · 2024—2026", heading: <>让想法<br />变得可见。</>, aboutText: "一个将模糊想法转化为人们看得见、摸得着、用得上的产品实验室。" },
} as const;

const projects: readonly Project[] = [
  { title: "Tashan Stone", type: "AI Product · Advertising Recreation", summary: "An AI-powered advertising recreation studio that helps teams study reference work, break down its visual language and turn insights into actionable creative directions.", contribution: "Product concept · AI workflow · Interaction design", demoUrl: "https://tashan-stone-ad-recreation-studio.vercel.app/", githubUrl: "https://github.com/Aspartame-yao/recreate_ad.git" },
  { title: "AI Ad Ecosystem", type: "Platform · 2025", summary: "An intelligent advertising workflow exploring how creative generation, delivery and feedback can form one system.", contribution: "Product architecture, AI workflow, experience design", demoUrl: null, githubUrl: null },
  { title: "Unknown Orbit", type: "Experimental · Coming soon", summary: "A placeholder for an upcoming interactive product experiment.", contribution: "Details will be added with the project release", demoUrl: null, githubUrl: null },
  { title: "Signal / 04", type: "Experimental · Coming soon", summary: "A placeholder for an upcoming visual and interaction study.", contribution: "Details will be added with the project release", demoUrl: null, githubUrl: null },
  { title: "Field Notes / 05", type: "Research · Coming soon", summary: "A placeholder for a future research-led product story.", contribution: "Details will be added with the project release", demoUrl: null, githubUrl: null },
];

const skills: readonly Skill[] = [
  {
    title: "analyze-ad-strategy",
    type: "AI Skill · Advertising Strategy",
    summary: "Analyzes advertising inputs, market context and creative signals to turn scattered evidence into a clear, actionable campaign strategy.",
    contribution: "Strategic analysis · Audience insight · Creative direction",
    image: "/skills/001.jpg",
    githubUrl: "https://github.com/Aspartame-yao/analyze-ad-strategy",
  },
  {
    title: "transcribe-video-speech",
    type: "AI Skill · Speech Intelligence",
    summary: "Extracts and structures spoken content from video, creating accurate transcripts that can support editing, search and downstream AI workflows.",
    contribution: "Speech transcription · Content structuring · Video preprocessing",
    image: "/skills/002.jpg",
    githubUrl: "https://github.com/Aspartame-yao/transcribe-video-speech",
  },
  {
    title: "create-shot-remake-skill",
    type: "AI Skill · Shot Reconstruction",
    summary: "Breaks a reference shot into reproducible visual decisions, then translates composition, movement and timing into a practical remake workflow.",
    contribution: "Shot analysis · Visual decomposition · Reproduction planning",
    image: "/skills/003.jpg",
    githubUrl: "https://github.com/Aspartame-yao/create-shot-remake-skill",
  },
  {
    title: "direct-ai-video",
    type: "AI Skill · Creative Direction",
    summary: "Directs AI-generated video from concept to shot-level execution while maintaining a coherent visual language, rhythm and narrative intention.",
    contribution: "AI direction · Shot planning · Visual continuity",
    image: "/skills/004.jpg",
    githubUrl: "https://github.com/Aspartame-yao/direct-ai-video",
  },
  {
    title: "edit-video-by-intent",
    type: "AI Skill · Intent-Based Editing",
    summary: "Turns a creative or communication goal into editing decisions, selecting and arranging footage according to meaning rather than timestamps alone.",
    contribution: "Intent interpretation · Editorial structure · Sequence design",
    image: "/skills/005.jpg",
    githubUrl: "https://github.com/Aspartame-yao/edit-video-by-intent",
  },
  {
    title: "assemble-aigc-video",
    type: "AI Skill · AIGC Assembly",
    summary: "Combines generated shots, audio and narrative components into a coherent video while managing continuity, pacing and delivery requirements.",
    contribution: "Asset assembly · Narrative pacing · Delivery workflow",
    image: "/skills/006.jpg",
    githubUrl: "https://github.com/Aspartame-yao/assemble-aigc-video",
  },
  {
    title: "design-game-trailer",
    type: "AI Skill · Game Marketing",
    summary: "Designs game trailers around player fantasy, core mechanics and dramatic escalation to communicate the experience with clarity and energy.",
    contribution: "Trailer concept · Beat structure · Gameplay storytelling",
    image: "/skills/007.jpg",
    githubUrl: "https://github.com/Aspartame-yao/design-game-trailer",
  },
  {
    title: "build-ecommerce-creative-pack",
    type: "AI Skill · Ecommerce Creative",
    summary: "Builds coordinated ecommerce creative packs across formats, adapting product value propositions into consistent, channel-ready visual assets.",
    contribution: "Creative system · Format adaptation · Commerce messaging",
    image: "/skills/008.jpg",
    githubUrl: "https://github.com/Aspartame-yao/build-ecommerce-creative-pack",
  },
  {
    title: "research-visual-trends",
    type: "AI Skill · Visual Research",
    summary: "Researches emerging visual patterns and cultural signals, separating short-lived aesthetics from trends with meaningful creative potential.",
    contribution: "Trend scanning · Pattern synthesis · Visual opportunity mapping",
    image: "/skills/009.jpg",
    githubUrl: "https://github.com/Aspartame-yao/research-visual-trends",
  },
  {
    title: "track-first-party-ai-news",
    type: "AI Skill · Intelligence Tracking",
    summary: "Tracks first-party AI announcements and product updates at the source, producing a focused signal stream with less speculation and noise.",
    contribution: "Source monitoring · Update verification · Insight synthesis",
    image: "/skills/010.jpg",
    githubUrl: "https://github.com/Aspartame-yao/track-first-party-ai-news",
  },
];

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

function StaggeredGrid({ onSelect, language }: { onSelect: (item: DetailItem) => void; language: Language }) {
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
        <p>{ui[language].selected}</p>
        <h2>{ui[language].heading}</h2>
      </div>
      <div className="grid">
        {Array.from({ length: workItems.length * 2 }, (_, index) => {
          const item = workItems[index % workItems.length];
          return (
          <figure className={`grid__item grid__item--${item.kind}`} key={`${item.title}-${index}`}>
            <button className="grid__item-imgwrap" onClick={() => onSelect(item.project ? { ...item.project, image: item.image, linkLabel: "Experience demo ↗" } : { ...skills.find((skill) => skill.title === item.title)!, linkLabel: "View on GitHub ↗" })} aria-label={`Open ${item.title} details`}>
              <span className="grid__item-img" style={{ backgroundImage: `url(${item.image})` }} />
              <span className="grid-card-hover"><strong>{language === "zh" && item.project ? (zhContent[item.title]?.title ?? item.title) : item.title}</strong><small>{ui[language].click}</small></span>
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
  { icon: siGithub.path, label: "GitHub", href: "https://github.com/Aspartame-yao", detail: "github.com/Aspartame-yao", highContrast: false },
  { icon: siWechat.path, label: "WeChat", href: "#contact", qr: "/contact/wechat.jpg", highContrast: false },
  { icon: siXiaohongshu.path, label: "Xiaohongshu", href: "#contact", qr: "/contact/xiaohongshu.jpg", highContrast: true },
  { icon: siTiktok.path, label: "Douyin", href: "#contact", qr: "/contact/douyin.jpg", highContrast: false },
  { icon: "M2.25 5.25A2.25 2.25 0 0 1 4.5 3h15a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 19.5 21h-15a2.25 2.25 0 0 1-2.25-2.25V5.25Zm2.02-.75L12 10.52 19.73 4.5H4.27Zm15.98 1.66-7.33 5.7a1.5 1.5 0 0 1-1.84 0l-7.33-5.7v12.59c0 .41.34.75.75.75h15a.75.75 0 0 0 .75-.75V6.16Z", label: "Email", href: "mailto:wangmengarc@163.com", detail: "wangmengarc@163.com", highContrast: false },
];

function ModuleCell({ kind, index, onSelect, language }: { kind: ModuleKind; index: number; onSelect: (item: DetailItem) => void; language: Language }) {
  if (kind === "skills") {
    const skill = skills[index % skills.length];
    return <button className="module-cell module-cell--skill" onClick={() => onSelect({ ...skill, linkLabel: ui[language].github })} aria-label={`Open ${skill.title} details`}><span className="module-cell__media" style={{ backgroundImage: `url(${skill.image})` }} /><span className="module-cell__hover"><strong>{skill.title}</strong><small>{ui[language].click}</small></span></button>;
  }
  return null;
}

function ShowcaseModule({ kind, title, id, onSelect, language }: { kind: ModuleKind; title: string; id: string; onSelect: (item: DetailItem) => void; language: Language }) {
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
      gsap.set(characters, { clearProps: "all" });
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
      if (listItems.length) gsap.from(listItems, { yPercent: 160, autoAlpha: 0, stagger: 0.12, ease: "sine", scrollTrigger: { trigger: listItems[0].parentElement, start: "top bottom", end: "center center", scrub: true } });
      if (aboutPanel) gsap.from(aboutPanel, { yPercent: 90, rotateX: 35, autoAlpha: 0, transformOrigin: "50% 0%", ease: "sine", scrollTrigger: { trigger: aboutPanel, start: "top bottom", end: "center center", scrub: true } });
    }, root);

    const refresh = requestAnimationFrame(() => ScrollTrigger.refresh(true));
    return () => { cancelAnimationFrame(refresh); context.revert(); };
  }, [language, title]);

  const split = (value: string, className: string) => Array.from(value).map((character, index) => (
    <span className={className} key={`${character}-${index}`}>{character === " " ? "\u00a0" : character}</span>
  ));

  return (
    <section className={`showcase-module showcase-module--${kind}`} id={id} ref={section}>
      <div className="module-title">
        <h2 className="module-title__word" aria-label={title}>{split(title, "module-title__char")}</h2>
      </div>
      {kind === "projects" && <div className="module-list">{projects.map((project, index) => { const copy = language === "zh" ? { ...project, ...zhContent[project.title] } : project; return <button className="module-list__item" key={project.title} onClick={() => onSelect({ ...project, image: `/tube/im${index + 1}.jpg`, linkLabel: ui[language].demo })}><span>0{index + 1}</span><strong>{copy.title}</strong><i>{copy.type}</i><b>↗</b></button>; })}</div>}
      {kind === "skills" && <div className="module-grid module-grid--skills">{Array.from({ length: 10 }, (_, index) => <figure className="module-grid__item" key={index}><ModuleCell kind={kind} index={index} onSelect={onSelect} language={language} /></figure>)}</div>}
      {kind === "about" && <div className="about-panel"><p>{ui[language].aboutText}</p></div>}
      {kind === "contact" && <div className="contact-links">{socialLinks.map((social) => <a className="contact-link" key={social.label} href={social.href} target={social.href.startsWith("http") ? "_blank" : undefined} rel={social.href.startsWith("http") ? "noreferrer" : undefined} aria-label={social.label}><span className="contact-link__icon"><svg viewBox="0 0 24 24" role="img" aria-hidden="true"><path d={social.icon} /></svg></span><span className={`contact-link__reveal${social.qr ? " is-qr" : ""}`}>{social.qr ? <img className={social.highContrast ? "qr-high-contrast" : undefined} src={social.qr} alt={`${social.label} QR code`} /> : social.detail}</span></a>)}</div>}
    </section>
  );
}

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<DetailItem | null>(null);
  const [language, setLanguage] = useState<Language>("en");
  const copy = ui[language];
  const displayedProject = selectedProject && language === "zh" && "demoUrl" in selectedProject ? { ...selectedProject, ...zhContent[selectedProject.title] } : selectedProject;

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
          <button onClick={() => go("works")}>{copy.works}</button>
          <button onClick={() => go("projects")}>{copy.projects}</button>
          <button onClick={() => go("skills")}>{copy.skills}</button>
          <button onClick={() => go("about")}>{copy.about}</button>
        </nav>
        <button className="language-switch" onClick={() => setLanguage((current) => current === "en" ? "zh" : "en")} aria-label={language === "en" ? "切换为中文" : "Switch to English"}>{language === "en" ? "中文" : "EN"}</button>
      </header>

      <section className="hero" aria-label="MGLAB introduction">
        <div className="hero-background" aria-hidden="true" />
        <h1>MGLAB</h1>
        <div className="hero-canvas"><HeroScene /></div>
        <p className="hero-line">{language === "en" ? "Make Ideas Real" : "让想法可实现"}</p>
        <button className="scroll-cue" onClick={() => go("works")}><span>{copy.explore}</span><i /></button>
      </section>

      <StaggeredGrid onSelect={setSelectedProject} language={language} />
      <ShowcaseModule kind="projects" title={copy.projects.toUpperCase()} id="projects" onSelect={setSelectedProject} language={language} />
      <ShowcaseModule kind="skills" title={copy.skills.toUpperCase()} id="skills" onSelect={setSelectedProject} language={language} />
      <ShowcaseModule kind="about" title={copy.about.toUpperCase()} id="about" onSelect={setSelectedProject} language={language} />
      <ShowcaseModule kind="contact" title={copy.contact.toUpperCase()} id="contact" onSelect={setSelectedProject} language={language} />

      {displayedProject && (
        <div className="project-modal" role="dialog" aria-modal="true" aria-labelledby="project-title" onClick={() => setSelectedProject(null)}>
          <article onClick={(event) => event.stopPropagation()}>
            <button className="project-close" onClick={() => setSelectedProject(null)} aria-label="Close project details">×</button>
            <div className="project-media">
              <div className="project-visual" style={{ backgroundImage: `url(${displayedProject.image})` }} role="img" aria-label={`${displayedProject.title} preview`} />
              <span>{copy.demoPreview}</span>
            </div>
            <div className="project-details">
              <p>{displayedProject.type}</p>
              <h2 id="project-title">{displayedProject.title}</h2>
              <p>{displayedProject.summary}</p>
              <dl><dt>{copy.contribution}</dt><dd>{displayedProject.contribution}</dd></dl>
              <div className="project-links">
                {"demoUrl" in displayedProject && (displayedProject.demoUrl ? <a className="demo-link" href={displayedProject.demoUrl} target="_blank" rel="noreferrer">{copy.demo}</a> : <span className="demo-link is-disabled">{copy.demoSoon}</span>)}
                {displayedProject.githubUrl && <a className="demo-link" href={displayedProject.githubUrl} target="_blank" rel="noreferrer">{copy.github}</a>}
              </div>
            </div>
          </article>
        </div>
      )}
    </main>
  );
}

useGLTF.preload("/models/geometric-cat-head.glb");
