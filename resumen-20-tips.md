# Resumen: 20 Tips para Claude Code

**Fuente**: [20 Tips for Claude Code - Creator Economy](https://www.creatoreconomy.so/p/20-claude-code-tips-vibe-coding)

---

## Workflow Principal: Especificación → Lista de Tareas → Código

### Paso 1: Crear Especificación
- Antes de codificar, escribir una spec clara
- Incluir: objetivos, restricciones, criterios de éxito
- Guardar en un archivo `.md` para referencia

### Paso 2: Generar Lista de Tareas
- Pedir a Claude que divida la spec en tareas
- Usar el TodoWrite tool para tracking
- Revisar y ajustar la lista antes de empezar

### Paso 3: Ejecutar Tarea por Tarea
- Una tarea a la vez
- Verificar cada tarea antes de continuar
- Iterar si es necesario

---

## Tips Organizados por Categoría

### Calidad de Prompts

1. **Ser específico** - "Añade validación de email" vs "Mejora el formulario"
2. **Dar contexto** - Explicar el "por qué"
3. **Mencionar archivos** - Claude lee mejor si sabe dónde buscar
4. **Usar ejemplos** - Mostrar el formato esperado

### Manejo de Sesiones

5. **Sesiones cortas** - Mejor 5 sesiones de 20 min que 1 de 2 horas
6. **`/clear` es tu amigo** - Usar entre tareas no relacionadas
7. **Documentar progreso** - Guardar en `.md` antes de limpiar

### Outputs y Estilos

8. **Pedir formato específico** - JSON, Markdown, código con comentarios
9. **Solicitar explicaciones** - "Explica qué hace cada parte"
10. **Pedir alternativas** - "Dame 3 formas de hacer esto"

### Debugging

11. **Dar el error completo** - Copy-paste del stack trace
12. **Contexto del error** - Qué estabas haciendo cuando falló
13. **Hipótesis** - "Creo que el problema es X, ¿puedes verificar?"

### Productividad

14. **Usar Plan Mode** - Para tareas complejas, planificar primero
15. **Aprovechar subagentes** - Para investigación paralela
16. **Custom commands** - Automatizar flujos repetitivos
17. **CLAUDE.md** - Configurar reglas del proyecto una vez

### Colaboración

18. **Compartir comandos** - Guardar en `.claude/commands/` y commitear
19. **Documentar decisiones** - Claude puede explicar el "por qué"
20. **Onboarding** - Usar Claude para explicar el codebase a nuevos

---

## Errores Comunes a Evitar

| Error | Solución |
|-------|----------|
| Prompts vagos | Ser específico y dar contexto |
| Sesiones muy largas | Usar `/clear` frecuentemente |
| No revisar código | Siempre verificar antes de aceptar |
| Ignorar warnings | Prestar atención a las advertencias de Claude |
| No documentar | Guardar progreso en archivos `.md` |

---

## Takeaways para la Presentación

1. El workflow **Spec → Tasks → Code** reduce errores significativamente
2. **Sesiones cortas y enfocadas** > sesiones largas
3. La **especificidad en prompts** determina la calidad del output
4. **Documentar progreso** antes de limpiar contexto
5. Los **custom commands** ahorran tiempo en flujos repetitivos
