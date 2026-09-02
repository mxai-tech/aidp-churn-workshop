# Workshop AIDP · Churn de clientes

Sitio público del workshop de ingeniería de datos, analítica y machine learning
con OCI AI Data Platform. Está construido con
[Jekyll-theme-Satellite](https://github.com/byanko55/jekyll-theme-satellite),
distribuido bajo licencia MIT.

## Contenido

- Fundamentos: OCI, AIDP, notebooks, Spark, clusters y Medallion.
- Preparación del workspace y compute cluster.
- Instalación de MySQL Connector/J y `requirements.txt`.
- Datos sintéticos, ingesta MySQL, Bronze/Silver/Gold y churn ML.
- Recursos, notebook de plantilla y troubleshooting.

La base MySQL es una fuente preconfigurada y de sólo lectura para los
participantes. Este repositorio no contiene scripts para crearla ni datos de
conexión.

## Desarrollo local

Requiere Ruby y Bundler:

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

## Seguridad de notebooks

El notebook incluido es una plantilla sin secretos. Antes de publicar una copia
del notebook completo, sustituye contraseñas, tokens, hosts privados e
identificadores de tenancy por variables de entorno o instrucciones para los
participantes. GitHub Pages es público.
