# Decisões e pendências

- Pendência humana: revisar juridicamente os itens de `src/data/questions.ts` marcados com `corrigido: true`.
- Pendência de validação visual: medir Lighthouse nas telas principais e confirmar a meta de acessibilidade ≥ 90. Este ambiente não tem navegador nem Lighthouse instalados; lint, testes e build foram verificados localmente.
- O build de `dist/` deve ser aberto por HTTP em outro dispositivo; abrir `index.html` por `file://` não carrega corretamente os módulos do Vite.
- Para a Fase 8, o comando do shadcn para adicionar Drawer não concluiu por restrições de acesso ao cache do pnpm neste ambiente. A roleta usa `<dialog>` nativo com comportamento de painel inferior, sem dependência adicional.
