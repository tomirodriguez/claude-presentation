# Resumen: Cooking with Claude Code

**Fuente**: [Cooking with Claude Code - Siddharth Bharath](https://www.siddharthbharath.com/claude-code-the-complete-guide/)

---

## Los 3 Modos de Chat

Claude Code opera en tres modos distintos, cada uno con su propósito:

### 1. Normal Mode (Default)
- Claude puede leer, escribir, y ejecutar comandos
- Pide permiso para operaciones sensibles
- Uso: Desarrollo general día a día

### 2. Accept Edits Mode
- Acepta automáticamente edits a archivos
- Sigue pidiendo permiso para Bash commands
- Uso: Cuando confías en los cambios de código

### 3. Plan Mode
- Claude solo investiga y planifica
- No puede hacer cambios hasta que apruebes el plan
- Uso: Tareas complejas donde quieres revisar el approach

**Tip**: Usar `Shift+Tab` para ciclar entre modos rápidamente.

---

## CLAUDE.md como Memoria Persistente

El archivo CLAUDE.md actúa como "memoria" entre sesiones:

```markdown
# Project Rules

## Stack
- Next.js 14 App Router
- TypeScript strict mode
- Drizzle ORM

## Conventions
- Use functional components
- Error handling with neverthrow
- Tests with Vitest
```

### Jerarquía de Archivos
1. `~/.claude/CLAUDE.md` - Global (todas las sesiones)
2. `.claude/CLAUDE.md` - Proyecto
3. `CLAUDE.md` en raíz - Proyecto (alternativa)

---

## Git Worktrees para Trabajo Paralelo

Usar worktrees para múltiples features simultáneas:

```bash
# Crear worktree para feature
git worktree add ../project-feature-x feature-x

# Claude Code en cada worktree
cd ../project-feature-x
claude
```

Beneficios:
- Contexto separado por feature
- Sin conflictos de branches
- Múltiples instancias de Claude

---

## Subagentes para Tareas Especializadas

Claude puede lanzar subagentes para trabajo paralelo:

- **Explore**: Investigar codebase rápidamente
- **Plan**: Diseñar arquitectura
- **General-purpose**: Tareas variadas

Uso en prompts:
```
Investiga cómo funciona el sistema de auth mientras yo trabajo en otra cosa
```

---

## MCP (Model Context Protocol)

Conectar Claude a herramientas externas:

```json
// .claude/mcp.json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://..."
      }
    }
  }
}
```

Casos de uso:
- Consultas a base de datos
- APIs externas
- Herramientas de desarrollo

---

## Comandos Personalizados Destacados

### `/commit` - Commits inteligentes
```markdown
---
allowed-tools: Bash(git:*)
---
Analiza los cambios y crea un commit con mensaje descriptivo.
```

### `/review` - Code review
```markdown
Revisa los cambios por:
- Seguridad
- Performance
- Legibilidad
- Tests
```

### `/catchup` - Retomar trabajo
```markdown
Lee el estado actual del repo y resume:
- Qué se estaba haciendo
- Qué falta
- Próximos pasos
```

---

## Manejo de Contexto

### Cuándo usar `/clear`
- Nueva tarea no relacionada
- Conversación descarrilada
- Empezar el día

### Cuándo usar `/compact`
- Mitad de tarea, bajo de contexto
- Breakpoint natural
- Preservar decisiones importantes

### Técnica "Document & Clear"
1. Pedir a Claude que documente progreso en `.md`
2. Ejecutar `/clear`
3. Nueva sesión: "Lee el archivo y continúa"

---

## Takeaways para la Presentación

1. Los **3 modos** permiten control granular sobre Claude
2. **CLAUDE.md** = memoria persistente entre sesiones
3. **Worktrees** habilitan trabajo paralelo efectivo
4. **Subagentes** para investigación sin perder contexto principal
5. **MCP** extiende capacidades con herramientas externas
6. La técnica **Document & Clear** es clave para tareas largas
