# Slide 7: Skills

## Conocimiento Especializado Auto-Activado

**Skills son carpetas de instrucciones y recursos que Claude carga dinámicamente cuando son relevantes.**

A diferencia de CLAUDE.md (siempre cargado), los Skills se activan solo cuando Claude detecta que aplican, optimizando el uso de tokens.

---

## Progressive Disclosure: Carga Inteligente

| Fase | Tokens | Que carga |
|------|--------|-----------|
| **Metadata Scan** | ~100 | Solo lee descriptions de skills disponibles |
| **Full Load** | <5k | Contenido completo de SKILL.md |
| **Resources** | On-demand | Scripts y referencias solo si se necesitan |

---

## Skills vs Slash Commands vs CLAUDE.md

| Caracteristica | Skills | Slash Commands | CLAUDE.md |
|----------------|--------|----------------|-----------|
| **Invocacion** | Auto (Claude decide) | Manual (`/commit`) | Siempre cargado |
| **Estructura** | Carpeta + SKILL.md | Un archivo .md | Un archivo |
| **Proposito** | Conocimiento experto | Acciones rapidas | Contexto del proyecto |
| **Tamanio ideal** | Hasta 500 lineas | Corto | Conciso |

**Regla:** CLAUDE.md para hechos siempre-verdaderos, Skills para procedimientos detallados.

---

## Estructura de un Skill

```
.claude/skills/code-reviewer/
├── SKILL.md              # Instrucciones principales (requerido)
├── scripts/              # Ejecutables (opcional)
│   └── analyze.py
├── references/           # Documentacion detallada (opcional)
│   ├── checklist.md
│   └── examples.md
└── assets/               # Templates, configs (opcional)
```

**Ubicaciones:**
- `.claude/skills/` - Proyecto (compartido con equipo)
- `~/.config/claude/skills/` - Personal (todos tus proyectos)

---

## Anatomia de SKILL.md

```markdown
---
name: code-reviewer
description: >-
  Reviews code for quality and security.
  Use when user asks for code review, PR review,
  or mentions reviewing changes.
allowed-tools: Read, Grep, Glob
---

# Code Review Skill

## Checklist
- [ ] No hardcoded secrets
- [ ] Input validation on user data
- [ ] Error handling is comprehensive

## Output Format
Provide feedback with severity levels:
Critical > High > Medium > Low
```

---

## El `description` es CLAVE

El description determina cuando Claude activa el skill. Usar patron WHEN / WHEN NOT:

**Malo:**
```yaml
description: Helps with documents
```

**Bueno:**
```yaml
description: >-
  Extract tables from PDFs and convert to CSV format.
  Use when user mentions PDF tables, data extraction,
  or converting PDF to spreadsheet.
  Do NOT load for general PDF viewing questions.
```

---

## Scripts: Token-Efficient

Los scripts se ejecutan sin cargar su contenido al contexto:

```
✅ Claude ejecuta script → recibe output (pocos tokens)
❌ Claude lee script → ejecuta manualmente (muchos tokens)
```

En SKILL.md:
```markdown
Para validar, ejecutar:
python scripts/validate.py <file_path>
```

---

## Tool Restrictions

Limitar que herramientas puede usar Claude cuando el Skill esta activo:

```yaml
---
name: safe-reviewer
description: Reviews code without making changes
allowed-tools: Read, Grep, Glob
---
```

> **Nota:** `allowed-tools` solo funciona en Claude Code CLI, no en SDK.

---

## Forked Context: Ejecucion Aislada

Cuando un skill genera **mucho output intermedio**, usa `context: fork` para no contaminar la conversacion principal:

```yaml
---
name: codebase-analysis
description: Analiza arquitectura del codebase completo
context: fork
---
```

**Cuando usar fork:**
- Analisis que genera cientos de lineas de output
- Operaciones multi-paso donde solo importa el resultado final
- Exploracion profunda que no necesita interaccion

**Cuando NO usar fork:**
- Skills simples con output conciso
- Necesitas interaccion con el usuario durante la ejecucion

---

## Fork + Agent Type (Opcional)

Podes especificar que tipo de agente ejecuta el skill forkeado:

```yaml
---
name: deep-exploration
description: Exploracion profunda del codebase
context: fork
agent: Explore  # Usa el agente optimizado para busqueda
---
```

**Tipos disponibles:**
- `Explore` - Optimizado para busqueda de archivos/codigo
- `Plan` - Optimizado para planificacion
- `general-purpose` - Agente generico (default)
- Custom agents de `.claude/agents/`

> **Tip:** En la mayoria de casos, `context: fork` sin especificar `agent` es suficiente.

---

## Skills en Sub-agents Custom

Los sub-agents **NO heredan skills automaticamente**. Si tu sub-agent necesita conocimiento reutilizable, listalo explicitamente:

```markdown
# .claude/agents/security-auditor.md
---
name: security-auditor
description: Auditor de seguridad
skills: owasp-guidelines, vulnerability-patterns
---

Sos un auditor de seguridad...
```

**Cuando usar esto:**
- Tenes skills reutilizables entre multiples sub-agents
- El conocimiento es generico (ej: OWASP) no especifico del workflow

**Cuando NO usarlo:**
- El conocimiento es especifico del sub-agent → ponelo directo en el agent
- Solo un sub-agent usa ese conocimiento → no crees un skill separado

---

## Niveles de Complejidad

```
Nivel 1: Skill basico (90% de casos)
─────────────────────────────────────
SKILL.md con instrucciones directas

Nivel 2: Skill con fork (casos complejos)
─────────────────────────────────────────
context: fork para output verboso

Nivel 3: Sub-agent con skills (reutilizacion)
─────────────────────────────────────────────
Sub-agent que comparte skills con otros agents
```

**Regla:** Empeza siempre por Nivel 1. Solo subi de nivel si tenes una razon concreta.

---

## Cuando Crear un Skill

| Crear Skill cuando... | NO crear Skill cuando... |
|-----------------------|--------------------------|
| Hay workflows repetibles | Info debe estar siempre disponible (usar CLAUDE.md) |
| Se necesita expertise especializado | Necesitas invocacion explicita (usar Slash Command) |
| Multiples conversaciones necesitan el mismo conocimiento | Necesitas acceso a sistemas externos (usar MCP) |
| Quieres bundlear recursos (scripts, templates, docs) | Solo se usa una vez |

---

## Casos de Uso Comunes

- **TDD Skill** - Enforce test-driven development
- **PR Review Skill** - Checklists de seguridad y performance
- **Commit Message Skill** - Formato conventional commits
- **API Documentation Skill** - Genera OpenAPI specs
- **Deployment Skill** - Sigue checklist de deployment

---

## Skills Oficiales de Anthropic

| Skill | Descripcion |
|-------|-------------|
| **skill-creator** | Tool interactivo para crear skills |
| **docx** | Crear y editar documentos Word |
| **pdf** | Manipulacion y extraccion de PDFs |
| **xlsx** | Operaciones con Excel |
| **pptx** | Presentaciones PowerPoint |

Instalar:
```bash
/plugin install document-skills@anthropic-agent-skills
```

---

## Best Practices Resumen

1. **Description excelente** - Especifico con patron WHEN/WHEN NOT
2. **SKILL.md conciso** - Target <500 lineas
3. **Referencias separadas** - Docs detallados en `references/`
4. **Scripts para eficiencia** - Output consume menos tokens
5. **Empezar simple** - Nivel 1 primero, agregar complejidad solo si es necesario

---

`/slide 8` -> Hooks
