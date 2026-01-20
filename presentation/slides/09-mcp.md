# Slide 8: MCP Servers

## MCP Servers

> **Model Context Protocol - Herramientas externas para Claude**

Protocolo estandar para conectar Claude con herramientas y servicios externos.

---

## El Concepto

```
Claude  <--MCP-->  Base de datos
Claude  <--MCP-->  GitHub
Claude  <--MCP-->  Slack
Claude  <--MCP-->  Browser
```

MCP permite que Claude interactue con sistemas externos de forma segura y estandarizada.

---

## Ejemplos Populares

| Server | Descripcion |
|--------|-------------|
| `@anthropic/mcp-server-postgres` | Consultar bases de datos PostgreSQL |
| `@anthropic/mcp-server-github` | Issues, PRs, repositories |
| `@anthropic/mcp-server-slack` | Leer y enviar mensajes |
| `playwright` | Control de browser para testing |

---

## Configuracion

Archivo: `.claude/settings.json`

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@anthropic/mcp-server-postgres",
        "postgresql://user:pass@localhost/db"
      ]
    }
  }
}
```

---

## Para Profundizar

- **Documentacion completa:** https://docs.anthropic.com/en/docs/claude-code/mcp
- **Repositorio de servers:** https://github.com/anthropics/mcp-servers

---

`/slide 10` -> Comparativa: Cuando Usar Que
