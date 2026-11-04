# ORCHESTRATION.md — plano de execução para o Codex

Pré-requisito: o repositório já contém `AGENTS.md`, `src/data/questions.ts`, `src/data/cards.ts` e `public/logo-fundo.png` (copie esta pasta para a raiz do projeto). Leia `AGENTS.md` antes de qualquer fase.

## Visão do produto
Um app com dois modos, escolhidos na tela inicial:

1. **Modo Stand (Detetive dos Direitos):** dinâmica rápida (~40 s por pessoa). O organizador usa o dispositivo: o visitante escolhe uma carta (Trabalho ou Consumidor), lê-se a situação, responde-se "Direito violado? Sim/Não", revela-se a resposta e a explicação de uma frase. Sem pontos, sem equipes; todos ganham brinde.
2. **Modo Quiz (rodada de perguntas):** 60 perguntas A/B/C, 3 níveis (fácil 1 pt, médio 2, difícil 3). O mediador lê, os participantes respondem, o mediador revela o gabarito com o fundamento. Pontuação opcional por equipes. Rodada curta = sortear 3 a 5 perguntas por nível.

## Estrutura alvo
```
src/
  data/        questions.ts  cards.ts          (já existem; só o usuário edita)
  lib/         quiz.ts  score.ts  validate.ts  (+ *.test.ts)
  components/  ui/ (shadcn)  Layout.tsx  Brand.tsx  ...
  pages/       Home.tsx  Stand.tsx  QuizSetup.tsx  QuizPlay.tsx  QuizResult.tsx
  App.tsx  main.tsx  index.css
```

---

