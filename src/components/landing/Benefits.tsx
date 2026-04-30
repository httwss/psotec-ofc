import { Droplets, Flame, Sparkles, Snowflake } from "lucide-react";

const benefits = [
  {
    icon: Snowflake,
    title: "Reduz a coceira",
    desc: "Sensação de alívio imediato logo nas primeiras aplicações.",
  },
  {
    icon: Flame,
    title: "Diminui a vermelhidão",
    desc: "Acalma a inflamação e devolve o tom natural da pele.",
  },
  {
    icon: Droplets,
    title: "Hidrata profundamente",
    desc: "Nutrição intensiva que mantém a pele macia o dia todo.",
  },
  {
    icon: Sparkles,
    title: "Reduz a descamação",
    desc: "Renova a barreira cutânea e suaviza a textura da pele.",
  },
];

export const Benefits = () => (
  <section id="beneficios" className="py-20 md:py-28 bg-background">
    <div className="container px-4">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-bold uppercase tracking-widest text-primary">
          Benefícios reais
        </span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Cuidado completo para sua{" "}
          <span className="text-gradient-health">pele sensível</span>
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Uma fórmula pensada para tratar a psoríase com suavidade e eficácia.
        </p>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((b, i) => (
          <div
            key={b.title}
            className="group relative rounded-3xl border border-border bg-card p-8 shadow-soft transition-bounce hover:-translate-y-2 hover:shadow-card"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-health shadow-glow">
              <b.icon className="h-7 w-7 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground">{b.title}</h3>
            <p className="mt-2 text-muted-foreground">{b.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
