# Google Apps Script — flujo local y deploy estable

Este repositorio administra el backend de Google Apps Script con `clasp`, sin necesidad de entrar al editor web para cada cambio.

## Objetivo

El flujo normal debe ser:

```bash
# editar archivos dentro de apps-script/
npm run cms:deploy -- "Descripción del cambio"
```

Ese comando:

1. muestra qué archivos se van a publicar;
2. hace `clasp push --force`;
3. actualiza **el deployment de producción existente**;
4. conserva la misma URL `/exec`;
5. ejecuta un smoke test contra la campaña `galicia-2026`.

Deployment de producción configurado:

```text
AKfycbwAMgLxrStgHeTKyidxjAPLxCcmBlFGkLs7YJrMw6pK087Bakg4SaMGBgQWyTTc519V4Q
```

URL estable:

```text
https://script.google.com/macros/s/AKfycbwAMgLxrStgHeTKyidxjAPLxCcmBlFGkLs7YJrMw6pK087Bakg4SaMGBgQWyTTc519V4Q/exec
```

Por eso `VITE_GOOGLE_SCRIPT_URL` no tiene que cambiar cada vez que se publica una versión nueva.

---

## Primera configuración en una computadora

La primera vez solamente hay que vincular el repositorio al proyecto Apps Script existente.

### 1. Obtener el Script ID

El **Script ID no es el Deployment ID**.

Se puede copiar desde la configuración del proyecto de Apps Script, o simplemente copiar la URL del editor. El comando acepta ambas formas.

### 2. Vincular e importar el backend actual

Desde la raíz del repositorio:

```bash
npm run cms:setup -- "SCRIPT_ID_O_URL_DEL_EDITOR"
```

Si `clasp` todavía no está autorizado en esa computadora, el comando inicia el login de Google automáticamente.

Si todavía no existe código local en `apps-script/`, descarga el backend actual mediante `clasp pull`.

### 3. Versionar la primera importación

Después del primer `cms:setup`, revisar:

```bash
git status
git diff
```

Luego versionar `apps-script/` normalmente.

A partir de ahí, **la fuente de verdad pasa a ser Git + `apps-script/`**, no el editor de script.google.com.

---

## Flujo diario

Editar el backend dentro de:

```text
apps-script/
```

Publicar todo con un solo comando:

```bash
npm run cms:deploy -- "Corrige validación de campañas"
```

No hay que crear manualmente versiones ni abrir **Implementar > Administrar implementaciones**.

---

## Comandos útiles

```bash
npm run cms:whoami
```

Muestra qué cuenta de Google está autorizada.

```bash
npm run cms:status
```

Muestra los archivos que `clasp` considera para el próximo push.

```bash
npm run cms:deployments
```

Lista los deployments del proyecto.

```bash
npm run cms:versions
```

Lista versiones inmutables existentes.

```bash
npm run cms:smoke
```

Prueba la URL pública configurada sin volver a publicar.

```bash
npm run cms:open
```

Abre el proyecto en Apps Script solo para inspección o diagnóstico.

---

## Si alguien editó código directamente en script.google.com

No hacer `cms:deploy` inmediatamente porque el código local podría sobrescribir esos cambios.

Primero, con el working tree limpio:

```bash
npm run cms:pull
git diff
```

Revisar y versionar lo importado. Después volver al flujo local normal.

---

## Si algún día se reemplaza TODO el proyecto Apps Script

Eso sí requiere una nueva vinculación porque cambia el **Script ID** y posiblemente el **Deployment ID**.

1. actualizar `deploymentId` y `webAppUrl` en `cms.config.json` si cambió el deployment público;
2. borrar el `.clasp.json` local;
3. ejecutar nuevamente:

```bash
npm run cms:setup -- "NUEVO_SCRIPT_ID_O_URL"
```

4. verificar el backend importado antes de publicarlo.

Para cambios normales de código esto no se hace nunca.

---

## Archivos locales que no se versionan

`.clasp.json` y las credenciales locales de `clasp` están ignoradas por Git. Nunca se deben subir tokens o archivos de autenticación al repositorio.
