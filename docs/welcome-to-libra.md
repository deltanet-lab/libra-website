---
id: welcome-to-libra
title: 欢迎
---

**欢迎来到Libra开发者网站！** Libra的使命是为数十亿人口赋能的一种简单的全球货币和金融基础设施。

> 世界真的需要一种可靠的数字货币和基础设施，这些数字货币和基础设施可以共同实现“货币互联网”的承诺。保护移动设备上的金融资产的安全性应该既简单又直观。无论您身在何处，从事何种工作或赚多少钱，在全球范围内转移资金都应该像发送短信或共享照片一样容易且具有成本效益，甚至比发送短信或共享照片更安全可靠。 — [Libra白皮书](https://libra.org/en-us/whitepaper)

Libra建立在安全，可扩展且可靠的区块链上。它以旨在赋予其内在价值的资产储备为后盾，并由负责发展生态系统的独立天秤座协会管理。

> Libra区块链的目标是为包括新的全球货币在内的金融服务奠定坚实的基础，该货币可以满足数十亿人的日常金融需求。区块链是从头开始构建的，旨在优先考虑可扩展性，安全性，存储和吞吐量的效率以及未来的适应性。 - [Libra白皮书](https://libra.org/en-us/whitepaper)

Libra货币建立在Libra区块链上。该站点记录了Libra Core，这是Libra协议的开源原型，它为这个新的区块链提供了动力。该站点还记录了[测试网络](reference/glossary.md#testnet)，此新系统的演示。与即将面世的Libra[主网](reference/glossary.md#mainnet)相反，测试网使用的数字货币**没有真实价值**。

该文档讨论：

* 如何通过[发送交易](my-first-transaction.md)到测试网来获得原型的第一手体验。
* 在何处了解新技术，例如Libra协议，Move语言和LibraBFT。
* 如何成为围绕这个新生态系统构建的社区的一部分。

<blockquote class="block_note">

**注意**：该项目处于早期原型阶段。 Libra协议和Libra Core API并非最终版本。 演化原型的关键任务之一是规范协议和API。 当前，我们的重点是基础架构和构建命令行客户端。 公共API和相关的库正在我们的直接路线图上。 我们欢迎在测试网上试用该软件，但开发人员应期望使用这些API发行应用程序可能需要做一些工作。 作为我们定期交流的一部分，我们将发布稳定版本API的进展。

</blockquote>

## Move: 一种新的区块链编程语言

“Move”是一种新的编程语言，用于在Libra区块链上实现自定义交易逻辑和“智能合约”。由于Libra的目标是每天为数十亿人提供服务，因此Move的设计以安全性为最高优先事项。

Move通过智能合约过去的安全事件中获取见解，并创建了一种语言，使编写符合作者意图的代码从本质上更容易。这样可以减少意外错误或安全事件的风险。特别是，Move旨在防止资产被克隆。它启用了将数字资产约束为与物理资产相同的属性的“资源类型”：资源只有一个所有者，只能使用一次，并且限制了新资源的创建。

移动使关键交易代码的开发更加容易。它使Libra生态系统的治理政策得以安全实施，例如Libra货币的管理和验证者节点的网络。我们预计，随着时间的推移，开发人员可以创建合同。这将支持Move的发展和验证。

有关更多信息，请参考[Move入门](move-overview.md)。

## Libra生态

Libra的生态由如下类型的实体组成：

* [客户端](#clients)
* [验证节点](#validator-nodes)
* [开发者](#developers)

### 客户端

Libra客户端：

* 是一款具有与Libra区块链进行交互功能的软件。
* 可以由最终用户运行，也可以代表最终用户运行（例如，对于托管客户端）。
* 允许用户构造，签名交易并将其提交到[验证者节点](reference/glossary.md#validator-node)。
* 可以（通过验证者节点）向Libra区块链发出查询，请求交易或帐户的状态，并验证响应。

Libra核心包含一个客户端，该客户端可以将事务提交到测试网。[我的第一笔交易](my-first-transaction.md)指导您使用Libra命令行客户端在Libra区块链上执行您的第一笔交易。

### 验证者节点(Validator Nodes)

[验证者节点](reference/glossary.md#validator-node)是Libra生态系统中的实体，共同决定将哪些交易添加到Libra区块链中。 验证者使用[共识协议](reference/glossary.md#consensus-protocol)，以便他们可以容忍恶意验证程序的存在。 验证者节点维护区块链上所有交易的历史记录。在内部，验证器节点需要保留当前状态以执行事务并计算下一个状态。 我们将在[交易的生命周期](life-of-a-transaction)中详细了解验证者节点的组成部分。

测试网是一组公共可用的验证器节点，可用于尝试系统。 您还可以使用Libra Core自己运行验证程序节点。

### 开发者

Libra生态系统为各种各样的开发人员提供支持，从为Libra Core做出贡献的人到那些构建使用区块链的应用程序的人。 术语“开发人员”涵盖以上所有这些。 开发人员可能会：

* 构建Libra客户端。
* 构建一个与Libra客户端交互的应用。
* 写一个在区块链上执行的智能合约。
* 为Libra区块链贡献代码。

该网站面向开发者。

## 参考

* [Libra协议: 关键概念](libra-protocol.md) &mdash; 向您介绍Libra协议的基本概念。
* [我的第一个交易](my-first-transaction.md) &mdash; 指导您使用Libra命令行客户端在Libra区块链上执行您的第一笔交易。
* [Getting Started With Move](move-overview.md) &mdash; 向您介绍一种被称为Move的新区块链编程语言。
* [交易生命周期](life-of-a-transaction.md) &mdash; 提供提交和执行事务时“幕后”发生的情况。
* [Libra核心概览](libra-core-overview.md) &mdash; 通过README文件提供Libra核心组件的概念和实现细节。
* [CLI Guide](reference/libra-cli.md) &mdash; 列出Libra客户端的命令（及其用法）。
* [Libra词汇表](reference/glossary.md) &mdash; 提供Libra术语的快速参考。

