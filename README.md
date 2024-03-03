# App Ecommerce

## Introduccion

La aplicacion es un back-end para un ecommerce

## Requisitos Previos

Asegúrate de tener instalados los siguientes requisitos previos antes de comenzar:

- Node.js
- MongoDB
- Cuenta de Gmail
- App Key para Nodemailer
- Key para Stripe

## Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/Augusto-Fernandez/Backend-Typescript
   ```

2. Instalar dependencias:

   ```bash
   npm install
   ```

## Configuración

Crear archivos .env y .docker.env con el siguiente formato:

- DB_URI= Uri de la base de datos Mongo. En el caso de .docker.env utilizará "mongodb://mongo_db:27017/nombre_de_db"
- NODE_PORT= puerto donde se ejecuta la aplicación. Por defecto 8082
- APPLICATION= tipo de aplicación que se utilizará. Por defecto Express Js ("AppExpress")
- DB= adaptador del tipo de ODM que se utilizará. Por defecto Mongoose ("MongooseAdapter")
- JWT_PRIVATE_KEY= Clave secreta que se utilizará en la creación de tokens
- SMTP_EMAIL= Mail que se utilizará en Nodemailer
- SMTP_KEY= App Key que se utilizará en Nodemailer
- URL= Url que en la cual se ejecutará la app. Por defecto localhost:8082
- STRIPE_PRIVATE_KEY= Clava secreta que se utilizará para el servicio Stripe

Se crearon los archivos .example.env y .example.docker.env como ejemplos

## Scripts

### Dev
Ejecuta la API mediante Nodemon en un entorno de desarrollo

```bash
npm run dev
```

### Start
Ejecuta la API mediante PM2 en un entorno de producción

```bash
npm start
```

### Test
Ejecuta el test de la API mediante Vitest y presenta los resultado en la carpeta coverage

```bash
npm run test
```

### Lint
Ejecuta la revisión del codigo mediante Eslint

```bash
npm run lint
```

## Comandos de inicio

Comando para crear usuario Admin

```shell
npm run command -- addAdmin -e dirección_de_mail -u nombre_de_admin -p contraseña_de_admin
```

## Docker Commands

Construir imagen
* docker build -t nombre_imagen:1.0 .

Listar las imágenes de docker
* docker images

Mostrar los procesos (contenedores) que se están ejecutando
* docker ps -a

Crear contendor y correrlo en el puerto 8082 con el nombre node_coder
* docker run -p 8082:8082 --name nombre_contenedor -d nombre_imagen:1.0

Destruir el contenedor
* docker rm nombre_contenedor

Parar la ejecución del contenedor
* docker stop nombre_contenedor

Comenzar la ejecución del contenedor ya creado previamente
* docker start nombre_contenedor

Mostrar los logs del contenedor, para salir presionar Ctrl + C
* docker logs -f nombre_contenedor

## Docker Compose

Levantar los contenedores. Se utiliza el flag "-d" para que se ejecute en modo detatch y permita ingresar el comando para crear el admin
* docker-compose up -d

Crear usuario admin:

1. Este comando abre el shell en el servicio node_backend

   ```bash
   docker-compose exec node_backend sh
   ```

2. Ingresar comando de creación de usuario

   ```bash
   npm run command -- addAdmin -e dirección_de_mail -u nombre_de_admin -p contraseña_de_admin
   ```
3. Cerrar shell

   ```bash
   exit
   ```

Parar los contenedores
* docker-compose stop

Remover los contenedores
* docker-compose down