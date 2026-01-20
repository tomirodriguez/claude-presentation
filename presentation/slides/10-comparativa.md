# Comparativa: Cuando Usar Que

> Eligiendo la herramienta correcta para cada situacion

---

## Cuadro Comparativo Completo

| Feature | Que es | Quien lo activa | Contexto | Mejor para |
|---------|--------|-----------------|----------|------------|
| **CLAUDE.md** | Archivo de configuracion | Automatico (siempre) | Siempre cargado | Convenciones del proyecto, reglas cortas |
| **Slash Commands** | Archivos `.md` con prompts | Manual (`/comando`) | Conversacion actual | Tareas repetitivas explicitas |
| **Skills** | Carpetas con instrucciones | Automatico (por contexto) | Se carga cuando es relevante | Workflows complejos, expertise |
| **Sub-agents** | Agentes especializados | Automatico (por tarea) | **Contexto separado** | Tareas aisladas, investigacion |
| **Hooks** | Scripts shell | Automatico (por eventos) | Determinista, siempre corre | Enforcement, automatizacion, seguridad |
| **MCP Servers** | Conexiones externas | Claude decide cuando | Herramientas disponibles | Integraciones (DBs, APIs, GitHub) |

---

## El Principio Clave

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│   CLAUDE.md     →  Contexto (lo que Claude SABE)         │
│   Skills        →  Expertise (lo que Claude SABE HACER)  │
│   Commands      →  Acciones (lo que VOS activas)         │
│   Hooks         →  Enforcement (lo que SIEMPRE pasa)     │
│   MCP           →  Acceso (a lo que Claude PUEDE usar)   │
│   Sub-agents    →  Delegacion (trabajo AISLADO)          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Arbol de Decision

```
¿Necesitas que SIEMPRE pase algo automaticamente?
├── SI → Hook
└── NO ↓

¿Es informacion que Claude necesita SIEMPRE saber?
├── SI → CLAUDE.md
└── NO ↓

¿Claude deberia aplicarlo automaticamente segun contexto?
├── SI → Skill
└── NO ↓

¿Es una tarea que VOS queres activar explicitamente?
├── SI → Slash Command
└── NO ↓

¿Necesitas conectar con un sistema externo?
├── SI → MCP Server
└── NO ↓

¿La tarea necesita contexto aislado o es pesada?
├── SI → Sub-agent
└── NO → Pediselo directo a Claude
```

---

## Ejemplos Practicos

| Necesidad | Solucion | Por que |
|-----------|----------|---------|
| "Siempre usar ESLint antes de commit" | CLAUDE.md | Regla simple, siempre aplica |
| "Formatear codigo despues de cada edit" | Hook (PostToolUse) | Debe pasar SIEMPRE, sin excepciones |
| "Aplicar mejores practicas de React" | Skill | Expertise que se activa cuando es relevante |
| "Quiero hacer code review ahora" | Slash Command | Accion explicita que vos triggeras |
| "Buscar donde esta implementado X" | Sub-agent (Explore) | No contaminar contexto principal |
| "Consultar base de datos" | MCP Server | Acceso a sistema externo |

---

## Combinandolos

Los features no son mutuamente excluyentes:

```
┌─────────────────────────────────────────────────┐
│                  Tu Proyecto                     │
├─────────────────────────────────────────────────┤
│                                                  │
│  CLAUDE.md          → "Usamos TypeScript strict" │
│       ↓                                          │
│  Skill              → "Cuando escribas tests,    │
│                        sigue estas practicas..." │
│       ↓                                          │
│  Hook (PostToolUse) → Corre biome despues        │
│                        de cada edit              │
│       ↓                                          │
│  /commit            → Comando para commitear     │
│                        con conventional commits  │
│       ↓                                          │
│  Sub-agent          → Revisa codigo en contexto  │
│                        aislado                   │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## Resumen Rapido

| Si queres... | Usa... |
|--------------|--------|
| Dar contexto permanente | CLAUDE.md |
| Ejecutar tarea a pedido | Slash Command |
| Aplicar expertise automaticamente | Skill |
| Garantizar que algo pase siempre | Hook |
| Conectar con APIs/DBs externas | MCP Server |
| Delegar trabajo sin contaminar contexto | Sub-agent |

---

## Anti-patrones Comunes

| Error | Problema | Solucion correcta |
|-------|----------|-------------------|
| Poner workflows largos en CLAUDE.md | Consume contexto innecesariamente | Usar Skill |
| Usar Hook para tareas que pueden fallar | Bloquea el flujo | Usar CLAUDE.md como sugerencia |
| Crear sub-agents para todo | Pierde contexto compartido | Usar Skills para expertise |
| No usar Hooks para formateo | Claude puede olvidar | Hook PostToolUse garantiza |
| Poner secretos en CLAUDE.md | Se commitea a git | Usar MCP con credenciales locales |

---

`/slide 11` -> Contexto y Alucinaciones
