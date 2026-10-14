# Estimación de créditos de ArcGIS Online

Fecha: {{fecha}}  
Elaborado por: [@raisavll](https://github.com/raisavll)

## Resumen

Se estima un consumo total de **{{total}} créditos** para los {{servicios}} servicio(s) seleccionado(s), de acuerdo con la tabla oficial de créditos por servicio de ArcGIS Online.

| Servicio | Grupo | Créditos |
|:---|:---|---:|
{{filas}}
| **Total** | | **{{total}}** |

## Detalle por servicio

{{detalle}}

## Supuestos

- Las tarifas corresponden a la [tabla oficial de créditos por servicio](https://doc.arcgis.com/es/arcgis-online/administer/credits.htm). El consumo real puede variar; verifique las tarifas vigentes antes de presupuestar.
- Los tamaños se convierten con 1 GB = 1.024 MB y 1 MB = 1.024 KB.
- Las imágenes dinámicas usan 30 días por mes para la tarifa diaria.
- ModelBuilder y los notebooks interactivos cobran un mínimo de 10 minutos por sesión.
