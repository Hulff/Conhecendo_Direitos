# Conhecendo Direitos

Aplicação de quiz presencial para atividades sobre Direito do Consumidor e Direito do Trabalho. Funciona como SPA estática e usa `HashRouter`.

## Requisitos

- Node.js 20 ou superior
- pnpm

## Rodar localmente

```sh
pnpm i
pnpm dev
```

O Vite mostra o endereço local no terminal. Para validar a aplicação antes de gerar os arquivos estáticos:

```sh
pnpm lint
pnpm test
pnpm build
```

O build fica na pasta `dist/`.

## Editar perguntas e cartas

O conteúdo fica somente nestes arquivos:

- `src/data/questions.ts`: perguntas, alternativas, gabaritos, níveis, fundamentos e fontes.
- `src/data/cards.ts`: situações, respostas, explicações e fontes do modo Stand.

Cada pergunta tem id único, área (`consumidor` ou `trabalho`), nível (`facil`, `medio` ou `dificil`), 3 alternativas, resposta (`A`, `B` ou `C`) e fundamento. A pontuação por nível é 1, 2 e 3 pontos. Cada carta tem id único, área, situação, resposta (`true` = SIM, `false` = NÃO) e explicação.

Edite os registros nesses arquivos e preserve seus formatos TypeScript. Cada pergunta e carta deve manter uma fonte oficial em `source`, com `label` e `url`; o link aparece junto à explicação após a resposta ser revelada. Atualize a referência quando alterar o conteúdo e prefira legislação oficial e jurisprudência dos tribunais. Os testes verificam o conteúdo e a distribuição atual de perguntas e cartas. Itens com `corrigido: true` estão marcados para revisão jurídica humana.

## Hospedar e usar no stand

Publique o conteúdo de `dist/` em qualquer hospedagem de arquivos estáticos. O roteamento por hash permite hospedar o app em subdiretórios. Não abra `dist/index.html` diretamente com `file://`; sirva os arquivos por HTTP.

Para servir o build em um computador conectado à mesma rede do celular ou tablet:

```sh
python3 -m http.server 4173 --directory dist --bind 0.0.0.0
```

Descubra o IP local do computador e abra `http://IP-DO-COMPUTADOR:4173` no dispositivo do stand. Também é possível usar `pnpm exec vite preview --host 0.0.0.0` para uma prévia do build.

O jogo não usa backend, chamadas de rede ou ranking online. A rodada do quiz fica em `sessionStorage`; o contador do Stand fica em `localStorage` no dispositivo atual.
