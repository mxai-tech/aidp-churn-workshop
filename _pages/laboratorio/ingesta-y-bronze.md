---
title: Laboratorio 1 · Ingesta, Bronze y Silver
section: Laboratorios
lead: Conecta Spark a MySQL, conserva la evidencia de origen y transforma los datos heredados en tablas Silver confiables.
icon: ⌁
vignette: Fuente a Silver, con trazabilidad
---

## Propósito y resultado esperado

Este laboratorio está orientado principalmente a **ingenieros de datos**. Al
terminarlo tendrás una extracción auditada de MySQL, las cuatro tablas crudas en
Bronze y sus versiones validadas en Silver. La siguiente parte del workshop
parte exclusivamente de estas tablas.

El notebook usa Spark con JDBC para realizar la lectura distribuida de MySQL.
La importación de `mysql.connector` que aparece al inicio queda disponible para
comprobaciones auxiliares, pero la ingesta principal se ejecuta con
`spark.read.format("jdbc")` y requiere el JAR de MySQL Connector/J en el
cluster.

### Antes de empezar

1. Abre el workspace y adjunta el notebook al compute cluster activo.
2. Confirma que MySQL Connector/J y el archivo `requirements.txt` se instalaron
   como librerías del cluster.
3. Obtén las credenciales de MySQL y los datos de Object Storage por el canal
   indicado por el instructor. No los copies a GitHub, al notebook público ni a
   una celda Markdown.
4. Revisa que exista acceso de red del cluster tanto a MySQL como al bucket de
   Object Storage.

> **Captura sugerida 1:** workspace abierto, notebook adjunto y compute cluster
> en estado **Active**. Aquí se podrá insertar una imagen del Workbench.

## 1. Inicializar el notebook y la configuración

Ejecuta las primeras celdas de código del notebook, en este orden:

1. La celda de importaciones carga `mysql.connector`, `datetime`, `pytz` y
   `json`. No modifica datos.
2. La celda de visualización HTML es opcional; permite que `DataFrame.show()`
   se presente de manera más legible dentro del notebook.
3. Ejecuta la celda **Declaración de Variables**. Define las cuatro tablas de
   origen (`customers`, `products`, `subscriptions` y `billing_payments`), el
   formato de salida, el tamaño de lote, el destino en Object Storage y el
   identificador único de extracción.

El código obtiene sus valores primero de los parámetros del job, después de las
variables de entorno y finalmente de los valores por defecto. Para este taller,
usa `parquet` salvo que el instructor indique `csv`. Verifica en la salida:

- que `destination` apunte al bucket y prefijo asignados;
- que `extraction_id` sea nuevo para esta ejecución;
- que el formato y `chunk_size` sean los esperados.

> **Captura sugerida 2:** salida de la celda de configuración, ocultando host,
> usuario, contraseña y cualquier identificador privado.

## 2. Extraer las cuatro tablas de MySQL

Ejecuta la celda **Métodos para crear la conexión a MySQL y creación del
registro de extracción**. Esta celda define, pero todavía no invoca, dos
funciones:

- `ingest_table()` construye la URL JDBC, lee una tabla con Spark, cuenta sus
  filas y la escribe en Object Storage bajo `tabla/extraction_id=...`.
- `write_batch()` escribe Parquet con compresión Snappy o CSV con encabezado,
  según la configuración.

Después ejecuta la siguiente celda que crea `results`. Es el paso que lanza una
lectura para cada tabla y publica un **manifest** JSON con el identificador de
extracción, formato, fecha UTC, rutas y conteos.

Comprueba que aparezcan cuatro mensajes de filas y rutas, uno por tabla. Si la
celda falla en `com.mysql.cj.jdbc.Driver`, vuelve a la preparación del cluster:
falta el JAR JDBC o el cluster necesita reiniciarse.

> **Captura sugerida 3:** salida de la extracción con los cuatro conteos y la
> ruta del manifest; difumina host, bucket o namespace si no son públicos.

## 3. Validar el extracto antes de cargarlo

Ejecuta las celdas de validación que leen el primer archivo de `results`:

1. La primera reconstruye un DataFrame desde la ruta Parquet y ejecuta
   `printSchema()`.
2. La siguiente muestra cinco registros sin truncarlos.
3. La celda SQL consulta la vista temporal `validation_sample` con `LIMIT 5`.

Este control confirma que Spark puede volver a leer lo que escribió. Revisa los
tipos de fecha, montos, llaves y la presencia de datos. No hagas correcciones
en este punto: la finalidad de Bronze es preservar la evidencia original.

## 4. Crear el catálogo y la capa Bronze

Ejecuta la celda **Creación del catálogo ChurnAnalysis y de los esquemas de
medallón**. Crea, si no existen, el catálogo `churn_analysis` y los esquemas
`bronze`, `silver` y `gold`.

Luego ejecuta la celda **Create Bronze Layer Delta tables**. Crea estas tablas
Delta, todas con `IF NOT EXISTS`:

| Fuente MySQL | Tabla Bronze | Propósito |
|---|---|---|
| `customers` | `churn_analysis.bronze.customers_bronze` | Perfil y cancelación informada por el sistema legado. |
| `products` | `churn_analysis.bronze.products_bronze` | Catálogo de productos y rango de tier. |
| `subscriptions` | `churn_analysis.bronze.acquired_products_bronze` | Historial operativo de suscripciones. |
| `billing_payments` | `churn_analysis.bronze.billing_payments_bronze` | Cobros, vencimientos y pagos del origen. |

