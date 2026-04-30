import { Leaf, ShieldCheck, FlaskConical, HeartPulse } from "lucide-react";
import heroImage from "@/assets/psotec-hero.jpg";

const features = [
  { icon: Leaf, title: "Fórmula natural", desc: "Ativos botânicos selecionados para peles sensíveis." },
  { icon: FlaskConical, title: "Testado em laboratório", desc: "Eficácia comprovada em estudos dermatológicos." },
  { icon: ShieldCheck, title: "Seguro para uso adulto", desc: "Sem corticoides, sem parabenos, sem fragrâncias agressivas." },
  { icon: HeartPulse, title: "Cuidado contínuo", desc: "Restaura a barreira cutânea e mantém a hidratação." },
];

export const About = () => (
  <section id="sobre" className="py-20 md:py-28 gradient-soft">
    <div className="container grid gap-12 px-4 lg:grid-cols-2 lg:items-center">
      <div className="relative order-2 lg:order-1">
        <div className="absolute inset-0 gradient-health rounded-[3rem] blur-3xl opacity-20" />
        <img
          src={heroImage}
          alt="Pomada Psotec"
          loading="lazy"
          width={1280}
          height={1280}
          className="relative z-10 w-full max-w-md mx-auto rounded-[2.5rem] shadow-card"
        />
      </div>

      <div className="order-1 lg:order-2">
        <span className="text-sm font-bold uppercase tracking-widest text-secondary">
          Sobre o Psotec
        </span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Ciência e natureza,{" "}
          <span className="text-gradient-health">unidas pela sua pele</span>
        </h2>
        <p className="mt-5 text-lg text-muted-foreground">
          O <strong className="text-foreground">Psotec</strong> é uma pomada dermatológica desenvolvida com uma fórmula natural avançada que combina ativos hidratantes, calmantes e regeneradores. Atua diretamente nas causas do desconforto da psoríase, devolvendo conforto, maciez e segurança para a sua pele.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="flex gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground">{f.title}</p>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
