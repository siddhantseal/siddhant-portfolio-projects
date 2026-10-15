import Link from "next/link";

const projects = [
  {
    title: "Full-Stack E-Commerce",
    href: "/commerce",
    stack: "React, Next.js API routes, cart state, checkout simulation",
    summary: "A responsive storefront with product filtering, dynamic cart totals, and an API-backed checkout flow.",
    metric: "6 products"
  },
  {
    title: "Collaborative Task Manager",
    href: "/tasks",
    stack: "React, browser sync, Socket.io backend reference",
    summary: "A live workspace board with task movement, priority signals, and cross-tab collaboration behavior.",
    metric: "4 workflow lanes"
  }
];

export default function Home() {
  return (
    <main className="shell">
      <section className="hero heroProject">
        <div className="heroCopy">
          <p className="eyebrow">Siddhant Seal</p>
          <h1>Full-stack project proof for internship screening.</h1>
          <p>
            Two resume projects are now implemented as working demos with deploy-ready code, API routes,
            polished responsive UI, and a backend reference for Socket.io collaboration.
          </p>
          <div className="heroActions">
            <Link className="button primary" href="/commerce">Open E-Commerce</Link>
            <Link className="button secondary" href="/tasks">Open Task Manager</Link>
          </div>
        </div>
        <div className="heroVisual" aria-label="Project dashboard preview">
          <div className="statPanel">
            <span>Resume Claims</span>
            <strong>Implemented</strong>
          </div>
          <div className="miniChart">
            <i style={{ height: "48%" }} />
            <i style={{ height: "72%" }} />
            <i style={{ height: "58%" }} />
            <i style={{ height: "86%" }} />
          </div>
          <div className="deployStrip">
            <span>GitHub ready</span>
            <span>Vercel ready</span>
          </div>
        </div>
      </section>

      <section className="projectGrid" aria-label="Projects">
        {projects.map((project) => (
          <Link className="projectCard" key={project.title} href={project.href}>
            <span className="projectMetric">{project.metric}</span>
            <h2>{project.title}</h2>
            <p>{project.summary}</p>
            <small>{project.stack}</small>
          </Link>
        ))}
      </section>
    </main>
  );
}
