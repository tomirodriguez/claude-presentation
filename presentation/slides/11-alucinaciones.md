# Alucinaciones y Manejo de Contexto

> **La parte mas importante del dia**

---

## El Problema Real

Claude puede:

- Inventar APIs que no existen
- Referenciar archivos inexistentes
- Crear imports de paquetes fantasma
- Olvidar decisiones tomadas hace 10 minutos
- Mezclar contextos de diferentes tareas

**Por que?** El contexto se degrada con el tiempo.

---

## La Estadistica Clave

> **76% menos alucinaciones** cuando Claude expresa incertidumbre

Si Claude dice "creo que" o "posiblemente", presta mas atencion y verifica.

---

## Regla de Oro: Sesiones Cortas

> **/clear cada 30-45 minutos** o al cambiar de tarea

| Sesiones largas | = mas contexto | = mas confusion | = mas alucinaciones |
|-----------------|----------------|-----------------|---------------------|

**Es MEJOR empezar de cero que arrastrar contexto corrupto.**

---

## Senales de Alerta

Parar y hacer `/clear` cuando:

| Senal | Ejemplo |
|-------|---------|
| Claude repite el mismo error despues de corregirlo | "Ya te dije que ese archivo no existe" |
| Mezcla conceptos de tareas anteriores | "Por que estas usando la funcion del feature anterior?" |
| Genera codigo que contradice decisiones recientes | "Acabamos de decidir usar Zod, por que usas Yup?" |

---

## Tecnica: Document & Clear

Antes de `/clear` en una tarea larga:

1. Pedi a Claude que resuma el estado actual
2. Guarda ese resumen en un archivo o nota
3. Hace `/clear`
4. Empeza la nueva sesion pegando el resumen

```
"Resumi lo que hicimos hasta ahora en formato bullet points"
```

---

## Verificacion Activa

Cuando Claude genera codigo:

- Verificar que los imports existen
- Verificar que las APIs son correctas
- Correr los tests
- Hacer typecheck

> **"Confia pero verifica"**

---

`/slide 12` -> Best Practices