## Fase 0 — Scaffold
**Prompt:**
> Crie o projeto com Vite + React + TypeScript na raiz atual (sem apagar AGENTS.md, ORCHESTRATION.md, src/data/* e public/*). Instale e configure Tailwind e inicialize o shadcn/ui (tema escuro, alias `@/`). Adicione react-router-dom, vitest e @testing-library/react. Configure scripts `dev`, `build`, `test`, `lint`. Crie `DECISIONS.md` vazio. Faça uma página "Hello" provisória.

**Aceite:** `build`, `lint` e `test` rodam; alias `@/` funciona; `src/data/*.ts` compila sem erros.

## Fase 1 — Tema e layout
**Prompt:**
> Defina o tema (variáveis shadcn + Tailwind) conforme "Identidade visual" do AGENTS.md, inspirado em `public/logo-fundo.png`: fundo em degradê vinho, primária ouro, texto branco. Crie `Layout.tsx` (container mobile-first, largura máxima confortável em desktop, fundo em degradê com a balança da justiça como marca d'água sutil em SVG) e `Brand.tsx` (título "CONHECENDO" ouro + "DIREITOS" branco, em fonte pesada). Adicione os componentes shadcn necessários: button, card, badge, progress, dialog, tabs, switch, separator.

**Aceite:** a página provisória usa Layout + Brand e se parece com a imagem de referência em 390px e em 1280px de largura.

## Fase 2 — Camada de dados e lógica (sem UI)
**Prompt:**
> Em `src/lib/` implemente funções puras e testadas:
> - `validate.ts`: `validateQuestions(qs)` e `validateCards(cs)` que verificam: ids únicos; exatamente 3 alternativas; `answer` em A/B/C; `points` coerente com o nível; pergunta e fundamento não vazios. Também exporta contagem por área/nível. Escreva um teste que roda isso sobre os dados reais e exige 60 perguntas (30 por área, 10 por nível em cada área) e 6 cartas.
> - `quiz.ts`: `buildRound({ area, levels, perLevel, seed? })` que sorteia sem repetição (ordem fácil → médio → difícil, aleatória dentro de cada nível) e `buildFullRound(area?)`; deve aceitar `area: "todas"`.
> - `score.ts`: `scoreFor(question, isCorrect)` e totais por equipe.
> Não use os dados em testes de lógica além do teste de integridade; use fixtures.

**Aceite:** `pnpm test` verde; teste de integridade passa; sorteio nunca repete pergunta.

## Fase 3 — Home
**Prompt:**
> Crie `Home.tsx` com a marca e dois grandes cartões de ação: "Detetive dos Direitos (Stand)" e "Quiz de Perguntas", cada um com uma linha de descrição. Configure as rotas (HashRouter) para `/`, `/stand`, `/quiz`, `/quiz/jogar`, `/quiz/resultado`. Botão discreto para alternar o "modo projeção" (fontes maiores, via classe no `<html>`), persistido em localStorage.

**Aceite:** navegação entre as rotas funciona; modo projeção aumenta tipografia globalmente.

## Fase 4 — Modo Stand
**Prompt:**
> Implemente `Stand.tsx` usando `cards.ts`. Fluxo em uma tela, sem rolagem no celular:
> 1) Escolha da área: dois botões grandes (Direito do Trabalho: "Salário, jornada, férias e registro" / Direito do Consumidor: "Compras, cobranças, ofertas e produtos") e opção "Surpresa".
> 2) Carta sorteada da área (evitar repetir até esgotar o baralho, depois reembaralhar): mostra a situação em texto grande e dois botões "SIM" / "NÃO".
> 3) Ao responder (ou ao tocar em "Revelar" para o organizador), mostra se a resposta correta é SIM ou NÃO com ícone + cor + texto, a explicação ("Aprenda: …") e a etiqueta CLT/CDC. Não diga "errou": o brinde é para todos; use tom positivo.
> 4) Botão "Próximo participante" volta ao passo 1. Contador discreto de participantes atendidos na sessão (localStorage, com botão de zerar).
> Tudo vem de `cards.ts`; não escreva conteúdo nos componentes.

**Aceite:** fluxo completo em ≤ 4 toques por participante; funciona em 360px; baralho não repete carta até acabar.

## Fase 5 — Quiz: configuração
**Prompt:**
> Implemente `QuizSetup.tsx`: escolher área (Consumidor, Trabalho, Todas), formato ("Rodada curta": 3 a 5 perguntas por nível com seletor; "Rodada completa": todas as perguntas da área) e pontuação por equipes opcional (Switch; 2 a 6 equipes com nomes editáveis, padrão "Equipe 1…"). Mostre um resumo (nº de perguntas e pontos máximos) calculado a partir dos dados. Botão "Começar" cria a rodada com `buildRound` e guarda o estado em um contexto/store simples (useReducer + Context) persistido em sessionStorage, para sobreviver a recarregar a página.

**Aceite:** resumo reflete os dados; recarregar a página durante o jogo não perde a rodada.

## Fase 6 — Quiz: jogar e resultado
**Prompt:**
> Implemente `QuizPlay.tsx` e `QuizResult.tsx`. Tela de jogo (visão do mediador, também legível em projetor): barra de progresso; badges de área e nível com os pontos; pergunta em texto grande; alternativas A/B/C como botões. Botão "Revelar resposta" destaca a alternativa correta (ícone + cor), mostra o fundamento legal (`basis`) e, se houver equipes, pergunta "Quem acertou?" com chips das equipes (multi-seleção) e soma os pontos da pergunta. Botões "Anterior/Próxima". Se `corrigido` for true, NÃO exiba nada especial ao público. Resultado: placar final por equipe (ou apenas "Rodada concluída" sem equipes), com "Jogar novamente" e "Voltar ao início".
> Opção "Modo participante" (Switch): o próprio jogador toca na alternativa, o app indica acerto/erro e acumula pontos individuais.

**Aceite:** rodada completa jogável com e sem equipes; pontos corretos por nível (1/2/3); sem erros de console.

## Fase 7 — Acabamento
**Prompt:**
> Revise acessibilidade (foco, contraste AA, `aria-live` na revelação), estados vazios e erros (ex.: rodada sem perguntas disponíveis), animações sutis (respeitando `prefers-reduced-motion`), favicon e `<title>`/meta com a marca. Escreva `README.md` curto em português: como rodar, como editar `questions.ts` e `cards.ts`, como gerar o build estático e hospedar (inclusive abrir `dist/` em um dispositivo no stand). Rode lint, testes e build finais e liste pendências em `DECISIONS.md`.

**Aceite:** Lighthouse acessibilidade ≥ 90 nas telas principais; README permite a um leigo editar perguntas.

## Fase 8 — Roleta de sorteio (Drawer)

**Prompt:**

Leia AGENTS.md e as Fases 2, 5 e 6 antes de começar. Adicione o formato de rodada “Roleta”, em que cada pergunta é sorteada girando uma roleta dentro de um Drawer.

1. Lógica pura (src/lib/wheel.ts + wheel.test.ts, usando fixtures)

buildWheelSlices(area): retorna as fatias. Para area: "todas", 6 fatias (fácil/média/difícil × trabalho/consumidor); para uma área, 3 fatias (uma por nível). Cada fatia tem level, area, startAngle, endAngle.
spinWheel({ slices, remaining, seed? }): sorteia somente entre fatias que ainda têm perguntas disponíveis (usa o conjunto de perguntas restantes) e devolve { sliceIndex, level, area, finalRotation }. finalRotation = voltas completas (5 a 8) + o ângulo que alinha o centro da fatia ao ponteiro (topo), com pequeno desvio aleatório dentro da fatia para parecer natural.
drawQuestion(remaining, level, area): tira uma pergunta do conjunto restante, sem repetir, e devolve o novo conjunto.
Testes: nunca sorteia fatia esgotada; nunca repete pergunta; o ângulo final cai dentro da fatia sorteada; com tudo esgotado retorna null.

2. Componente WheelDrawer.tsx

Instale o componente com pnpm dlx shadcn@latest add drawer.
A roleta é um SVG com cores por nível (fácil verde, média ouro, difícil vinho/vermelho, com contraste AA para o texto), rótulos “Trabalho”/”Consumidor” em cada metade, ponteiro fixo no topo e o hub central com a marca.
Props: open, slices, result (do spinWheel), onFinished(result).
Sequência: o drawer sobe (open) → a roleta gira com CSS transition em transform: rotate() por ~3,5 s com easing de desaceleração → ao terminar (onTransitionEnd) destaca a fatia sorteada e mostra “Nível MÉDIO · Direito do Consumidor” por ~1 s → chama onFinished → o drawer desce sozinho.
Não deve ser fechável por arrastar nem por clique fora durante o giro (dismissible={false}); sem botão “pular”, para não quebrar a dinâmica.
Respeitar prefers-reduced-motion: sem giro; mostra o resultado direto por ~1 s e fecha.
Acessibilidade: o resultado é anunciado em uma região aria-live="polite"; DrawerTitle e DrawerDescription presentes (exigência do Radix/vaul); foco devolvido ao botão que abriu.

3. Integração

Em QuizSetup.tsx: novo formato “Roleta”, com seletor de nº de perguntas (5, 10, 15 ou “Até esgotar”). O resumo mostra o nº de perguntas e os pontos máximos como faixa (mín–máx), já que o nível é aleatório. O estado persistido (sessionStorage) guarda o conjunto restante e a pergunta atual, para sobreviver a recarregar.
Em QuizPlay.tsx, no formato Roleta: em vez de “Próxima”, o botão é “Girar a roleta”. Ao tocar: spinWheel → abre o WheelDrawer → no onFinished o drawQuestion define a pergunta, o drawer fecha e a tela mostra a pergunta normalmente (badges, alternativas, “Revelar resposta”, “Quem acertou?”).
A primeira pergunta também sai da roleta (tela inicial do jogo com o botão “Girar a roleta”). Não há botão “Anterior” nesse formato.
Fim da rodada: ao atingir o nº escolhido ou esgotar tudo, vai para QuizResult.
Se um nível/área esgotar, a roleta continua girando só entre as fatias com perguntas; as esgotadas aparecem apagadas (cinza) no desenho.

Não escreva texto de pergunta nos componentes. Registre decisões e pendências em DECISIONS.md.

**Aceite:**

O drawer sobe, a roleta gira, para na fatia sorteada, o drawer desce e a pergunta correspondente aparece, sem repetição durante toda a rodada.
Recarregar a página no meio da rodada não perde o estado.
Funciona em 360px e em projetor; com prefers-reduced-motion ativo não há giro.
Testes de wheel.ts verdes; pnpm lint && pnpm test && pnpm build sem erros.


## Checklist final (verificar antes de encerrar)
- [ ] Nenhum texto de pergunta/carta fora de `src/data/`.
- [ ] `validateQuestions` e `validateCards` passam (60 perguntas, 6 cartas).
- [ ] Os dois modos funcionam em 360px e em tela de projetor.
- [ ] `pnpm lint && pnpm test && pnpm build` sem erros.
- [ ] Pendência humana registrada: revisão jurídica dos itens `corrigido: true`.
- [ ] Formato Roleta: drawer sobe, gira, desce e mostra a pergunta./