// Edite aqui as informações de contato e CTAs do site
export const SITE_CONFIG = {
  brand: "Psotec",
  whatsappNumber: "5511999999999", // Substitua pelo número real (formato internacional, sem +)
  whatsappMessage: "Olá! Tenho interesse no Psotec e quero saber mais.",
  buyUrl: "#comprar", // Substitua pela URL do checkout
};

export const whatsappLink = () =>
  `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(SITE_CONFIG.whatsappMessage)}`;
