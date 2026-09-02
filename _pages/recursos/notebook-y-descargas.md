---
title: Notebook, descargas y publicación segura
section: Recursos
lead: Accede a los archivos del taller y aplica prácticas básicas para proteger la configuración del entorno.
icon: □
vignette: Materiales públicos y seguros
---

## Notebook del workshop

El notebook completo se entrega a los participantes por el canal definido por
el instructor. La copia destinada a GitHub Pages debe ser una versión pública y
sanitizada: sin contraseñas, tokens, hosts privados, identificadores de tenancy
ni resultados que expongan información sensible.

El [notebook de plantilla]({{ '/notebooks/aidp_churn_workshop_template.ipynb' | relative_url }})
muestra la forma segura de tomar valores de configuración desde variables de
entorno. Cópialo antes de importar el notebook completo y adapta las celdas de
conexión a los controles de tu organización.

También puedes descargar el [requirements.txt]({{ '/downloads/requirements.txt' | relative_url }})
para instalar las dependencias Python del cluster.

## Repositorio técnico

Los scripts de datos sintéticos, esquema MySQL y notebook de desarrollo se
mantienen en el repositorio técnico del workshop. Este sitio es la guía pública
del participante y no debe incluir secretos ni infraestructura operativa.

## Solución de problemas frecuente

| Síntoma | Acción |
|---|---|
| `ClassNotFoundException: com.mysql.cj.jdbc.Driver` | Instala MySQL Connector/J como JAR del cluster y reinícialo. |
| Error de red o `Access denied` | Confirma host, puerto, red y privilegios con el instructor; no expongas la contraseña en una celda. |
| No hay ejemplos de churn para ML | Revisa `customers_silver`, la última suscripción Silver y los conteos de snapshots maduros. |
| `DATETIME` no es válido al crear Delta | Usa `TIMESTAMP` para fechas/hora en Spark SQL. |
