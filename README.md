# Learned

Interceptor/Guard/middleware do not have to declare in modules.

## traps

- never reexport *.entity
  Or you may easily get circular dependency error or entity metadata not found error(https://github.com/typeorm/typeorm/issues/420)

- AuthGuard injection quirks
