# Resumen: Anthropic Best Practices para Claude Code

**Fuente**: [Claude Code Best Practices - Anthropic Engineering](https://www.anthropic.com/engineering/claude-code-best-practices)

---

## Filosofía Central

Claude Code es una herramienta de ingeniería **agentic** - Claude opera como un "conductor", tomando decisiones sobre qué herramientas usar, qué archivos leer, y cómo ejecutar tareas.

---

## Workflow Recomendado: Explore → Plan → Code → Commit

### 1. Explore (Explorar)
- Usar Claude para entender el codebase antes de hacer cambios
- Preguntar: "¿Cómo funciona X?", "¿Dónde está implementado Y?"
- Claude leerá archivos, buscará patrones, y construirá contexto

### 2. Plan (Planificar)
- Pedir a Claude que cree un plan antes de implementar
- Usar **Plan Mode** (Shift+Tab) para que Claude no escriba código hasta que apruebes
- Guardar planes en archivos `.md` para referencia futura

### 3. Code (Codificar)
- Dar instrucciones específicas y contexto
- Usar `/clear` frecuentemente para mantener contexto limpio
- Revisar cambios antes de aceptar

### 4. Commit (Comprometer)
- Claude puede crear commits con mensajes descriptivos
- Revisar el diff antes de commitear

---

## Tips Clave de Productividad

### Manejo de Contexto
- **Usar `/clear` frecuentemente** - No dejar que el contexto se acumule
- **`/compact` con instrucciones específicas** - Ej: `/compact Focus on the authentication changes`
- **Sesiones frescas** son mejores que sesiones largas con mucho contexto

### Especificidad en Prompts
- Ser específico sobre qué quieres
- Dar contexto sobre el "por qué", no solo el "qué"
- Mencionar archivos relevantes explícitamente

### Test-Driven Development (TDD)
- Claude es excelente para TDD
- Escribir tests primero, luego implementar
- Usar ciclos de feedback rápidos

### Iteración Visual
- Para UI/frontend, usar capturas de pantalla
- Claude puede analizar diseños y generar código correspondiente

---

## Anti-Patterns a Evitar

1. **No dejar que el contexto crezca indefinidamente**
2. **No dar instrucciones vagas** - "Hazlo mejor" vs "Reduce la complejidad ciclomática"
3. **No ignorar los planes** - Revisar antes de aprobar
4. **No mezclar tareas no relacionadas** en la misma sesión

---

## Comandos Esenciales Mencionados

| Comando | Uso |
|---------|-----|
| `/clear` | Limpiar contexto completamente |
| `/compact` | Comprimir contexto preservando lo importante |
| `/model` | Cambiar modelo (Haiku para tareas simples, Opus para complejas) |
| `Shift+Tab` | Ciclar entre modos de permisos |

---

## Takeaways para la Presentación

1. Claude Code es **agentic** - toma decisiones autónomamente
2. El workflow **Explore → Plan → Code → Commit** es la base
3. **Contexto limpio = mejores resultados**
4. Especificidad y contexto en prompts son críticos
5. TDD funciona muy bien con Claude
