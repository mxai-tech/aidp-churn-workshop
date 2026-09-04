---
title: Laboratorio 2 · Gold y modelo de churn
section: Laboratorios
lead: Convierte las tablas Silver en productos analíticos, snapshots históricos y un score accionable de riesgo de abandono.
icon: ⌁
vignette: Métricas, aprendizaje y acción
---

## Propósito y resultado esperado

Este laboratorio está orientado principalmente a **científicos de datos**. Usa
los datos refinados por el Laboratorio 1 para construir un Customer 360, medir
la salud de pagos, generar ejemplos históricos de entrenamiento y producir un
score de churn explicable.

Al terminar tendrás tres tablas Gold:

| Tabla | Resultado |
|---|---|
| `acquired_products_analytics_gold` | Customer 360 y métricas actuales de producto y pagos. |
| `customer_churn_features_gold` | Snapshots históricos y etiqueta de churn a 30 días. |
| `churn_predictions_gold` | Probabilidad, predicción, segmento de riesgo y versión del modelo. |

### Antes de empezar

1. Confirma que el [Laboratorio 1]({{ '/laboratorio/intesta-bronze-silver.html' | relative_url }})
   terminó sin errores.
2. Verifica que existan y tengan datos `customers_silver`,
   `acquired_products_silver` y `billing_payments_silver`.
3. Mantén el mismo notebook y cluster activos. Para las visualizaciones, el
   cluster debe tener `matplotlib` disponible mediante `requirements.txt`.
4. No cambies las reglas Silver durante este laboratorio: Gold consume esos
   datos como un contrato de entrada.

> **Captura sugerida 1:** consulta o explorador de tablas que muestre las tres
> tablas Silver y sus conteos antes de iniciar Gold.

## 1. Validar la base de datos analítica

Ejecuta una comprobación rápida en una celda SQL o PySpark antes de crear Gold:

```sql
SELECT updated_billing_status, COUNT(*) AS payments
FROM churn_analysis.silver.billing_payments_silver
GROUP BY updated_billing_status;
```

Debes encontrar pagos `INTIME` y, en el conjunto sintético de churn, pagos
`OVERDUE`. También confirma que `customers_silver` tenga cancelaciones y que la
última suscripción Silver de cada cliente represente su estado vigente o su
abandono final. Sin este comportamiento, el modelo no dispondrá de ejemplos
positivos de churn.

## 2. Crear las tablas Gold

Ejecuta la celda **Tablas Delta de la capa Oro**. La celda usa
`CREATE TABLE IF NOT EXISTS`, por lo que puede ejecutarse de nuevo sin borrar
datos por sí misma. Crea las tres tablas del resultado esperado y las agrupa
por `as_of_date` y `customer_id` para favorecer las consultas por fecha de
corte y cliente.

No entrenes todavía: en este momento las tablas son contratos vacíos. En los
siguientes pasos se llenarán en este orden: Customer 360, snapshots históricos
y scoring.

> **Captura sugerida 2:** las tres tablas Gold creadas en el catálogo, antes de
> que se carguen los resultados.

## 3. Construir Customer 360 y métricas de riesgo

Ejecuta la celda **Customer 360: métricas actuales de producto y pagos**. Es la
base de la analítica descriptiva y toma datos de cuatro tablas:

- `customers_silver` aporta perfil, estado y cancelación;
- `acquired_products_silver` aporta el historial de suscripciones;
- `products_bronze` aporta nombre, categoría y rango de tier;
- `billing_payments_silver` aporta comportamiento de pago corregido.

La celda identifica la última suscripción de cada cliente y calcula, entre
otras, estas características de los últimos 90 días:

- número y proporción de pagos `OVERDUE`;
- días desde el último atraso;
- facturación total y promedio;
- cantidad de suscripciones, upgrades y downgrades acumulados;
- producto actual, precio contratado y antigüedad en el producto.

El resultado se escribe en modo `overwrite` en
`churn_analysis.gold.acquired_products_analytics_gold`. Revisa las diez filas
de muestra y confirma que `as_of_date` corresponde a la fecha de ejecución.

> **Captura sugerida 3:** resultado de Customer 360 con las columnas
> `overdue_ratio_90d`, `upgrades_lifetime`, `downgrades_lifetime` y
> `current_contracted_price` visibles.

## 4. Explorar salud de clientes y comportamiento por tier

Ejecuta la celda **Indicadores generales y distribución de riesgo de pagos**.
Spark realiza primero las agregaciones y sólo se recopilan los valores
agregados que `matplotlib` necesita para mostrar:

1. total de clientes y clientes con pagos vencidos;
2. distribución por nivel de atraso;
3. atraso promedio y facturación acumulada de 90 días.

Después ejecuta la celda **Riesgo de pago y movimientos acumulados por tier**.
Compara el atraso promedio de cada familia/tier de producto contra el promedio
histórico de upgrades y downgrades. Interpreta los resultados como señales de
priorización, no como evidencia de causalidad.

> **Captura sugerida 4:** ambas gráficas de salud de pagos y riesgo por tier.
> Conviene capturarlas con los títulos, ejes y leyendas completos.

## 5. Crear snapshots históricos para entrenamiento

