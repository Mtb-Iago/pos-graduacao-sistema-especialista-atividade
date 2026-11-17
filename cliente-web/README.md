# cliente-web

Dashboard HTML estático que consulta os microsserviços REST diretamente (sem MCP/IA).

**Acesso:** `http://localhost:3005` (servido pelo `expert-system`)

## Funcionalidades

- **Painel de dados em tempo real** — consulta `service-atletas` (:3001), `service-resultados` (:3002) e `service-rankings` (:3003) com polling a cada 5 segundos.
- **Widget flutuante do Comissário Virtual (MTBExpert)** — interface de chat integrada ao sistema especialista com:
  - Chips rápidos para perguntas frequentes
  - Badges de rastreabilidade (Origem, Latência, Tools MCP executadas)
  - Botão de maximizar/restaurar
