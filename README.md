# Workshop AIDP · Churn de clientes

Sitio público del workshop de ingeniería de datos, analítica y machine learning
con OCI AI Data Platform. El sitio usa una plantilla Jekyll propia, creada para
este workshop; no depende de un tema de terceros.

## Contenido

- **Fundamentos:** OCI, AIDP, notebooks, Spark, clústeres y Medallion.
- **Preparación:** datos sintéticos, workspace, compute cluster, JDBC y
  `requirements.txt`.
- **Laboratorios:** ingesta MySQL, Bronze, Silver, Gold y modelo de churn.
- **Recursos:** notebook de plantilla, descargas y solución de problemas.

La base MySQL ya está preconfigurada para los participantes y se consume como
una fuente de sólo lectura. Este repositorio no contiene scripts para crearla ni
datos de conexión.

## Desarrollo local

Requiere Ruby 3.3 o superior y Bundler:

```bash
bundle install
bundle exec jekyll serve
```

Abre `http://localhost:4000/aidp-churn-workshop/`.

## Publicar en GitHub Pages

1. Crea el repositorio público `mxai-tech/aidp-churn-workshop`.
2. Sube la rama `main`.
3. En **Settings → Pages**, selecciona **GitHub Actions** como fuente.
4. El workflow `.github/workflows/deploy-pages.yml` construirá y desplegará el
   sitio en `https://mxai-tech.github.io/aidp-churn-workshop/`.

## Seguridad y marca

El notebook incluido es una plantilla sin secretos. Antes de publicar una copia
del notebook completo, sustituye contraseñas, tokens, hosts privados e
identificadores de tenancy por variables de entorno o instrucciones para los
participantes. GitHub Pages es público.

Oracle y Java son marcas registradas de Oracle y/o sus afiliadas. Los recursos
de marca incluidos se usan únicamente para este material de workshop.