Ejecuta la celda **Construcción de snapshots de características y etiqueta
churn_30d**. Este es el paso central para evitar fuga de información futura.

Para cada combinación de cliente y fecha de vencimiento (`due_at`), el código
crea una fecha de corte `as_of_date`. Sólo usa pagos y suscripciones que ya
existían en dicha fecha y calcula características con una ventana de 90 días.
La etiqueta se asigna así:

- `label_churn_30d = 1` si el cliente cancela dentro de los 30 días posteriores
  a la fecha de corte;
- `label_churn_30d = 0` en otro caso;
- `is_label_mature = true` sólo si el conjunto tiene al menos 30 días de datos
  posteriores para observar el resultado.

La celda excluye del conjunto de características las razones de cancelación, la
fecha final de cancelación y el estado final del cliente. Esos campos sólo se
usan para construir la etiqueta; incluirlos como variables del modelo sería
fuga de información.

Al finalizar, examina el conteo que agrupa por `label_churn_30d` e
`is_label_mature`. Debe haber ejemplos maduros con churn y sin churn antes de
entrenar. Si sólo existen ceros, revisa las cancelaciones Silver y el histórico
de pagos, en lugar de alterar manualmente la etiqueta.

> **Captura sugerida 5:** tabla de conteos por `label_churn_30d` e
> `is_label_mature`; será la evidencia visual de que el conjunto permite ML.

## 6. Entrenar y evaluar el modelo de churn

Ejecuta la celda **Pipeline de ML: baseline de churn con separación temporal**.
El modelo es una regresión logística, elegida como línea base explicable. La
celda realiza los siguientes pasos:

1. Conserva sólo snapshots maduros y ordena las fechas de corte.
2. Separa entrenamiento y prueba por tiempo: las fechas más antiguas entrenan
   y las posteriores evalúan.
3. Imputa variables numéricas con la mediana.
4. Indexa y codifica variables categóricas como estado, categoría de producto y
   método de pago.
5. Compensa el desbalance de clases dando mayor peso a los ejemplos de churn.
6. Entrena el pipeline y calcula ROC AUC, PR AUC y precisión sobre el 10 % de
   clientes con mayor probabilidad.

La celda no lanza una excepción si aún no hay datos suficientes. En su lugar
informa por qué omite el entrenamiento: menos de dos fechas maduras, falta de
periodo de prueba o ausencia de churn/no churn en entrenamiento. Esta salida es
una señal de calidad de datos, no un error que deba ocultarse.

> **Captura sugerida 6:** métricas del entrenamiento temporal y muestra de
> predicciones, o el mensaje de validación si el histórico todavía no es
> suficiente.

## 7. Generar scoring y segmentos de riesgo

Si el entrenamiento terminó correctamente, ejecuta la celda **Scoring del
corte más reciente y publicación de resultados**. El proceso aplica el modelo
al `as_of_date` más reciente y publica:

- `churn_probability`, probabilidad estimada de abandono;
- `predicted_churn`, clasificación binaria del modelo;
- `risk_segment`: `HIGH` desde 0.70, `MEDIUM` desde 0.40 y `LOW` debajo de
  0.40;
- `model_name` y `model_version`, para dar trazabilidad a cada corrida.

Los resultados se agregan a `churn_predictions_gold` con la hora de scoring.
La celda muestra los 20 clientes de mayor probabilidad. Si el entrenamiento fue
omitido, el scoring se omite de forma segura y debes resolver primero la
validación del paso anterior.

Para revisar los primeros 50 resultados, usa una celda posterior:

```python
from pyspark.sql import functions as F

spark.table("churn_analysis.gold.churn_predictions_gold") \
    .orderBy(F.col("churn_probability").desc()) \
    .limit(50) \
    .show(truncate=False)
```

## 8. Comunicar el riesgo y el impacto económico

Por último, ejecuta la celda **Clientes de mayor riesgo e impacto financiero
mensual estimado**. La celda conserva el score más reciente de cada cliente,
lo une al precio contratado y calcula:

```text
ingreso mensual esperado en riesgo = churn_probability × precio contratado
```

La visualización entrega tres perspectivas: clientes por segmento de riesgo,
ingreso mensual esperado en riesgo por segmento y los 15 clientes con mayor
probabilidad de churn. Este importe sirve para ordenar acciones de retención;
no representa una proyección financiera definitiva ni sustituye una decisión
comercial.

> **Captura sugerida 7:** gráfica final de clientes de alto riesgo e ingreso
> mensual esperado en riesgo. Será una buena imagen de cierre para el taller.

## Cierre del laboratorio

Resume los hallazgos con estas preguntas:

1. ¿Qué proporción de pagos tardíos existe y en qué tier se concentra?
2. ¿Los downgrades o la antigüedad en un producto parecen asociados al riesgo?
3. ¿Cuántos clientes están en `HIGH` y cuál es su ingreso mensual esperado en
   riesgo?
4. ¿Qué acción de retención podría probarse primero y cómo se mediría su
   resultado?

El objetivo no es afirmar que el modelo conoce el futuro, sino demostrar una
cadena trazable: fuente transaccional → datos confiables → señales históricas →
priorización para decisiones de negocio.
