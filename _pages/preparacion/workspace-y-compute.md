---
title: Crear workspace, cluster y librerías
section: Preparación
lead: Configura el entorno de AIDP y las dependencias que permitirán ejecutar la práctica con Spark.
icon: ◌
vignette: Workspace, compute y conectores
---

## 1. Crear el workspace en AIDP Workbench

1. Accede a OCI con el usuario y compartimiento proporcionados para el taller.
2. Abre **AI Data Platform** y entra a **Workbench**.
3. Crea un workspace en el compartimiento asignado.
4. Usa un nombre identificable, por ejemplo `churn-<iniciales>`.
5. Espera a que el workspace esté disponible y ábrelo.

El workspace delimita tus notebooks, archivos y recursos de trabajo. Trabaja
siempre dentro del compartimiento indicado por el instructor.

## 2. Crear un compute cluster

1. En el workspace, abre **Compute** y selecciona **Create cluster**.
2. Elige la configuración de Spark y tamaño indicados por el instructor.
3. Asigna un nombre como `churn-compute-<iniciales>`.
4. Crea el clúster y espera al estado **Active** antes de adjuntar el notebook.

El driver coordina el notebook y los ejecutores realizan las tareas Spark. Para
este laboratorio utiliza un clúster compartido o el tamaño mínimo acordado para
evitar consumo innecesario.

## 3. Instalar librerías del clúster

Con el clúster activo, abre la pestaña **Library** y usa **Install Library**.
Las bibliotecas se instalan a nivel de clúster, por lo que estarán disponibles
para los notebooks y jobs que lo usen. Reinicia el clúster después de instalar.

### MySQL Connector/J

Sube el JAR de MySQL Connector/J 8.x y agrégalo como librería. El notebook usa:

```python
.option("driver", "com.mysql.cj.jdbc.Driver")
```

El paquete Python `mysql-connector-python` no sustituye este JAR cuando Spark
lee mediante JDBC.

### requirements.txt

Descarga y carga [requirements.txt]({{ '/downloads/requirements.txt' | relative_url }})
como librería. Contiene dependencias utilizadas para zona horaria y gráficos.
Después de instalar el JAR y el archivo, reinicia el clúster y comprueba que
vuelva a **Active**.

## Lista de verificación

- Workspace disponible.
- Cluster activo y notebook adjunto.
- JAR JDBC visible en **Library**.
- `requirements.txt` instalado y cluster reiniciado.
- Credenciales recibidas por un canal seguro; nunca escritas en Markdown ni
  enviadas a un repositorio.
