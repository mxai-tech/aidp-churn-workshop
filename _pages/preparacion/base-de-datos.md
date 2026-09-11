---
title: Crear base de datos y componentes de red
section: Preparación
lead: La fuente del taller representa una operación de servicios y fue creada para practicar problemas reales de calidad y churn.
icon: ◌
vignette: Fuente transaccional de práctica
---

## Paso 1: Creación de una base de datos

<aside>

**Oracle AI Database > Autonomous AI Databases**

</aside>

Es importante seleccionar tu compartment, seleeciona *Oracle AI Database* y luego *Autonomous AI Database* en el Menú de Navegación.

![image.png]({{ '/assets/img/image 3.png' | relative_url }})

Selecciona crear Base de datos Autonomous

![image.png]({{ '/assets/img/image 4.png' | relative_url }})

Para la creación de la base de datos es importante seleccionar las siguientes características

```sql
Workload type: Lakehouse
Database version: 26ai ⚠️ Importante. Muchas características de IA están soportadas desde la versión 23ai
ECPU Count: 2
Compute auto scaling: off
Storage: 1 TB (default)
Network Access type: Secure Access from Everywhere
```
Los demás campos pueden quedar por defecto.

![image.png]({{ '/assets/img/image 4-1.png' | relative_url }})

![image.png]({{ '/assets/img/image 4-2.png' | relative_url }})

Escribe la contraseña para ADMIN, la página de la base de datos entrará en estado Provisioning, el cuál tardará al rededor de 5 minutos.

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

## Paso 2: Creación de tablas en Autonomous 26ai

Dentro del SQL, ejecutaremos el siguiente script, el cuál asignará los permisos necesarios para que el usuario ADMIN pueda hacer SELECT en cualquier tabla.

```sql
GRANT SELECT ANY TABLE TO ADMIN;
```

Remplaza con la siguiente setencia y ejecutala también. Esta sentencia define las tablas en la base de datos en las que escribiremos los datos de la capa Gold como parte de la arquitectura medallion. 

```sql
CREATE TABLE acquired_products_analytics_gold (
    as_of_date                      DATE           NOT NULL,
    customer_id                     NUMBER(10, 0)  NOT NULL,
    age                             NUMBER(3, 0),
    state_province                  VARCHAR2(100 CHAR),
    customer_status                 VARCHAR2(20 CHAR),
    cancelled_at                    TIMESTAMP(6),
    current_subscription_id         NUMBER(10, 0),
    current_product_id              NUMBER(10, 0),
    current_product_name            VARCHAR2(255 CHAR),
    current_product_category        VARCHAR2(50 CHAR),
    current_service_level_rank      NUMBER(10, 0),
    current_contracted_price        NUMBER(12, 2),
    current_subscription_started_at TIMESTAMP(6),
    days_in_current_product         NUMBER(10, 0),
    subscriptions_lifetime          NUMBER(10, 0),
    upgrades_lifetime               NUMBER(10, 0),
    downgrades_lifetime             NUMBER(10, 0),
    days_since_last_product_change  NUMBER(10, 0),
    billing_payments_90d            NUMBER(10, 0),
    overdue_payments_90d            NUMBER(10, 0),
    overdue_ratio_90d               BINARY_DOUBLE,
    days_since_last_overdue         NUMBER(10, 0),
    total_billed_90d                NUMBER(18, 2),
    average_billed_90d              NUMBER(18, 2),
    latest_payment_method           VARCHAR2(50 CHAR),
    latest_payment_due_at           TIMESTAMP(6),
    created_at                      TIMESTAMP(6)   NOT NULL,

    CONSTRAINT pk_acquired_products_analytics_gold
        PRIMARY KEY (as_of_date, customer_id)
);
```

Reemplaza la setencia con la que aparece a continuación y ejecutala también:

```sql
CREATE TABLE churn_predictions_gold (
    scored_at         TIMESTAMP(6)   NOT NULL,
    as_of_date        DATE           NOT NULL,
    customer_id       NUMBER(10, 0)  NOT NULL,
    churn_probability BINARY_DOUBLE  NOT NULL,
    predicted_churn   NUMBER(1, 0)   NOT NULL,
    risk_segment      VARCHAR2(10 CHAR) NOT NULL,
    model_name        VARCHAR2(100 CHAR) NOT NULL,
    model_version     VARCHAR2(100 CHAR) NOT NULL,

    CONSTRAINT pk_churn_predictions_gold
        PRIMARY KEY (scored_at, customer_id),

    CONSTRAINT ck_churn_probability
        CHECK (churn_probability BETWEEN 0 AND 1),

    CONSTRAINT ck_predicted_churn
        CHECK (predicted_churn IN (0, 1)),

    CONSTRAINT ck_risk_segment
        CHECK (risk_segment IN ('LOW', 'MEDIUM', 'HIGH'))
);
```

La base de datos donde se guardarán los datos de capa gold está lista, esto puede permitir el consumo a otros componentes o sistemas al producto de la arquitectura medallion y el trabajo hecho con ML.