# build-my-own-x

## react: build-my-own-react

> [温故知新：手写迷你 react 15](packages/build-my-own-react/README.md)

## webpack: build-my-own-pack

> [窥探原理：手写一个 JavaScript 打包器](packages/build-my-own-pack/README.md)

## lerna

> 前往 [lerna](https://github.com/lerna/lerna) 查看官方文档，下面做一个简易入门。

### 初始化项目

```sh
npx lerna init
```

生成项目结构如下：

```sh
my-repo/
  packages/
  package.json
  lerna.json
```

`packages.json` 文件中指定 `packages` 工作目录为 `packages/*` 下所有目录。

### 创建 package

```sh
lerna create my-demo
lerna create my-pack
lerna create my-tapable
```

会在 `packages/` 目录下生成三个子项目:

![](https://raw.githubusercontent.com/chuenwei0129/my-picgo-repo/master/fe-engineering/SCR-20220527-q4v.png)

### 开启 workspace

默认是 `npm`，每个子 `package` 都有自己的 `node_modules`。

新增如下配置，开启 `workspace`。目的是让顶层统一管理 `node_modules`，子 `package` 不管理。

```json
// package.json
{
  "private": true,
  "workspaces": [
    "packages/*"
  ],
}

// lerna.json
{
  "useWorkspaces": true,
  "npmClient": "yarn"
}
```

### lerna add

```sh
# 为所有子 package 都安装 chalk
lerna add chalk
# 为 create-react-app 安装 commander
lerna add commander --scope=create-react-app
# 如果包做了命名空间，需要加上前缀
lerna add commander --scope=@react/create-react-app

# 如果安装失败，请检查拼写是否错误或者查看子包是否有命名空间
```

如果想要在根目录为所有子包添加统一依赖，并只在根目录 `package.json` 下，可以借助 `yarn`

```sh
yarn add chalk --ignore-workspace-root-check
```

还能在根目录为某个子 `package` 安装依赖

```sh
# 子包有命名空间需要加上
yarn workspace create-react-app add commander
```

### lerna bootstrap

默认是 `npm i`，指定使用 `yarn` 后，就等价于 `yarn install`

### lerna list

列出所有的包

### lerna link

建立软链，等价于 `npm link`
