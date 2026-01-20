# Best Practices

> Lo que funciona en la practica

---

## El Workflow Ideal

```
EXPLORE  ->  PLAN  ->  CODE  ->  VALIDATE  ->  COMMIT
```

| Fase | Que hacer |
|------|-----------|
| **Explore** | "Encontra como funciona X" |
| **Plan** | "Planifica como agregar Y" (Plan Mode) |
| **Code** | "Implementa el plan" (Accept Edits) |
| **Validate** | Tests + typecheck |
| **Commit** | Solo si pasa validacion |

---

## Mentalidad Correcta

> **Trata a Claude como un junior dev muy trabajador**

- Puede hacer mucho trabajo rapido
- Pero necesita direccion clara
- Y supervision de su output

---

## Especificidad en Prompts

### Malo

```
"Arregla el login"
```

### Bueno

```
"El login falla cuando el email tiene mayusculas.
El error esta en src/auth/validate.ts.
Usa toLowerCase() antes de comparar."
```

---

### Malo

```
"Hace un componente de tabla"
```

### Bueno

```
"Crea un componente DataTable en src/components/.
- Props: data, columns, onSort
- Usar el patron de src/components/List.tsx
- Con paginacion de 10 items"
```

---

## Cosas a Evitar

| Evitar | Por que |
|--------|---------|
| Sesiones de mas de 1 hora sin `/clear` | Contexto degradado |
| Multiples features en la misma sesion | Confusion y errores |
| Confiar ciegamente en el codigo generado | Puede tener bugs |
| Ignorar cuando Claude dice "no estoy seguro" | Senal de alerta |
| No correr tests/typecheck despues de cambios | Bugs pasan desapercibidos |
| Dar contexto vago o incompleto | Output vago o incompleto |

---

## Tips Practicos

1. **Empeza cada tarea con `/clear`**

2. **Usa Plan Mode para tareas complejas**

3. **Pedi que lea archivos especificos antes de editar**
   ```
   "Primero lee src/auth/login.ts, despues modificalo"
   ```

4. **Valida siempre:** tests + types + lint

5. **Cuando algo falla, no insistas** - empeza de nuevo

---

`/slide 13` -> Ralph Demo
