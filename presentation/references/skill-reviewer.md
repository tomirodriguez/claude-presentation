# Archivo: .claude/skills/code-reviewer/SKILL.md

```markdown
---
description: >-
  Activar cuando el usuario pide revisar código, hacer code review,
  analizar calidad de código, revisar PR, o buscar problemas.
  También para "review this", "check my code", "find bugs".
---

# Code Reviewer Skill

## Instrucciones

Cuando hagas code review:

### 1. Obtener los cambios
```bash
git diff HEAD~1  # Para el último commit
# o
git diff main    # Para comparar con main
```

### 2. Analizar por categorías

**Seguridad**
- Inyección SQL/XSS
- Secrets hardcodeados
- Input no validado

**Correctitud**
- Edge cases no manejados
- Race conditions
- Null/undefined checks

**Mantenibilidad**
- Código duplicado
- Funciones muy largas
- Nombres poco claros

**Performance**
- N+1 queries
- Memory leaks potenciales
- Operaciones innecesarias

### 3. Formato de output

```markdown
## Code Review: [nombre del archivo/feature]

### 🔴 Críticos (bloquean merge)
- [archivo:línea] Descripción del problema

### 🟡 Warnings (deberían arreglarse)
- [archivo:línea] Descripción del problema

### 💡 Sugerencias (nice to have)
- [archivo:línea] Descripción de la mejora

### ✅ Aspectos positivos
- Lo que está bien hecho
```

### 4. Ser constructivo
- Explicar POR QUÉ algo es un problema
- Sugerir cómo solucionarlo
- Reconocer el buen código
```
