# AGENTS.md — Conhecendo Direitos

SPA para uma dinâmica de perguntas sobre Direito do Consumidor e Direito do Trabalho, usada em stand de evento e em rodadas de quiz com mediador.

## Stack (obrigatória)
- React + Vite + TypeScript (SPA, sem backend, sem SSR)
- Tailwind CSS
- shadcn/ui para componentes (Button, Card, Badge, Dialog, Tabs, Progress, Switch, etc.). Não crie componentes próprios quando existir equivalente no shadcn.
- Testes: Vitest. Roteamento: react-router (HashRouter, para hospedar em qualquer lugar).
- Gerenciador de pacotes: pnpm (ou npm se pnpm não existir).

## Dados (regra mais importante)
- `src/data/questions.ts` e `src/data/cards.ts` são a ÚNICA fonte de conteúdo. Nenhuma pergunta, alternativa, resposta ou explicação pode ser escrita em componentes.
- NÃO altere texto, alternativas, `answer` ou `basis` desses arquivos sem instrução explícita. O gabarito já foi corrigido em relação ao PDF original (itens com `corrigido: true`); não "reverta" nada.
- Para mudar o conteúdo, o usuário edita apenas esses dois arquivos. A UI deve reagir sem outras mudanças (ex.: contagens, filtros e telas derivam dos dados).

## Identidade visual (extraída da logo `public/logo-fundo.png`)
Cores medidas por amostragem da imagem. O arquivo `src/theme.css` já contém todos os tokens (shadcn em HSL) — importe-o em `index.css` e NÃO invente outras cores.

| Papel | Hex | Uso |
|---|---|---|
| Fundo topo → meio → base | `#650705` → `#530503` → `#410403` | degradê vertical fixo no `body` |
| Ouro (primária) | `#FEB800` | botões primários, destaques, "CONHECENDO", foco/ring |
| Branco | `#FFFFFF` | texto principal, "DIREITOS" |
| Balança / bordas | `#782D05` | marca d'água da balança, bordas, estado "accent" |
| Vinho profundo | `#310303` | sombra sob o título, texto sobre botão ouro |
| Cartões | `#4A0402` / `#5B0603` | surfaces (card/secondary) |
| Texto secundário | `#C9A99A` | muted-foreground |
| Acerto / erro | `hsl(142 71% 45%)` / `hsl(0 84% 60%)` | sempre com ícone + texto |

Tipografia: sans-serif geométrica de peso ExtraBold/Black em caixa alta para títulos (Montserrat 800/900 — a logo usa esse estilo); corpo em Montserrat/Inter 400–600. Título da marca em duas linhas: "CONHECENDO" (ouro) sobre "DIREITOS" (branco, com sombra suave vinho `#310303`).

Marca d'água: balança da justiça em SVG, preenchimento `#782D05`, centralizada atrás do título, ~35% da largura da tela, sem competir com o texto (contorno vazado nos pratos, haste central, base).

Estilo: cantos bem arredondados (`--radius: 1rem`), cartões levemente translúcidos sobre o degradê, botão primário ouro com texto vinho escuro, sem gradientes extras nem outras cores de acento. Tema escuro único. Mobile-first (retrato 9:16 como a logo), bom também em tablet e projetor/TV (fonte grande).

## Qualidade
- TypeScript estrito, sem `any`. ESLint limpo. `pnpm build` e `pnpm test` devem passar a cada fase.
- Lógica (sorteio, pontuação, validação) em funções puras em `src/lib/`, com testes.
- Acessibilidade: botões grandes (alvo ≥ 48px), contraste AA, foco visível, não depender só de cor (ícone + texto para certo/errado).
- Sem dependências desnecessárias. Sem analytics, sem chamadas de rede.

## Fluxo de trabalho
- Siga `ORCHESTRATION.md` fase por fase. Termine uma fase (critérios de aceite verificados) antes de iniciar a próxima.
- Ao fim de cada fase: rode build + testes, faça commit com mensagem `fase N: <resumo>` e resuma o que fez e qualquer decisão tomada.
- Se algo for ambíguo, escolha a opção mais simples e registre em `DECISIONS.md`; não pare para perguntar.

## Fora de escopo
Login, banco de dados, ranking online, cronômetro obrigatório, divisão automática de equipes.