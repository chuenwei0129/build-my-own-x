# `build-my-own-react-15`

## Usage

**在 `my-react-demo` 目录中：** 使用 [live-server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) 启动服务测试。

## 总结
<!-- state 是用户定义的，react 不像 vue 一样可以依赖收集，然后响应式 -->

### dom diff 逻辑

## 相关代码

### 首次渲染

#### 渲染文本节点

![](https://raw.githubusercontent.com/chuenwei0129/my-picgo-repo/master/fe-engineering/SCR-20220529-x3o.png)

**代码 `commit` ：**[c39fb6c5a4b92a83e647c7fa6072ffad178a06f4](https://github.com/chuenwei0129/build-my-own-x/commit/c39fb6c5a4b92a83e647c7fa6072ffad178a06f4)

#### 渲染 DOM 元素

![](https://raw.githubusercontent.com/chuenwei0129/my-picgo-repo/master/fe-engineering/SCR-20220530-q0.png)

**代码 `commit` ：**[9c8857145d16c491d9f50c23ee07aa7058c5856e](https://github.com/chuenwei0129/build-my-own-x/commit/9c8857145d16c491d9f50c23ee07aa7058c5856e)

#### 复合渲染：组件渲染

![](https://raw.githubusercontent.com/chuenwei0129/my-picgo-repo/master/fe-engineering/SCR-20220530-1lp.png)

**代码 `commit` ：**[4475870677e3c2ab572a178a2a391a4ad9bc81aa](https://github.com/chuenwei0129/build-my-own-x/commit/4475870677e3c2ab572a178a2a391a4ad9bc81aa)

#### 渲染环节的生命周期钩子

**代码 `commit` ：**[0661543956504e89d24c0c5903028880caa9511b](https://github.com/chuenwei0129/build-my-own-x/commit/0661543956504e89d24c0c5903028880caa9511b)

### 更新

#### 文本节点

**代码 `commit` ：**[0f18990b715471fdfd9d14353dbac6a9d98935d3](https://github.com/chuenwei0129/build-my-own-x/commit/0f18990b715471fdfd9d14353dbac6a9d98935d3)

#### DOM 元素元素属性及文本

**代码 `commit` ：**[18eb4055e322fa0c27d1c6708373d6ed71b078d1](https://github.com/chuenwei0129/build-my-own-x/commit/18eb4055e322fa0c27d1c6708373d6ed71b078d1)

#### dom diff

##### 组件 diff

**代码 `commit` ：**[e6312e710de9c7f139a2a6690cdda911bac66d10](https://github.com/chuenwei0129/build-my-own-x/commit/e6312e710de9c7f139a2a6690cdda911bac66d10)

##### 同级 children 节点都可复用

**代码 `commit` ：**[89a45a4bddc088660f6ff246810f53d95cd0388c](https://github.com/chuenwei0129/build-my-own-x/commit/89a45a4bddc088660f6ff246810f53d95cd0388c)

**BUG 修复：**[75786e33bce3a58dabb8a08ac19ad86625b3f1ca](https://github.com/chuenwei0129/build-my-own-x/commit/75786e33bce3a58dabb8a08ac19ad86625b3f1ca)

##### diff & patch

**代码 `commit` ：**[39fc9abdd29637d7b87e88b9c61167d7cc06e482](https://github.com/chuenwei0129/build-my-own-x/commit/39fc9abdd29637d7b87e88b9c61167d7cc06e482)
