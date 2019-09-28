---
id: state-machine-replication-paper
title: Libra区块链中的复制状态机（SMR）
---

<!-- hide the table of contents --><style>.toc-headings {display: none !important; visibility: hidden !important;}</style>

## 概要

This report presents LibraBFT, a robust and efficient state machine replication system designed for the Libra Blockchain. LibraBFT is based on HotStuff, a recent protocol that leverages several decades of scientific advances in Byzantine fault tolerance (BFT) and achieves the strong scalability and security properties required by internet settings. LibraBFT further refines the HotStuff protocol to introduce explicit liveness mechanisms and provides a concrete latency analysis. To drive the integration with the Libra Blockchain, this document provides specifications extracted from a fully-functional simulator. These specifications include state replication interfaces and a communication framework for data transfer and state synchronization among participants. Finally, this report provides a formal safety proof that induces criteria to detect misbehavior of BFT nodes, coupled with a simple reward and punishment mechanism.

本报告介绍了LibraBFT，这是专为Libra区块链设计的强大而高效的状态机复制系统。 LibraBFT基于HotStuff，HotStuff是一种新的协议，它利用了拜占庭式容错（BFT）数十年的科学进展，并实现了Internet设置所需的强大可伸缩性和安全性。 LibraBFT进一步完善了HotStuff协议，引入了明确的活动机制，并提供了具体的延迟分析。 为了推动与Libra区块链的集成，本文档提供了从功能齐全的模拟器中提取的规范。 这些规范包括状态复制接口和用于参与者之间的数据传输和状态同步的通信框架。 最后，该报告提供了正式的安全证明，可引诱标准来检测BFT节点的不良行为，并具有简单的奖惩机制。

### 下载链接

[![State Machine Replication in the Libra Blockchain PDF Download](assets/illustrations/state-machine-pdf.png){: .download}](assets/papers/libra-consensus-state-machine-replication-in-the-libra-blockchain.pdf)
