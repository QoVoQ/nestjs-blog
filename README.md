# Nestjs-Blog

## What

This is a backend of a simple blog([realworld](https://github.com/gothinkster/realworld)) built with nestjs.

### Roadmap

- [x] Feature of app([API Spec](https://github.com/gothinkster/realworld/tree/master/api#list-of-tags))
  - [x] User Module(Register/Login/Follow)
  - [x] Article Module(CURD of article/favorite/tag)
  - [x] Comment Module(CRD of comments)
- [x] Authentication(jwt, AuthGuard, passport)
- [x] E2E test(jest)
- [ ] Log(middleware/interceptor)
- [ ] Module for configuration management
- [ ] Production ready configuration(docker)
- [ ] Remove useless configuration
- [ ] TestDBService for inserting predefined data into database before test starts
- [ ] ELK Logging
- [ ] E2E Refactor(Separate each test suit according to feature. Load necessary data before each test suit run.)

### Stacks

- Nestjs for backend framework
- Typeorm for database(Mysql) connection
- Docker for environment deployment
- Jest for test

## Why

As a frontend programmer with nearly 3 years experiences, I think it's time for me to get a better understanding of backend. So I start to build this blog, aiming to studying knowledge of dependency injection, how to design a database table, basic usage of mysql... by practice.

## How

### Development

#### 0. Install dependency

```bash
npm install
```

#### 1. Run Docker & setup database

```bash
npm run start:docker-dev
```

Hold on a few seconds to wait for database finish starting up. This process will set up database both for dev and e2e test.

#### 2. Run the app

```bash
npm run start:mydev
```

Now, you are ready to get your hand dirty.

#### 3. Debug with vscode

select `TS main` config in the .vscode/launch.json and start debugging

#### 4. Mysql log

Mysql log can be found in mysql-log/ directory.(PS: If you can't find any log, may be you should use the `chmod` command)


### Run e2e test

```bash
npm run test:e2e
```

### Production

@TODO



## Learned && traps

- never reexport *.entity
  Or you may easily get circular dependency error or entity metadata not found error(https://github.com/typeorm/typeorm/issues/420)

- AuthGuard injection quirks?(ref Module definition of JwtOptionalGuard)
- In Jest's beforeAll(), runtime error is swallowed
- Interceptor/Guard/middleware do not have to declare in modules.

## JWT Security

https://stackoverflow.com/questions/27067251/where-to-store-jwt-in-browser-how-to-protect-against-csrf/37396572
