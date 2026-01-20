# Tools de Claude Code

> Las herramientas que usa para interactuar con tu sistema

---

## ~15 Tools principales

| Categoria | Tools | Que hace |
|-----------|-------|----------|
| **Archivos** | `Read`, `Write`, `Edit` | Leer, crear, modificar archivos |
| **Busqueda** | `Glob`, `Grep` | Encontrar archivos y contenido |
| **Ejecucion** | `Bash` | Ejecutar comandos de terminal |
| **Gestion** | `TodoWrite` | Trackear tareas en progreso |
| **Interaccion** | `AskUserQuestion` | Preguntar cuando tiene dudas |
| **Web** | `WebFetch`, `WebSearch` | Buscar documentacion online |

---

## El ciclo de un tool

```
1. Claude decide que necesita hacer algo
2. Selecciona el tool apropiado
3. TE PIDE PERMISO para usarlo
4. Si aprueban → ejecuta
5. Ve el resultado y continua
```

---

## Ejemplo concreto

**Vos decis**: "Agrega validacion al formulario de login"

**Claude**:
1. `Read` → Lee el archivo actual
2. `Edit` → Modifica el codigo
3. `Bash` → Corre los tests
4. `Edit` → Arregla si algo fallo

Todo esto pidiendo permiso en cada paso (a menos que configuren lo contrario).

---

## Proximo: Como controlar estos tools

`/slide 4` -> Comandos Esenciales
