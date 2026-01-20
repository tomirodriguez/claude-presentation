# Ralph Wiggum

> El concepto que cambio todo

---

## La Idea Original

Geoffrey Huntley, frustrado con el "human-in-the-loop", escribio 5 lineas:

```bash
while :; do cat PROMPT.md | claude-code ; done
```

**El insight:** El agente ve sus propios errores y aprende de ellos.

---

## Por Que Funciona

```
Iteracion 1: Intenta, falla con error X
            |
            v
Iteracion 2: Ve error X, intenta otra cosa, falla con Y
            |
            v
Iteracion 3: Ve X e Y, finalmente lo resuelve
            |
            v
         EXITO
```

**Cada fallo es informacion** para la siguiente iteracion.

---

## El Mecanismo: Stop Hook

El truco es un **Stop hook** que:

1. Intercepta cuando Claude quiere terminar
2. Busca un "promise" de completitud: `<promise>DONE</promise>`
3. Si no lo encuentra -> **exit code 2** -> continua
4. Si lo encuentra -> permite salir

```
Claude: "Termine!"
Hook: "Veo <promise>DONE</promise>? No. Segui trabajando."
Claude: *sigue iterando*
```

---

## Los Principios

| Principio | Significado |
|-----------|-------------|
| **Iteracion > Perfeccion** | No esperes que salga bien la primera |
| **Fallos = Data** | Cada error informa el siguiente intento |
| **Contexto persiste** | Archivos, commits, errores sobreviven |
| **Criterio verificable** | El agente debe poder validar "termine" |

---

## El Caso Legendario

Geoffrey corrio Ralph **3 meses** con un prompt:

> "Make me a programming language like Golang but with Gen Z slang keywords."

**Resultado: Cursed** - Un lenguaje completo:
- Compilacion LLVM a binarios nativos
- Libreria estandar
- Keywords: `slay`, `sus`, `based`, `yeet`

---

## La Leccion

Ralph no es magia. Es la **combinacion inteligente** de:

- **Stop hook** que fuerza continuidad
- **Prompt claro** con criterio de exit
- **Persistencia** de cambios entre iteraciones
- **Verificacion automatica** (tests, typecheck)

**Podemos construir algo similar con lo que aprendimos.**

---

`/slide 14` -> Ejemplo Practico
