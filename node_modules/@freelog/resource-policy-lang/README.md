# resource-policy-lang

> resource policy language for freelog

## install

```sh
$ npm i @freelog/resource-policy-lang -S
```

## dev
0. make sure you have java environment, including jdk

1. [install antlr4](https://github.com/antlr/antlr4/blob/master/doc/getting-started.md)

2. compile grammar

  to JavaScript target
  ```
  antlr4 -Dlanguage=JavaScript -visitor resourcePolicy.g4 -o gen
  ```

  to java target, for visualize AST and other purpose
  ```
  antlr4 resourcePolicy.g4
  ```

3. compile generated JavaScript target
  Java target
  ```
  javac *.java
  ```

4. run parser against a test case
  ```
  grun resourcePolicy policy -gui < test/novel_community_p1.policy
  ```
