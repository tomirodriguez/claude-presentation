# Comandos Esenciales

> Los que vas a usar todos los dias

---

## Los Criticos: /clear vs /compact

| Comando | Que hace | Cuando usar |
|---------|----------|-------------|
| `/clear` | Borra TODO el contexto | Cambias de tarea, Claude se confunde |
| `/compact` | Comprime el contexto manteniendo resumen | Tarea larga mismo tema, ahorrar tokens, no perder contexto |

```bash
# Compact con foco especifico
/compact Focus on preserving the authentication decisions
```

**Si dudas: /clear**

---

## Informacion y Control

| Comando | Descripcion |
|---------|-------------|
| `/context` | Muestra archivos conocidos + memoria usada |
| `/model` | Cambia el modelo: haiku / sonnet / opus |
| `/usage` | Cuanto llevas gastado en la sesion |
| `/help` | Lista todos los comandos disponibles |

---

## Extended Thinking

**Shortcut:** `Option + T` (macOS) / `Alt + T` (Windows/Linux)

Activa "pensamiento extendido" para problemas complejos:

- Claude razona mas profundamente
- Mejor para: debugging dificil, arquitectura, algoritmos
- Usa mas tokens (pero vale la pena)

---

## Otros Utiles

| Comando | Descripcion |
|---------|-------------|
| `/init` | Genera CLAUDE.md inicial para el proyecto |
| `/review` | Code review de cambios |
| `/pr-comments` | Ver comentarios de PR |
| `/terminal-setup` | Configurar terminal para mejor UX |

---

`/slide 5` -> Slash Commands
