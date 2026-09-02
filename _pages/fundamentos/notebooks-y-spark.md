---
title: Notebooks, Spark y cómputo distribuido
thumbnail: /assets/img/thumbnail/sample.png
tags: [notebooks, Spark, PySpark]
---

## Notebooks como artefacto de trabajo

Un notebook combina explicación, código, resultados y visualizaciones. En un
workshop permite mostrar el razonamiento detrás de una transformación, no sólo
el resultado. En producción, las celdas deben poder ejecutarse en orden y las
variables de configuración no deben contener secretos en texto plano.

## Por qué Spark

Spark procesa DataFrames mediante un plan de ejecución optimizado. Su ventaja
central es que puede repartir lectura, transformación y agregaciones entre los
ejecutores de un clúster, evitando concentrar todo el volumen en la memoria de
un solo notebook.

### Driver y ejecutores

- El **driver** interpreta el código, crea el plan y coordina la ejecución.
- Los **ejecutores** procesan particiones de datos en paralelo.
- El almacenamiento y las tablas persisten los resultados entre ejecuciones.

Para fuentes pequeñas se puede usar un conector Python. Para una fuente MySQL
grande, JDBC permite repartir la lectura entre ejecutores mediante rangos o
particiones. En este taller usamos JDBC porque ilustra el patrón que escala.

## Idea clave

Un clúster no hace mejor un algoritmo por sí solo: permite procesar más datos
con tiempos razonables. El código debe evitar traer grandes DataFrames al driver
con `collect()` y debe filtrar o agregar antes de visualizar.
