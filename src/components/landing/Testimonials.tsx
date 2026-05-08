import { Star, Quote } from "lucide-react";
import t1 from "@/assets/testimonial-1.jpg";
import t2 from "@/assets/testimonial-2.jpg";
import t3 from "@/assets/testimonial-3.jpg";

const testimonials = [
  {
    name: "Marina Oliveira",
    location: "São Paulo, SP",
    photo: t1,
    text: "Sofri por mais de 10 anos com psoríase nos braços. Em 3 semanas usando o Psotec a coceira sumiu e a pele voltou a ficar lisa. Mudou minha vida!",
  },
  {
    name: "Carlos Mendes",
    location: "Belo Horizonte, MG",
    photo: t2,
    text: "Já tinha tentado de tudo. O Psotec foi o único que realmente funcionou. Hoje uso camisas de manga curta sem vergonha de novo.",
  },
  {
    name: "Juliana Castro",
    location: "Curitiba, PR",
    photo: t3,
    text: "A hidratação é incrível. A vermelhidão diminuiu já na primeira semana. Recomendo de olhos fechados para quem sofre com psoríase.",
  },
];

export const Testimonials = () => (
  <section id="depoimentos" className="py-20 md:py-28 bg-background">
    <div className="container px-4">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-bold uppercase tracking-widest text-primary">
          Quem usa, recomenda
        </span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Histórias reais de quem{" "}
          <span className="text-gradient-health">recuperou a pele</span>
        </h2>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <article
            key={t.name}
            className="relative rounded-3xl border border-border bg-card p-8 shadow-soft transition-bounce hover:-translate-y-2 hover:shadow-card"
          >
            <Quote className="absolute right-6 top-6 h-10 w-10 text-accent" />
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
              ))}
            </div>
            <p className="mt-4 text-base leading-relaxed text-foreground">
              "{t.text}"
            </p>
            <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
              <img
                src={t.photo}
                alt={t.name}
                loading="lazy"
                width={512}
                height={512}
                className="h-12 w-12 rounded-full object-cover ring-2 ring-accent"
              />
              <div>
                <p className="font-bold text-foreground">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.location}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);
