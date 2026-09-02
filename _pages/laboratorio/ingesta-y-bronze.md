---
title: Laboratorio 1 · Ingesta MySQL y Bronze
section: Laboratorios
lead: Conecta Spark a la fuente MySQL y crea una copia trazable de los datos transaccionales.
icon: ⌁
vignette: Fuente a Bronze, sin transformar
---

## Objetivo

Conectar el notebook al MySQL proporcionado, leer las cuatro entidades de origen
y persistirlas como tablas Delta Bronze en el entorno AIDP del participante.

## Actividades

1. Adjunta el notebook sanitizado al cluster configurado.
2. Declara las variables de conexión mediante el mecanismo aprobado por el
   instructor; no las guardes en el notebook público.
3. Verifica que el driver JDBC esté disponible:

```python
spark._jvm.java.lang.Class.forName("com.mysql.cj.jdbc.Driver")
```

4. Usa `spark.read.format("jdbc")` para leer `customers`, `products`,
   `subscriptions` y `billing_payments`.
5. Escribe cada DataFrame en la capa Bronze.
6. Cuenta las filas y revisa esquema, nulos y rangos de fechas.

## Validaciones esperadas

- Los pagos tardíos aún se ven como `PAID` en la fuente.
- Los clientes cerrados tienen una fecha de cancelación.
- Las suscripciones conservan historial de productos y estados cancelados.

Bronze no es una capa de corrección: conserva evidencia de la fuente para poder
explicar posteriormente de dónde proviene cada decisión de calidad.
