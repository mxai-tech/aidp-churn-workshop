---
title: Laboratorio 2 · Silver, Gold y modelo de churn
section: Laboratorios
lead: Convierte datos heredados en métricas confiables y un score accionable de riesgo de abandono.
icon: ⌁
vignette: Reglas de calidad y predicción
---

## Capa Silver: corregir sin ocultar la fuente

Ejecuta las transformaciones del notebook en este orden:

1. `billing_payments_silver`: define `updated_billing_status` como `OVERDUE`
   cuando `created_at > due_at`; de otro modo, `INTIME`.
2. `acquired_products_silver`: conserva el historial y determina el sentido de
   cambio de nivel. Las suscripciones previas quedan `CANCELLED`; una última
   suscripción cancelada puede representar churn final.
3. `customers_silver`: conserva la cancelación explícita de la fuente y la
   complementa con el estado de la última suscripción.

## Capa Gold: analítica y características

Construye Customer 360 y las métricas de pagos de los últimos 90 días. Después,
genera snapshots de características por fecha de vencimiento. Cada snapshot usa
una etiqueta `label_churn_30d` y sólo se marca maduro si existen 30 días
posteriores para observar el resultado.

Antes de entrenar, comprueba que existan ejemplos positivos y negativos:

```python
spark.table("churn_analysis.gold.customer_churn_features_gold").groupBy(
    "label_churn_30d", "is_label_mature"
).count().show()
```

## Entrenamiento y scoring

El notebook separa entrenamiento y prueba por fecha. Aplica imputación,
codificación de categorías y regresión logística con ponderación de clases.
Después genera `churn_probability`, `prediction` y segmentos de riesgo.

El resultado se usa para priorizar conversaciones de retención. Evalúa AUC ROC,
AUC PR y precisión sobre el 10% con mayor riesgo; no interpretes una predicción
como una cancelación asegurada.
