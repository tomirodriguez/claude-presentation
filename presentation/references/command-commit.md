# Archivo: .claude/commands/commit.md

```markdown
---
description: Crear commit con conventional commits
allowed-tools: Bash, Read, Glob, Grep
---

Analiza los cambios y crea un commit siguiendo conventional commits.

## Pasos

1. Ejecutar `git status` para ver el estado
2. Ejecutar `git diff --staged` para ver cambios staged
3. Si no hay cambios staged, ejecutar `git diff` y preguntar si hacer `git add -A`
4. Analizar los cambios para determinar el tipo de commit
5. Crear mensaje siguiendo el formato

## Formato del mensaje

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

## Types válidos
- **feat**: Nueva funcionalidad
- **fix**: Corrección de bug
- **docs**: Cambios en documentación
- **refactor**: Refactorización sin cambio de funcionalidad
- **test**: Agregar o modificar tests
- **chore**: Cambios de mantenimiento

## Reglas
- Description en minúsculas, sin punto final
- Máximo 72 caracteres en la primera línea
- Scope opcional pero recomendado

## Ejemplos
- `feat(auth): add password reset functionality`
- `fix(api): handle null response from external service`
- `refactor(utils): simplify date formatting logic`

$ARGUMENTS
```
