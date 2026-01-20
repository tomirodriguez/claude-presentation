# Resumen: How I Use Claude Code - Builder.io

**Fuente**: [How I use Claude Code - Builder.io Blog](https://www.builder.io/blog/claude-code)

**Autor**: Steve Sewell (CEO de Builder.io)

---

## Contexto del Autor

Steve Sewell migró de Cursor a Claude Code y comparte su experiencia y workflow diario. Como CEO técnico de una empresa de desarrollo, su perspectiva combina productividad práctica con casos de uso reales.

---

## Por Qué Migró de Cursor

### Razones Principales:

1. **Contexto más amplio** - Claude Code maneja más código simultáneamente
2. **Capacidades agentic** - Claude toma decisiones y ejecuta
3. **Menos micro-management** - No necesita guiar cada paso
4. **Mejor para tareas complejas** - Refactorizaciones, migraciones

### Qué Extraña de Cursor:

- Feedback visual inmediato
- Autocompletado mientras escribe
- Interfaz familiar de VS Code

### Conclusión:

> "Uso ambos. Claude Code para trabajo pesado, Cursor para ediciones rápidas."

---

## Workflow Diario de Steve

### Mañana: Planificación

```
1. /clear - Empezar fresco
2. Revisar issues pendientes
3. Pedir a Claude que planifique el día
4. Aprobar o ajustar prioridades
```

### Durante el Día: Ejecución

```
1. Una tarea a la vez
2. Plan Mode para features complejas
3. /compact cuando el contexto crece
4. Commits frecuentes
```

### Final del Día: Cierre

```
1. Documentar trabajo en progreso
2. /clear
3. Preparar para el día siguiente
```

---

## Tips Específicos de Steve

### 1. "Claude es tu Junior Dev más trabajador"

Tratarlo como un desarrollador junior muy capaz:
- Dar instrucciones claras
- Revisar su trabajo
- Guiar cuando se desvía
- Celebrar cuando acierta

### 2. "El contexto es tu memoria compartida"

- Mantenerlo limpio
- No sobrecargarlo
- Documentar externamente lo importante

### 3. "Plan Mode es subestimado"

```
Usar Shift+Tab para Plan Mode:
- Antes de features grandes
- Para refactorizaciones
- Cuando no estás seguro del approach
```

### 4. "CLAUDE.md es tu onboarding automatizado"

```markdown
# En CLAUDE.md:

Cada nuevo dev (humano o AI) lee esto primero.
Es tu documentación viva del proyecto.
```

---

## Casos de Uso Favoritos

### 1. Debugging Complejo

```
"Tengo este error [stack trace].
Investiga el codebase y encuentra la causa raíz."

Claude:
- Lee archivos relevantes
- Traza el flujo
- Identifica el problema
- Propone fix
```

### 2. Refactorizaciones Grandes

```
"Migra todos los componentes de Class a Functional."

Claude:
- Enumera componentes afectados
- Crea plan de migración
- Ejecuta uno por uno
- Verifica cada cambio
```

### 3. Code Reviews

```
"Revisa este PR como si fueras un senior dev exigente."

Claude:
- Analiza cambios
- Identifica issues
- Sugiere mejoras
- Prioriza feedback
```

### 4. Documentación

```
"Documenta este módulo para nuevos devs."

Claude:
- Lee el código
- Entiende la arquitectura
- Genera docs claros
- Incluye ejemplos
```

---

## Errores que Cometió al Principio

### 1. Sesiones Demasiado Largas

**Problema**: No usaba `/clear`, el contexto se volvía confuso.

**Solución**: `/clear` frecuente, sesiones cortas y enfocadas.

### 2. Prompts Vagos

**Problema**: "Mejora este código" → resultados inconsistentes.

**Solución**: Instrucciones específicas con contexto y restricciones.

### 3. No Usar Plan Mode

**Problema**: Claude empezaba a codear sin plan → re-trabajo.

**Solución**: Plan Mode para cualquier tarea > 30 min.

### 4. Ignorar CLAUDE.md

**Problema**: Repetir las mismas instrucciones cada sesión.

**Solución**: Configurar CLAUDE.md una vez, beneficio permanente.

---

## Métricas de Productividad

Según Steve:

| Antes (Cursor) | Después (Claude Code) |
|----------------|----------------------|
| 3-4 features/semana | 5-6 features/semana |
| Mucho micro-management | Más autonomía |
| Contexto fragmentado | Contexto coherente |

---

## Recomendaciones para Equipos

1. **Onboarding con CLAUDE.md** - Todos empiezan igual
2. **Comandos compartidos** - `.claude/commands/` en git
3. **Convenciones documentadas** - En CLAUDE.md
4. **Sesiones de pair programming** - Aprender unos de otros
5. **Experimentación** - Probar nuevos workflows

---

## Takeaways para la Presentación

1. **Migración Cursor → Claude Code** es viable y beneficiosa
2. El **workflow híbrido** (ambos) funciona bien
3. **Plan Mode** es una feature clave subestimada
4. **CLAUDE.md** es "onboarding automatizado"
5. **Sesiones cortas y enfocadas** > sesiones largas
6. Tratar a Claude como un **"junior dev muy trabajador"**
7. Las **métricas muestran mejora real** en productividad
