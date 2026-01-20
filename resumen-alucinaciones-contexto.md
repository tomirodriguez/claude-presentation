# Resumen: Alucinaciones y Manejo de Contexto en Claude Code

**Fuentes**: Investigación de Anthropic, documentación oficial, best practices de la comunidad

---

## ¿Qué son las Alucinaciones?

Las "alucinaciones" en LLMs ocurren cuando el modelo:
- Inventa información que no existe
- Afirma cosas incorrectas con confianza
- Confunde detalles entre diferentes contextos
- Genera código que no compila o no funciona

---

## Causas Principales en Claude Code

### 1. Contexto Excesivo
- Demasiada información → confusión
- Mezcla de múltiples tareas → contaminación cruzada
- Historial largo → datos obsoletos o irrelevantes

### 2. Contexto Insuficiente
- Falta de información clave
- Archivos no leídos que son relevantes
- Suposiciones incorrectas del modelo

### 3. Instrucciones Ambiguas
- Prompts vagos
- Múltiples interpretaciones posibles
- Falta de restricciones claras

---

## Dato Clave de Anthropic

> "Cuando se permite a Claude admitir incertidumbre en lugar de forzar respuestas, las alucinaciones se reducen en un 76%"

### Implicación Práctica:
- Permitir que Claude diga "no estoy seguro"
- Pedir verificación cuando algo parece raro
- No presionar por respuestas cuando Claude duda

---

## Estrategias de Prevención

### 1. Sesiones Frescas

**Por qué funcionan**:
- Contexto limpio = menos confusión
- Sin "bagaje" de conversaciones anteriores
- Cada tarea empieza sin suposiciones

**Cuándo usar `/clear`**:
- Al empezar una nueva tarea
- Cuando la conversación se desvió
- Al cambiar de feature/módulo
- Cuando Claude parece confundido

### 2. Contexto Mínimo Necesario

**Principio**: Dar solo lo que Claude necesita, no más.

```
MAL:  "Aquí tienes todo el codebase, mejora algo"
BIEN: "Lee src/auth/login.ts y mejora el manejo de errores"
```

### 3. Verificación Activa

**Técnicas**:
- Pedir a Claude que cite fuentes: "¿En qué archivo viste eso?"
- Solicitar verificación: "¿Puedes confirmar que esa función existe?"
- Best-of-N: Pedir múltiples soluciones y comparar

### 4. Instrucciones Explícitas

```markdown
# En CLAUDE.md o prompts

Si no estás seguro de algo:
- Dilo explícitamente
- Sugiere verificar antes de asumir
- Pregunta en lugar de inventar
```

---

## Manejo de Contexto: Mejores Prácticas

### Ventana de Contexto

- **Límite**: ~200K tokens
- **Compactación automática**: Al ~70% de capacidad
- **Implicación**: Sessions muy largas pierden información temprana

### `/clear` vs `/compact`

| Situación | Usar |
|-----------|------|
| Nueva tarea no relacionada | `/clear` |
| Misma tarea, bajo de contexto | `/compact` |
| Conversación descarrilada | `/clear` |
| Breakpoint natural | `/compact` |
| Empezar el día | `/clear` |

### Técnica "Document & Clear"

```
1. Antes de limpiar:
   "Documenta el progreso actual en progress.md"

2. Ejecutar /clear

3. Nueva sesión:
   "Lee progress.md y continúa donde quedamos"
```

**Beneficios**:
- Memoria externa durable
- Contexto fresco
- Sin pérdida de información importante

---

## Señales de Alerta

### Claude Puede Estar Alucinando Cuando:

1. **Menciona archivos que no existen**
   - "En src/utils/helpers.ts..." (verificar que existe)

2. **Describe funciones incorrectamente**
   - Mezcla comportamientos de diferentes funciones

3. **Inventa APIs o bibliotecas**
   - Métodos que no existen en la lib

4. **Contradicciones con mensajes anteriores**
   - Cambia la explicación sin razón

5. **Confianza excesiva en detalles específicos**
   - Números, fechas, versiones muy específicas

### Qué Hacer:

1. **Verificar**: "¿Puedes mostrarme dónde está eso?"
2. **Limpiar contexto**: `/clear` si hay mucha confusión
3. **Ser más específico**: Dar más contexto relevante
4. **Dividir la tarea**: Tareas más pequeñas = menos confusión

---

## Configuración Anti-Alucinación

### En CLAUDE.md:

```markdown
## Reglas de Comportamiento

- Si no estás seguro, pregunta antes de asumir
- Siempre verifica que los archivos existen antes de referenciarlos
- Cita líneas específicas cuando hagas afirmaciones sobre código
- Si algo parece incorrecto, vuelve a leer el archivo
```

### En Prompts:

```
Antes de hacer cambios:
1. Lee los archivos relevantes
2. Confirma tu entendimiento
3. Muestra el plan
4. Espera mi aprobación
```

---

## Métricas de Contexto Saludable

| Indicador | Saludable | Problemático |
|-----------|-----------|--------------|
| Mensajes en sesión | < 20 | > 50 |
| Archivos en contexto | 5-15 | > 30 |
| Tokens usados | < 100K | > 150K |
| Tarea por sesión | 1-2 | > 5 no relacionadas |

---

## Takeaways para la Presentación

1. **Las alucinaciones se reducen 76%** cuando Claude puede admitir incertidumbre
2. **Sesiones frescas** son fundamentalmente mejores que sesiones largas
3. El **contexto excesivo es tan malo** como el insuficiente
4. La técnica **Document & Clear** es esencial para tareas largas
5. **Verificación activa** (pedir citas, confirmar existencia) previene errores
6. **CLAUDE.md con reglas anti-alucinación** ayuda consistentemente
