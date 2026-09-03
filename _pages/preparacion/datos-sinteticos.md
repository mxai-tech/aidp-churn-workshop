---
title: Conocer los datos sintéticos
section: Preparación
lead: La fuente del taller representa una operación de servicios y fue creada para practicar problemas reales de calidad y churn.
icon: ◌
vignette: Fuente transaccional de práctica
---

## Propósito del conjunto de datos

La fuente MySQL ya existe antes del taller. Contiene datos sintéticos para una
empresa hipotética de servicios y representa el sistema transaccional de origen.
Los participantes se conectarán a esa fuente para llevar los datos a su propio
tenant de OCI.

Los datos son sintéticos: no representan personas ni operaciones reales. Fueron
diseñados para tener patrones plausibles, inconsistencias típicas de sistemas
legado y eventos suficientes para practicar analítica y ML.

## Entidades disponibles

- **customers:** identidad, ubicación, edad, estado y datos de cancelación.
- **products:** tres familias —Nube, Conectividad y Seguridad—; cada una con
  niveles Juvenil, Senior y Platinum.
- **subscriptions:** historial de productos contratados. Un cambio crea una
  nueva suscripción y la anterior queda cancelada.
- **billing_payments:** cobros mensuales, vencimiento, importe, método y fecha
  de registro del pago.

## Patrones descubribles

- Algunos pagos se registran después de `due_at` (fecha de vencimiento); en 
  Bronze siguen como `PAID`. Silver debe derivar el estado `OVERDUE` con las fechas.
- El sistema legado no escribe el sentido de los cambios de producto de manera
  confiable. Silver determina `UPGRADE` y `DOWNGRADE` comparando niveles.
- Las cancelaciones se concentran en clientes con pagos tardíos. Esto genera una
  señal útil, pero no una causalidad demostrada.
- Puede haber suscripciones canceladas que sólo reflejan un cambio de producto;
  el churn final requiere validar el estado y fecha de cancelación del cliente.

> No se crea, altera ni siembra la base MySQL durante el taller. Trátala como
> una fuente de datos externa y de sólo lectura.
