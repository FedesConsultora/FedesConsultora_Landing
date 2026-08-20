# Campañas con múltiples landings

## Objetivo

Una campaña comercial puede tener varias experiencias públicas sin duplicar la campaña ni el CRM.

La relación es:

```text
CRM_Campaigns (1)
  └── CRM_CampaignLandings (N)
        └── CRM_Leads / CRM_LeadEvents conservan campaign_key + landing_key
```

`CRM_Campaigns.status` es el interruptor maestro. Una landing solamente es pública si:

1. la campaña padre está `published` y dentro de sus fechas activas;
2. la landing está `published`;
3. la landing no está archivada.

Si la campaña se pone en `hidden`, la API deja de publicar la campaña, el Hero la elimina al revalidar y todas sus landings dejan de resolver públicamente. Los leads y el histórico se conservan.

## Galicia 2026

Campaña padre:

```text
galicia-2026
```

### Landing charla / sitio Fedes

```text
landing_key: charla-pymes
path: /bonificacion-galicia
beneficio: 50%
status inicial: published
```

Conserva el contexto específico de la charla.

### Landing Office Banking

```text
landing_key: office-banking
path: /bono-galicia
beneficio: 30%
status inicial: draft
```

El copy es general y no menciona la charla.

URL preparada para Galicia Office Banking:

```text
https://fedesconsultora.com/bono-galicia?source=galicia_office_banking&utm_source=galicia&utm_medium=office_banking&utm_campaign=beneficio_galicia_office_banking_2026&utm_content=banner
```

La landing queda inicialmente en `draft` para evitar publicarla antes de revisar el despliegue. Se publica desde la Vista 360° de `galicia-2026` en el Backoffice.

## Atribución

Los leads guardan:

- `campaign_key`
- `landing_key`
- `source`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `referrer`

La URL tiene prioridad sobre los valores por defecto de la landing. Si Galicia abre `/bono-galicia` sin parámetros, la landing Office Banking completa automáticamente sus defaults.

El `landing_key` representa la landing de adquisición original. Si una persona ya registrada vuelve por otra landing, no se duplica el lead; la atribución más reciente queda además registrada en metadata/eventos.

## Backoffice

En `Campañas > Galicia 2026 > Vista 360°` se puede:

- desactivar/publicar toda la campaña;
- ver todas las landings hijas;
- editar path, beneficio, copy, SEO y defaults UTM;
- copiar la URL de tracking lista para usar;
- publicar u ocultar cada landing individual;
- abrir una landing pública;
- ver `landing_key` en los leads recientes y en la Vista 360° del lead.

## Migración

El backend usa schema 4.

En el primer acceso a los endpoints de landings o al panel de landings:

- crea `CRM_CampaignLandings` si no existe;
- agrega `landing_key` a `CRM_Leads` y `CRM_LeadEvents` si falta;
- crea las dos landings Galicia si no existen;
- hace un backfill único de leads/eventos históricos sin `landing_key`.

Los registros preexistentes de Galicia se asignan a `charla-pymes`, salvo que su origen/path indique explícitamente Office Banking.

## Deploy

Orden recomendado para esta migración:

```bash
# 1. Traer la rama/merge ya validado
npm run build

# 2. Publicar primero el backend nuevo
npm run cms:deploy -- "Agrega múltiples landings por campaña"

# 3. Volver a construir con el backend ya actualizado
rm -rf dist
npm run build

# 4. Publicar dist en el hosting
```

Después del deploy de Apps Script, `npm run cms:smoke` valida health/schema y la landing principal cuando Galicia está pública.
