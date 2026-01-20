# Modos y Permisos

> Control total sobre que puede hacer Claude

---

## Los 3 Modos de Operacion

| Modo | Comportamiento | Ideal para |
|------|----------------|------------|
| **Normal** (default) | Pide permiso para cada accion | Aprender, tareas criticas |
| **Accept Edits** | Edita archivos sin preguntar, pero pide permiso para bash | Refactors, features conocidas |
| **Plan Mode** | Solo investiga y planifica, NO ejecuta nada | Diseno, arquitectura, validar approach |

---

## Cambiar de Modo

```
Shift + Tab
```

Cicla entre los 3 modos: Normal -> Accept Edits -> Plan -> ...

---

## Sistema de Permisos

El comando `/permissions` muestra y configura permisos permanentes.

### Ejemplos de reglas

| Regla | Efecto |
|-------|--------|
| `Allow: Bash(npm test)` | Siempre permitir tests |
| `Allow: Bash(git *)` | Todos los comandos git |
| `Deny: Bash(rm -rf *)` | Nunca permitir esto |

---

`/slide 2` -> CLAUDE.md
