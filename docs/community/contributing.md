---
id: contributing
title: 贡献指南
---

我们的目标是使对Libra项目的贡献变得容易且透明。

<blockquote class="block_note">
Libra Core项目目前是早期原型，正在快速发展中。 在对该项目做出任何实质性贡献之前，请确保在Discourse论坛中进行讨论，以确保它适合项目路线图。
</blockquote>

## 为Libra Core做贡献

要为Libra Core做出贡献，请确保您具有最新版本的代码库。 要为Libra Core设置所有必要的依赖项，以进行lint，测试和构建文档，请运行以下命令：

```
$ git clone https://github.com/libra/libra.git
$ cd libra
$ ./scripts/dev_setup.sh
$ source ~/.cargo/env
$ cargo build
$ cargo test
```

## 编码指南

有关如何为Libra Core代码库做出贡献的详细指南，请参阅[编码指南](coding-guidelines.md)。

## 文档

所有开发人员文档均发布在Libra开发人员网站上。 开发人员站点是开放源代码，用于构建站点的代码位于此[代码库](https://github.com/libra/website/)中。 开发人员站点是使用[Docusaurus](https://docusaurus.io/)构建的。

如果您熟悉Markdown，则可以开始贡献！

## （代码）合并请求

在开发的初始阶段，我们计划仅审核和审查（代码）合并请求。 随着代码库的稳定，我们将能够接受来自社区的（代码）合并请求。

提交（代码）合并请求：

1. 分叉`libra`代码库，并从`master`创建分支。
2. 如果添加了应该测试的代码，请添加单元测试。
3. 如果您对API进行了更改，请更新相关文档，并构建和测试开发人员站点。
4. 验证并确保测试套件通过。
5. 确保您的代码通过了两个linter。
6. 如果尚未完成贡献者许可协议（CLA），则请完成。
7. 提交您的（代码）合并请求。

## 贡献者许可协议

为了使任何Libra项目都能接受您的（代码）合并请求，您需要签署CLA。 您只需执行一次即可在任何Libra开源项目上工作。 代表自己作出贡献的个人可以签署[个人CLA](https://github.com/deltanet-lab/libra-website-cn/blob/master/contributing/individual-cla.pdf)。 如果您代表雇主供款，请要求他们签署[公司CLA](https://github.com/deltanet-lab/libra-website-cn/master/contributing/corporate-cla.pdf)。

## 行为准则

请参考[行为准则](../policies/code-of-conduct.md)，其中描述了对社区内部互动的期望。

## 问题跟踪

Libra使用[GitHub问题](https://github.com/libra/libra/issues)来跟踪错误。 请提供必要的信息和说明以重现您的问题。 与安全相关的错误应使用我们的[安全过程](../policies/security.md)报告。
