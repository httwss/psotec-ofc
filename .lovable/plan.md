## Objetivo

Permitir que cada um dos 3 casos da seção "Antes e Depois" tenha suas próprias imagens de antes e depois, em arquivos separados, para você poder trocar cada uma individualmente.

## Mudanças

### 1. Criar arquivos de imagem separados em `src/assets/`

Hoje só existem dois arquivos compartilhados (`before-skin.jpg` e `after-skin-1.jpg`) usados pelos 3 casos. Vou duplicá-los em 6 arquivos dedicados:

- `before-case-1.jpg`
- `after-case-1.jpg`
- `before-case-2.jpg`
- `after-case-2.jpg`
- `before-case-3.jpg`
- `after-case-3.jpg`

Inicialmente todos terão o mesmo conteúdo das imagens atuais (cópia dos arquivos existentes), para nada quebrar visualmente. Depois você me envia (ou troca via Visual Edits) cada imagem individualmente.

### 2. Atualizar `src/components/landing/BeforeAfter.tsx`

- Importar os 6 novos arquivos.
- Transformar o array `cases` para incluir `before` e `after` em cada item:

```ts
const cases = [
  { name: "Caso 1 — 30 dias de uso", before: beforeCase1, after: afterCase1 },
  { name: "Caso 2 — 45 dias de uso", before: beforeCase2, after: afterCase2 },
  { name: "Caso 3 — 60 dias de uso", before: beforeCase3, after: afterCase3 },
];
```

- Trocar os `<img src={beforeImg}>` e `<img src={afterImg}>` por `c.before` e `c.after`.
- Remover os imports antigos não utilizados.

## Resultado

Cada caso passa a ter seu próprio par de imagens, e você pode me pedir para substituir, por exemplo, "a imagem do depois do Caso 2" sem afetar os outros.