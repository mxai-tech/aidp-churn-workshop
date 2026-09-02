---
title: OCI y AI Data Platform
thumbnail: /assets/img/thumbnail/bricks.webp
tags: [OCI, AIDP, plataforma]
---

## Qué es OCI

Oracle Cloud Infrastructure (OCI) es la plataforma de nube de Oracle. Ofrece
servicios de cómputo, red, almacenamiento, identidad, bases de datos y datos.
En este workshop, OCI es el entorno donde cada participante crea un espacio de
trabajo y procesa información sin administrar servidores individuales.

## Qué es AIDP

OCI AI Data Platform (AIDP) es un entorno administrado para trabajo de datos e
IA. Reúne workspace, notebooks, compute clusters, almacenamiento de objetos y
capacidades de ejecución para que los equipos puedan pasar de exploración a
pipelines analíticos reproducibles.

### Capacidades que usaremos

- Notebooks colaborativos para documentar y ejecutar el laboratorio.
- Compute clusters para ejecutar PySpark de forma distribuida.
- Librerías de clúster para agregar conectores y dependencias Python.
- Tablas Delta para las capas Bronze, Silver y Gold.
- Object Storage como destino de datos y artefactos analíticos.

La ventaja práctica es separar la capacidad de cómputo, el almacenamiento y el
código. Así el equipo puede escalar el procesamiento cuando el volumen crece y
mantener trazabilidad de las transformaciones.

## Resultado esperado

Al terminar esta parte, los participantes deben poder explicar qué recurso de
AIDP resuelve cada necesidad: desarrollo (notebook), ejecución (cluster),
persistencia (tablas/almacenamiento) y gobierno operativo (workspace y
permisos).
