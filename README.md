# Learned

Interceptor/Guard/middleware do not have to declare in modules.

## traps

- never reexport *.entity
  Or you may easily get circular dependency error or entity metadata not found error(https://github.com/typeorm/typeorm/issues/420)

- AuthGuard injection quirks
- In Jest's beforeAll(), runtime error is swallowed

## JWT Security

https://stackoverflow.com/questions/27067251/where-to-store-jwt-in-browser-how-to-protect-against-csrf/37396572
