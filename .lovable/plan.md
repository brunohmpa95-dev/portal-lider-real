Atualizar o telefone/WhatsApp de contato do site para **(37) 99871-7871**.

## Arquivo alterado
- `src/data/constants.ts` — atualizar os campos `phone`, `whatsapp` e `whatsappLink` em `COMPANY`, e os mesmos campos em cada departamento (`sales`, `rental`, `financial`, `support`) dentro de `DEPARTMENTS`.

## Detalhes técnicos
- `phone` / `whatsapp`: `(37) 99871-7871`
- `whatsappLink`: `https://wa.me/5537998717871`
- Todos os locais do site (Header, TopBar, Footer, Contato, botão flutuante de WhatsApp, CTAs) consomem essas constantes, então a troca propaga automaticamente.
- Nenhuma outra alteração de layout ou regra de negócio.