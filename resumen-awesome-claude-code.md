# Resumen: awesome-claude-code

**Fuente**: [awesome-claude-code - GitHub](https://github.com/hesreallyhim/awesome-claude-code)

---

## Descripción

Repositorio curado de la comunidad con recursos, herramientas, comandos, y configuraciones para Claude Code.

---

## Categorías de Recursos

### 1. Slash Commands Populares

| Comando | Descripción |
|---------|-------------|
| `/commit` | Commits inteligentes con análisis de cambios |
| `/review` | Code review automatizado |
| `/test` | Ejecutar y corregir tests |
| `/debug` | Debugging sistemático |
| `/explain` | Explicar código en detalle |
| `/refactor` | Refactorización guiada |

### 2. CLAUDE.md Templates

Plantillas para diferentes stacks:
- **Next.js + TypeScript**
- **Python + FastAPI**
- **Go + Chi**
- **React Native**
- **Rust**

Ejemplo de estructura común:
```markdown
# Project
## Stack
## Conventions
## Commands
## Testing
```

### 3. Hooks Útiles

**Pre-commit validation**:
```json
{
  "event": "PreToolUse",
  "matcher": "Bash(git commit:*)",
  "command": "pnpm typecheck && pnpm lint"
}
```

**Security scanning**:
```json
{
  "event": "PostToolUse",
  "matcher": "Write(*)",
  "command": "./scripts/security-check.sh"
}
```

### 4. Custom Agents

Agentes especializados de la comunidad:
- **Security Scanner** - Análisis de vulnerabilidades
- **Performance Analyst** - Detección de bottlenecks
- **Docs Writer** - Generación de documentación
- **Test Generator** - Creación de tests

### 5. Skills Compartidos

Skills reutilizables:
- Patrones de arquitectura (Clean Architecture, DDD)
- Frameworks específicos (Next.js, Astro, SvelteKit)
- Integraciones (Stripe, Auth0, Supabase)

---

## Técnica Ralph

Mencionada como técnica avanzada para desarrollo autónomo:

1. **Orquestación** de múltiples agentes
2. **Memoria** persistente entre sesiones
3. **Planning** estructurado con checkpoints
4. **Validación** automática en cada paso

---

## Herramientas Complementarias

### MCP Servers Populares
- `@modelcontextprotocol/server-postgres` - DB queries
- `@anthropic/mcp-server-github` - GitHub API
- `@anthropic/mcp-server-filesystem` - File operations
- `@anthropic/mcp-server-memory` - Persistent memory

### Integraciones IDE
- VS Code extension
- JetBrains plugin
- Neovim integration

---

## Workflows de la Comunidad

### 1. Feature Development
```
1. /plan - Planificar feature
2. Aprobar plan
3. Implementar paso a paso
4. /test - Verificar
5. /commit - Guardar
```

### 2. Bug Fixing
```
1. /debug [error] - Investigar
2. Identificar root cause
3. Fix + test
4. /commit
```

### 3. Code Review
```
1. /review - Análisis automático
2. Revisar feedback
3. Aplicar fixes
4. Re-review
```

---

## Métricas de la Comunidad

- **Stars**: 2k+
- **Contributors**: 50+
- **Commands compartidos**: 100+
- **Templates CLAUDE.md**: 30+

---

## Takeaways para la Presentación

1. **Comunidad activa** con muchos recursos compartidos
2. Los **templates de CLAUDE.md** aceleran setup de proyectos
3. Los **hooks** automatizan quality gates
4. Los **custom agents** extienden capacidades especializadas
5. Los **MCP servers** conectan con herramientas externas
6. La **técnica Ralph** representa el estado del arte en desarrollo autónomo
