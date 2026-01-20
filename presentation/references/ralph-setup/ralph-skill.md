# Archivo: .claude/skills/ralph/SKILL.md

```markdown
---
description: >-
  Ralph es el orquestador principal de desarrollo autónomo.
  Activar cuando el usuario menciona "Ralph", pide implementar un epic,
  feature completo, o desarrollo guiado por specs.
---

# Ralph - Autonomous Development Orchestrator

## Overview

Ralph coordina el desarrollo de features completos desde spec hasta PR,
delegando a skills y agents especializados.

## Workflow

### 1. Spec Phase
Cuando recibas una tarea:
1. Leer el PRD/Epic correspondiente
2. Invocar `/spec-write` para generar user stories detalladas
3. Validar acceptance criteria con el usuario

### 2. Architecture Phase
Para cada story:
1. Analizar impacto en el codebase existente
2. Diseñar solución siguiendo patrones del proyecto
3. Documentar decisiones técnicas

### 3. Implementation Phase
Por cada archivo a modificar:
1. Leer el archivo actual completo
2. Implementar cambios incrementalmente
3. Correr validaciones después de cada cambio:
   - `pnpm typecheck`
   - `pnpm lint`
   - `pnpm test` (si hay tests relacionados)

### 4. Review Phase
Antes de commitear:
1. Self-review usando code-reviewer skill
2. Verificar que todos los acceptance criteria se cumplen
3. Crear commit con mensaje descriptivo

## Reglas Críticas

1. **NUNCA** commitear código que no pasa typecheck
2. **SIEMPRE** leer archivos antes de editarlos
3. **VALIDAR** después de cada cambio significativo
4. **PREGUNTAR** si hay ambigüedad en los requerimientos

## Delegation

- `/spec-write` - Para generar specs detalladas
- Sub-agent "Explore" - Para investigar codebase
- Sub-agent "Plan" - Para diseño de arquitectura
- Skill "code-reviewer" - Para self-review
```
