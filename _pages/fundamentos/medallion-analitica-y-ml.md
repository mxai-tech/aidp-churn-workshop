---
title: Medallion, analítica y machine learning
thumbnail: /assets/img/thumbnail/book.jpg
tags: [Medallion, analítica, ML, churn]
---

## Arquitectura Medallion

La arquitectura Medallion organiza los datos por propósito y calidad:

| Capa | Propósito en el workshop |
|---|---|
| Bronze | Copia trazable de MySQL, con la estructura y limitaciones del sistema legado. |
| Silver | Datos corregidos: pagos `INTIME`/`OVERDUE`, historial de productos y cancelaciones consistentes. |
| Gold | Customer 360, métricas de riesgo, snapshots históricos, características y scoring. |

Esta separación permite volver a la fuente cuando aparece una discrepancia,
probar reglas de calidad sin alterar Bronze y entregar conjuntos claros a
analítica y ciencia de datos.

## Analítica para ingeniería de datos

El ingeniero de datos habilita decisiones al producir datos confiables: pagos
tardíos en los últimos 90 días, antigüedad, producto actual, movimientos entre
niveles y segmentos de riesgo.

## Machine learning para ciencia de datos

El científico de datos usa snapshots de fechas pasadas. Para cada fecha de
corte, el label responde: **¿el cliente cancelará durante los siguientes 30
días?** Sólo se entrenan snapshots maduros, con al menos 30 días posteriores
observables. El modelo base es una regresión logística con separación temporal,
para evitar usar información futura durante la evaluación.

## Impacto de negocio

Un score ayuda a priorizar campañas de retención, revisar causas de pagos
tardíos y estimar el ingreso mensual en riesgo. La calidad y trazabilidad de
las capas de datos determinan qué tan confiables serán esas decisiones.
