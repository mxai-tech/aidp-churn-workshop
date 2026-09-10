---
title: Crear base de datos y componentes de red
section: Preparación
lead: La fuente del taller representa una operación de servicios y fue creada para practicar problemas reales de calidad y churn.
icon: ◌
vignette: Fuente transaccional de práctica
---

## Paso 1: Creación de una base de datos

<aside>
💡

**Oracle AI Database > Autonomous AI Databases**

</aside>

Es importante seleccionar nuestro compartment, una vez seleccionado procedemos a la creación.

![image.png]({{ '/assets/img/image 4.png' | relative_url }})

Para la creación de la base de datos es importante seleccionar las siguientes características

```sql
Workload type: Transaction Processing
Database version: 26ai ⚠️ Importante. Muchas características de IA están soportadas desde la versión 23ai
ECPU Count: 4 Recomendamos un número mayor a 2
Storage: Desde 256GB será suficiente para el demo
Access type: Secure Access from Everywhere
```

Los demás campos pueden quedar por defecto, una vez seleccionada la contraseña, la página de la base de datos entrará en estado Provisioning, el cuál tardará al rededor de 5 minutos.

![Screenshot 2026-01-19 at 12.11.56 PM.png]({{ '/assets/img/Screenshot_2026-01-19_at_12.11.56_PM.png' | relative_url }})

### Paso 1.1: Descarga de la Wallet

En la página de la base de datos, junto al botón Database actions, encontramos el botón de conexiones. 

![image.png]({{ '/assets/img/image 6.png' | relative_url }})

Aquí podremos descargar la Wallet

![image.png]({{ '/assets/img/image 7.png' | relative_url }})

Este paso pedirá una contraseña, puede ser la misma contraseña que proporcionamos al crear la base de datos. Si todo se ejecutó correctamente, un archivo .zip será descargado.

### Paso 1.2: Creación y configuración del usuario

Cuando la base de datos esté en estado available podemos acceder a esta y ejecutar comandos SQL

![image.png]({{ '/assets/img/image 5.png' | relative_url }})

Dentro del SQL, ejecutaremos el siguiente script, el cuál creará el usuario y asignará los permisos necesasrios

```sql
CREATE USER <DB_USER> IDENTIFIED BY <DB_PASSWORD> DEFAULT TABLESPACE USERS QUOTA unlimited ON USERS;
GRANT CONNECT, RESOURCE, CREATE TABLE, CREATE SYNONYM, CREATE DATABASE LINK, CREATE ANY INDEX, INSERT ANY TABLE, CREATE SEQUENCE, CREATE TRIGGER, CREATE USER, DROP USER TO <DB_USER>;
GRANT CREATE SESSION TO <DB_USER> WITH ADMIN OPTION;
GRANT READ, WRITE ON DIRECTORY DATA_PUMP_DIR TO <DB_USER>;
GRANT SELECT ON SYS.V_$PARAMETER TO <DB_USER>;
```

Si quieres usar directamente el usuario y contraseña sugeridos para el workshop, puedes ejecutar este comando:

```sql
CREATE USER LOANAPP IDENTIFIED BY L1o2a3n4a5p6p7$ DEFAULT TABLESPACE USERS QUOTA unlimited ON USERS;
GRANT CONNECT, RESOURCE, CREATE TABLE, CREATE SYNONYM, CREATE DATABASE LINK, CREATE ANY INDEX, INSERT ANY TABLE, CREATE SEQUENCE, CREATE TRIGGER, CREATE USER, DROP USER TO LOANAPP;
GRANT CREATE SESSION TO LOANAPP WITH ADMIN OPTION;
GRANT READ, WRITE ON DIRECTORY DATA_PUMP_DIR TO LOANAPP;
GRANT SELECT ON SYS.V_$PARAMETER TO LOANAPP;
```


## Paso 2: Creación de una red

En la consola de Oracle, podemos configurar una red virtual privada dentro de nuestro compartment.

<aside>
💡

Networking > Virtual Cloud Networks

</aside>

Es importante seleccionar nuestro compartment, una vez seleccionado procedemos a la creación.

![image.png]({{ '/assets/img/image 8.png' | relative_url }})

Vamos a crear una red con acceso a internet

![image.png]({{ '/assets/img/image 9.png' | relative_url }})

En la creación solamente debemos seleccionar un nombre

```sql
Name: vcn-agent
```

El resto de los valores pueden dejarse por defecto, al presionar Next y luego Create, podemos esperar unos segundos por la creación de la vcn.

### Paso 2.1: Configuración de puertos

Cuando la VCN se haya creado correctamente, en el panel Security podremos ver el bloque de listas de seguridad Security Lists

![image.png]({{ '/assets/img/image 10.png' | relative_url }})

Podemos seleccionar la lista de seguridad por default, su nombre empezará por el texto Default Security List for …

![image.png]({{ '/assets/img/image 11.png' | relative_url }})

Dentro de la lista se seguridad podemos navegar a Security rules, en donde debemos agregar las reglas de ingreso

![image.png]({{ '/assets/img/image 12.png' | relative_url }})

![image.png]({{ '/assets/img/image 13.png' | relative_url }})

Agregaremos las siguientes reglas:

![image.png]({{ '/assets/img/image 14.png' | relative_url }})

```sql
Source CIDR: 0.0.0.0/0
Destination Port Range: 8080
```

![image.png]({{ '/assets/img/image 15.png' | relative_url }})

```sql
Source CIDR: 0.0.0.0/0
Destination Port Range: 1521
```

Para confirmar la creación seleccionamos Add Ingress Rules

![image.png]({{ '/assets/img/image 16.png' | relative_url }})
