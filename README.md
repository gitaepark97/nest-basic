## Setup local development

### Install tools[MacOS]

- [DBeaver](https://dbeaver.com)
- [Node.js](https://nodejs.org/)
- [Homebrew](https://brew.sh/)

  ```bash
   brew install node
  ```

- [DB Docs](https://dbdocs.io/docs)

  ```bash
  npm install -g dbdocs
  dbdocs login
  ```

- [DBML CLI](https://www.dbml.org/cli/#installation)

  ```bash
  npm install -g @dbml/cli
  dbml2sql --version
  ```

### Setup infrastructure

- Start mariadb container:
  ```bash
  npm run create:db
  ```
- Remove mariadb container:
  ```bash
  npm run remove:db
  ```
- Run db migration up 1 version:
  ```bash
  npm run migration:run
  ```
- Run db migration down 1 version:
  ```bash
   npm run migration:revert
  ```

### Documentation

- Generate DB documentation:

  ```bash
  npm run db_docs
  ```

- Access the DB documentation at [this address](https://dbdocs.io/parkkitae7/nest_basic).

### How to generate code

- Generate schema SQL file with DBML:

  ```bash
  npm run db_schema
  ```

- Create a new db migration:
  ```bash
  npm run migration:create db/migrations/<migration_name>
  ```

### How to run

- Run server:
  ```bash
  npm run start
  ```

- Run unit test:
  ```bash
  npm run test
  ```

- Run e2e test:
  ```bash
  npm run test:e2e
  ```