# Bot de Postulación Automática

Este proyecto es un bot que automatiza el registro de postulaciones a ofertas laborales y la gestión de proyectos. Utiliza [n8n](https://n8n.io/) como motor de flujo de trabajo y se ejecuta dentro de un contenedor Docker.

## Requisitos

- Tener instalado [Docker](https://www.docker.com/get-started)

> Si no tienes Docker instalado, puedes descargarlo desde:  
> 👉 https://www.docker.com/get-started

## Instrucciones de uso

1. **Clona este repositorio**:

    ```bash
    git clone https://github.com/UsuariooRoot/bot-applicatio-manager.git
    cd bot-applicatio-manager
    ```

2. **Inicia el contenedor de n8n**:

    ```bash
    docker compose up -d
    ```

3. **Abre la interfaz de n8n** en tu navegador:

    ```
    http://localhost:5678
    ```

4. **Importa el flujo**:

    - Abre el archivo `Flujo.json` que se encuentra en la raíz del proyecto.
    - Copia todo su contenido.
    - En la interfaz de n8n, haz clic en el menú de tres puntos en la esquina superior derecha.
    - Selecciona **Import workflow**.
    - Pega el contenido y haz clic en **Import**.

5. **Guarda y activa el flujo si es necesario.**

## Licencia

MIT