Observa que la fuente `subscriptions` se conserva con el nombre histórico
`acquired_products_bronze`. Las columnas de fecha/hora se crean como
`TIMESTAMP`, que es el tipo compatible con Spark SQL y Delta.

> **Captura sugerida 4:** catálogo expandido en AIDP con los esquemas Bronze,
> Silver y Gold, y las cuatro tablas Bronze visibles.

## 5. Cargar los extractos en Bronze

Ejecuta la celda **Cargar los archivos de la extracción y anexarlos a las
tablas Delta de la capa Bronze**. El código realiza las siguientes validaciones
por cada tabla:

1. Recupera la ruta correspondiente desde `results`.
2. Lee Parquet o CSV, de acuerdo con `EXPORT_FORMAT`.
3. Compara las columnas de origen contra el esquema de la tabla Delta.
4. Convierte cada columna al tipo definido en Bronze y conserva el orden del
   esquema.
5. Inserta las filas en modo `append` y muestra el conteo cargado.

Los cuatro conteos deben corresponder con los de la extracción. Si aparece el
error de columnas faltantes, no elimines campos en Bronze: verifica que se
usaron las tablas de origen y el notebook de la misma versión.

Para una comprobación adicional, ejecuta una celda SQL como esta:

```sql
SELECT 'customers' AS source, COUNT(*) AS rows
FROM churn_analysis.bronze.customers_bronze
UNION ALL
SELECT 'subscriptions', COUNT(*)
FROM churn_analysis.bronze.acquired_products_bronze;
```

## 6. Crear las tablas Silver

Ejecuta la celda **Create Silver Layer Delta tables**. Esta operación crea:

- `billing_payments_silver`, con el campo derivado
  `updated_billing_status`;
- `acquired_products_silver`, con `corrected_subscription_type`;
- `customers_silver`, con la cancelación consistente por cliente.

Todavía no contienen la lógica de calidad; sólo definen el contrato de datos
que se llenará en los siguientes tres pasos.

> **Captura sugerida 5:** esquema de `billing_payments_silver` que muestre
> `updated_billing_status`, como evidencia del contrato Silver.

## 7. Refinar pagos en Silver

Ejecuta la celda **Transformación Silver de billing_payments**. Lee los pagos
Bronze y hace un `left join` con las suscripciones para incorporar `customer_id`
y `product_id`, campos que no existen en el pago de origen.

La regla de calidad es deliberadamente simple y trazable:

- `created_at > due_at` se convierte en `OVERDUE`.
- `created_at <= due_at` se convierte en `INTIME`.

El sistema legado mantiene `billing_status = PAID`; la nueva columna
`updated_billing_status` es la interpretación analítica. El resultado
reemplaza la tabla `billing_payments_silver` completa. Revisa las cinco filas
que muestra la celda y verifica que existan ambos valores cuando la fuente
tenga pagos tardíos.

## 8. Reconstruir el historial de productos

Ejecuta la celda **Transformación Silver de acquired_products**. El proceso:

1. Une suscripciones Bronze con `products_bronze` para recuperar
   `service_level_rank`.
2. Elimina repeticiones del mismo producto para un cliente, conservando la más
   antigua; mantiene la última fuente porque puede ser la cancelación terminal.
3. Ordena el historial por `created_at` y `subscription_id`.
4. Marca las suscripciones anteriores como `CANCELLED`.
5. Conserva `CANCELLED` en la última suscripción si el origen indica abandono;
   de otro modo, la última queda `ACTIVE`.
6. Calcula `corrected_subscription_type`: `UPGRADE` si el tier aumenta,
   `DOWNGRADE` si disminuye y `NEW` para el primer producto o tiers iguales.

La celda escribe el resultado en modo `overwrite`. Confirma que un cliente con
cambio de producto tenga una sola suscripción vigente, salvo los clientes cuyo
último evento sea una cancelación final.

## 9. Consolidar la cancelación del cliente

Ejecuta la celda **Transformación Silver de customers**. Para cada cliente toma
la última suscripción Silver, ordenada por `created_at` y `subscription_id`.
La cancelación explícita de Bronze es la fuente prioritaria; si falta, una
última suscripción `CANCELLED` la complementa.

Cuando el cliente se considera cancelado, la celda conserva o deriva:

- `customer_status = CLOSED`;
- `cancelled_at`, usando la fecha existente o `updated_at` de la suscripción;
- `cancellation_type`, con el valor existente o `VOLUNTARY`.

Para un cliente activo, estos campos quedan nulos. El resultado se escribe en
`customers_silver` con `overwrite`.

## Validación de cierre

Antes de continuar al Laboratorio 2, ejecuta conteos y revisa el resultado:

```sql
SELECT customer_status, COUNT(*) AS customers
FROM churn_analysis.silver.customers_silver
GROUP BY customer_status;

SELECT updated_billing_status, COUNT(*) AS payments
FROM churn_analysis.silver.billing_payments_silver
GROUP BY updated_billing_status;
```

Debes poder explicar de dónde proviene cada campo corregido y volver a Bronze
para comprobarlo. Con esto termina la parte de ingeniería de datos; continúa
con el [Laboratorio 2]({{ '/laboratorio/silver-gold-y-ml.html' | relative_url }}).
