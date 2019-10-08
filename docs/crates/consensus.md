---
id: consensus
title: 共识
custom_edit_url: https://github.com/deltanet-lab/libra-website-cn/edit/master/docs/crates/consensus.md
---


共识组件使用LibraBFT共识协议进行状态机复制。

## 概览

A consensus protocol allows a set of validators to create the logical appearance of a single database. The consensus protocol replicates submitted transactions among the validators, executes potential transactions against the current database, and then agrees on a binding commitment to the ordering of transactions and resulting execution. As a result, all validators can maintain an identical database for a given version number following the [state machine replication paradigm](https://dl.acm.org/citation.cfm?id=98167). The Libra protocol uses a variant of the [HotStuff consensus protocol](https://arxiv.org/pdf/1803.05069.pdf), a recent Byzantine fault-tolerant ([BFT](https://en.wikipedia.org/wiki/Byzantine_fault)) consensus protocol, called LibraBFT. It provides safety (all honest validators agree on commits and execution) and liveness (commits are continually produced) in the partial synchrony model defined in the paper "Consensus in the Presence of Partial Synchrony" by Dwork, Lynch, and Stockmeyer ([DLS](https://groups.csail.mit.edu/tds/papers/Lynch/jacm88.pdf)) and mentioned in the paper ["Practical Byzantine Fault Tolerance" (PBFT)](http://pmg.csail.mit.edu/papers/osdi99.pdf) by Castro and Liskov, as well as newer protocols such as [Tendermint](https://arxiv.org/abs/1807.04938). In this document, we present a high-level description of the LibraBFT protocol and discuss how the code is organized. Refer to the [Libra Blockchain Paper](https://developers.libra.org/docs/the-libra-blockchain-paper) to learn more about how LibraBFT fits into the Libra protocol. For details on the specifications and proofs of LibraBFT, read the full [technical report](https://developers.libra.org/docs/state-machine-replication-paper).

共识协议允许一组验证器创建单个数据库的逻辑外观。共识协议在验证器之间复制提交的事务，在当前数据库上执行潜在的事务，然后对事务的执行顺序和执行结果达成协商一致并形成约束性承诺。因此，所有遵守[状态机复制范式](https://dl.acm.org/citation.cfm?id=98167)的验证器可以在给定的版本号之后保持数据库的一致性。Libra协议使用[HotStuff共识协议](https://arxiv.org/pdf/1803.05069.pdf)的变体，一种新的拜占庭容错（[BFT](https://en.wikipedia.org/wiki/Byzantine_fault)）共识协议，被称为LibraBFT。它提供了一种在部分同步模型中实现安全性（所有诚实的验证者同意提交和执行）和活跃性（持续产生提交）的能力， 相关技术在Dwork，Lynch，和Stockmeyer的论文["Consensus in the Presence of Partial Synchrony"（DLS）](https://groups.csail.mit.edu/tds/papers/Lynch/jacm88.pdf)中定义，并在Castro和Liskov的论文["Practical Byzantine Fault Tolerance"（PBFT）](http://pmg.csail.mit.edu/papers/osdi99.pdf)，以及更新的协议如[Tendermint](https://arxiv.org/abs/1807.04938)中被提到。
在本文中，我们将对LibraBFT协议进行概要描述，并讨论如何组织代码。参考[Libra区块链论文](https://developers.libra.org/docs/the-libra-blockchain-paper)以了解更多关于LibraBFT如何融入Libra协议。有关LibraBFT规范和证明的详细信息，请阅读完整的[技术报告](https://developers.libra.org/docs/state-machine-replication-paper)。

Agreement on the database state must be reached between validators, even if
there are Byzantine faults. The Byzantine failures model allows some validators
to arbitrarily deviate from the protocol without constraint, with the exception
of being computationally bound (and thus not able to break cryptographic assumptions). Byzantine faults are worst-case errors where validators collude and behave maliciously to try to sabotage system behavior. A consensus protocol that tolerates Byzantine faults caused by malicious or hacked validators can also mitigate arbitrary hardware and software failures.

即使存在拜占庭式故障，也必须在验证器之间达成数据库状态的协议。拜占庭故障模型允许一些验证者在不受约束的情况下任意偏离协议，除了计算绑定（因此不能破解密码假设）。拜占庭错误是最坏情况下的错误，验证器串通并恶意地试图破坏系统行为。一个能够容忍恶意或黑客验证程序导致的拜占庭错误的一致性协议也可以减轻任意硬件和软件故障。

LibraBFT assumes that a set of 3f + 1 votes is distributed among a set of validators that may be honest or Byzantine. LibraBFT remains safe, preventing attacks such as double spends and forks when at most f votes are controlled by Byzantine validators &mdash; also implying that at least 2f+1 votes are honest.  LibraBFT remains live, committing transactions from clients, as long as there exists a global stabilization time (GST), after which all messages between honest validators are delivered to other honest validators within a maximal network delay $\Delta$ (this is the partial synchrony model introduced in [DLS](https://groups.csail.mit.edu/tds/papers/Lynch/jacm88.pdf)). In addition to traditional guarantees, LibraBFT maintains safety when validators crash and restart — even if all validators restart at the same time.

假设一组3f+1的选票分布在一组可能是诚实的或拜占庭式的验证器中。当最多f票由拜占庭验证器控制，也就是说至少2F + 1票是诚实的，则LibraBFT仍然安全，可以防止诸如双花和分叉等攻击；只要存在全局稳定时间（GST），LibraBFT仍然在线，从客户端提交事务，之后，所有诚实的验证器之间的所有消息都会在最大的网络延迟$\Delta$内传递给其他诚实的验证器（这就是在[DLS](https://groups.csail.mit.edu/tds/papers/Lynch/jacm88.pdf)中引入的部分同步模型）。除了传统的保证之外，当验证程序崩溃和重新启动时，LibraBFT保持安全性，即使所有验证器同时重启。

### LibraBFT概览

In LibraBFT, validators receive transactions from clients and share them with each other through a shared mempool protocol. The LibraBFT protocol then proceeds in a sequence of rounds. In each round, a validator takes the role of leader and proposes a block of transactions to extend a certified sequence of blocks (see quorum certificates below) that contain the full previous transaction history. A validator receives the proposed block and checks their voting rules to determine if it should vote for certifying this block. These simple rules ensure the safety of LibraBFT — and their implementation can be cleanly separated and audited. If the validator intends to vote for this block, it executes the block’s transactions speculatively and without external effect. This results in the computation of an authenticator for the database that results from the execution of the block. The validator then sends a signed vote for the block and the database authenticator to the leader. The leader gathers these votes to form a quorum certificate that provides evidence of $\ge$ 2f + 1 votes for this block and broadcasts the quorum certificate to all validators.

在LibraBFT中，验证程序从客户端接收事务，并通过共享内存池协议彼此共享。然后，LibraBFT协议以一系列的循环进行。在每一轮中，验证器扮演Leader的角色，并提出一个事务块来扩展包含完整的前一个事务历史记录的经过认证的块序列（见下面的仲裁证书）。验证器接收所提议的块并检查其投票规则，以确定它是否应该投票验证该块。这些简单的规则保证了图书馆的安全，并且它们的实施可以被干净地分开和审核。如果验证器打算投票给这个块，它将推测性地执行块的事务，而不会产生外部影响。这导致计算从块的执行产生的数据库的验证器。验证器然后将该块的有符号投票和数据库验证器发送给Leader。领导收集这些选票形成法定人数证书，提供 $\ge$ (2f + 1)投票的证据，并向所有验证者广播法定人数证书。

在LibraBFT中，验证器从客户端接收交易，并通过共享的内存池协议彼此共享。然后，LibraBFT协议按一系列回合进行。在每个回合中，验证者将扮演领导者的角色，并提出一个交易区块，以扩展包含完整交易历史记录的经认证的区块序列（请参阅下面的法定证书）。验证者收到提议的区块并检查其投票规则，以确定是否应投票证明该区块。这些简单的规则可确保LibraBFT的安全性，并且可以清晰地分离和审核其实施。如果验证者打算对该区块进行投票，它将以推测性的执行该区块的交易，而不会产生外部影响。这导致了对数据库执行的身份验证器的计算，该身份验证器是由块的执行产生的。然后，验证器将对块的签名表决和数据库验证器发送给领导者。领导者收集这些票以形成法定人数证书，该证书为该区块提供$\ge$ (2f + 1)票的证据，并将法定人数证书广播给所有验证者。

A block is committed when a contiguous 3-chain commit rule is met. A block at round k is committed if it has a quorum certificate and is confirmed by two more blocks and quorum certificates at rounds k + 1 and k + 2. The commit rule eventually allows honest validators to commit a block. LibraBFT guarantees that all honest validators will eventually commit the block (and proceeding sequence of blocks linked from it). Once a sequence of blocks has committed, the state resulting from executing their transactions can be persisted and forms a replicated database.

当满足连续的3链提交规则时，将提交一个块。如果第k轮中的一个块具有法定人数认证，并且在第k+1轮和k+2轮的两个区块和法定人数认证中得到确认，则提交该块。提交规则最终允许诚实的验证者提交一个块。 LibraBFT保证所有诚实的验证者最终都会提交该块（以及后续链接到它的区块）。 一旦提交了一系列块，执行其事务所产生的状态就可以持久化并形成一个复制的数据库。

### Hotstuff范式的优势（Advantages of the HotStuff Paradigm）

We evaluated several BFT-based protocols against the dimensions of performance, reliability, security, ease of robust implementation, and operational overhead for validators. Our goal was to choose a protocol that would initially support at least 100 validators and would be able to evolve over time to support 500–1,000 validators. We had three reasons for selecting the HotStuff protocol as the basis for LibraBFT: (i) simplicity and modularity; (ii) ability to easily integrate consensus with execution; and (iii) promising performance in early experiments.

我们针对性能，可靠性，安全性，易于实施的易用性以及验证器的操作开销等方面评估了几种基于BFT的协议。我们的目标是选择一种协议，该协议最初将支持至少100个验证器，并且随着时间的推移能够发展以支持500-1000个验证器。我们选择HotStuff协议作为LibraBFT的基础有三个原因：（i）简单性和模块化； （ii）容易将共识与执行相结合的能力； 以及（iii）在早期实验中表现良好。

The HotStuff protocol decomposes into modules for safety (voting and commit rules) and liveness (pacemaker). This decoupling provides the ability to develop and experiment independently and on different modules in parallel. Due to the simple voting and commit rules, protocol safety is easy to implement and verify. It is straightforward to integrate execution as a part of consensus to avoid forking issues that arise from non-deterministic execution in a leader-based protocol. Finally, our early prototypes confirmed high throughput and low transaction latency as independently measured in [HotStuff]((https://arxiv.org/pdf/1803.05069.pdf)). We did not consider proof-of-work based protocols, such as [Bitcoin](https://bitcoin.org/bitcoin.pdf), due to their poor performance
and high energy (and environmental) costs.

HotStuff协议分解为安全性（投票和提交规则）和活动性（起搏器）模块。这种解耦提供了独立开发并在不同模块上并行进行实验的能力。由于投票和提交规则简单，协议安全性易于实现和验证。将执行作为共识的一部分进行集成很简单，可以避免在基于领导者的协议中因不确定性执行而引起的分叉问题。最后，我们的早期原型证实了高吞吐量和低事务延迟，这在[HotStuff](https://arxiv.org/pdf/1803.05069.pdf)中进行了独立测量。我们未考虑基于工作量证明的协议，例如[比特币](https://bitcoin.org/bitcoin.pdf)，
因为其性能不佳以及高昂的能源（和环境）成本。

### HotStuff的扩展与修改（HotStuff Extensions and Modifications）

In LibraBFT, to better support the goals of the Libra ecosystem, we extend and adapt the core HotStuff protocol and implementation in several ways. Importantly, we reformulate the safety conditions and provide extended proofs of safety, liveness, and optimistic responsiveness. We also implement a number of additional features. First, we make the protocol more resistant to non-determinism bugs, by having validators collectively sign the resulting state of a block rather than just the sequence of transactions. This also allows clients to use quorum certificates to authenticate reads from the database. Second, we design a pacemaker that emits explicit timeouts, and validators rely on a quorum of those to move to the next round — without requiring synchronized clocks. Third, we intend to design an unpredictable leader election mechanism in which the leader of a round is determined by the proposer of the latest committed block using a verifiable random function [VRF](https://people.csail.mit.edu/silvio/Selected%20Scientific%20Papers/Pseudo%20Randomness/Verifiable_Random_Functions.pdf). This mechanism limits the window of time in which an adversary can launch an effective denial-of-service attack against a leader. Fourth, we use aggregate signatures that preserve the identity of validators who sign quorum certificates. This allows us to provide incentives to validators that contribute to quorum certificates. Aggregate signatures also do not require a complex [threshold key setup](https://www.cypherpunks.ca/~iang/pubs/DKG.pdf).

为了更好地支持Libra生态系统的目标，在LibraBFT中我们以多种方式扩展和调整核心HOTSTUFF协议和实现。重要的是，我们重新制定安全条件，并提供安全、活跃和乐观响应的扩展证明。我们还实现了一些附加功能。首先，我们通过让验证器集体签署块的结果状态，而不仅仅是事务序列，使协议更能抵抗非确定性错误。这还允许客户端使用法定人数认证对从数据库读取的内容进行验证。其次，我们设计了一个发出显式超时的起搏器，并且验证器依靠那些法定人数移动到下一轮 - 而不需要同步时钟。第三，我们打算设计一个不可预测的领导者选举机制，其中一个回合的领导者是由一个可验证的随机函数的提议者使用可验证的随机函数[VRF](https://people.csail.mit.edu/silvio/Selected%20Scientific%20Papers/Pseudo%20Randomness/Verifiable_Random_Functions.pdf)来确定的。这种机制限制了对手可以对领导者发起有效的拒绝服务攻击的时间窗口。第四，我们使用聚合签名来保存签署法定人数认证的验证者的身份。这允许我们提供对法定人数证书的验证者的激励。聚合签名也不需要复杂的[门限密钥生成](https://www.cypherpunks.ca/~iang/pubs/DKG.pdf)。

## 实现细节（Implementation Details）

The consensus component is mostly implemented in the [Actor](https://en.wikipedia.org/wiki/Actor_model) programming model &mdash; i.e., it uses message-passing to communicate between different subcomponents with the [tokio](https://tokio.rs/) framework used as the task runtime. The primary exception to the actor model (as it is accessed in parallel by several subcomponents) is the consensus data structure *BlockStore* which manages the blocks, execution, quorum certificates, and other shared data structures. The major subcomponents in the consensus component are:

* **TxnManager** is the interface to the mempool component and supports the pulling of transactions as well as removing committed transactions. A proposer uses on-demand pull transactions from mempool to form a proposal block.
* **StateComputer** is the interface for accessing the execution component. It can execute blocks, commit blocks, and can synchronize state.
* **BlockStore** maintains the tree of proposal blocks, block execution, votes, quorum certificates, and persistent storage. It is responsible for maintaining the consistency of the combination of these data structures and can be concurrently accessed by other subcomponents.
* **EventProcessor** is responsible for processing the individual events (e.g., process_new_round, process_proposal, process_vote). It exposes the async processing functions for each event type and drives the protocol.
* **Pacemaker** is responsible for the liveness of the consensus protocol. It changes rounds due to timeout certificates or quorum certificates and proposes blocks when it is the proposer for the current round.
* **SafetyRules** is responsible for the safety of the consensus protocol. It processes quorum certificates and LedgerInfo to learn about new commits and guarantees that the two voting rules are followed &mdash; even in the case of restart (since all safety data is persisted to local storage).

All consensus messages are signed by their creators and verified by their receivers. Message verification occurs closest to the network layer to avoid invalid or unnecessary data from entering the consensus protocol.

共识组件的大部分使用[Actor](https://en.wikipedia.org/wiki/Actor_model)编程模型实现 &mdash; 例如：它使用消息传递机制来在不同子组件进行通信，并使用[tokio](https://tokio.rs/)框架作为任务运行时。除了Actor模型外，最主要的就是共识数据结构（因为它由多个子组件并行访问）*BlockStore*，它管理区块、执行、法定人数认证和其他共享数据结构。共识组件的主要子组件包括：

* **TxnManager**：是内存池（mempool）组件的接口，支持提取事务以及删除提交的事务。提议者从内存池中按需提取事务来形成提议块。
* **StateComputer**：是访问执行（execution）组件的接口。它可以执行块、提交块和同步状态。
* **BlockStore**：维护块提议树、块执行、投票、法定人数认证和持久存储。它负责维护这些数据结构的组合的一致性，并且可以同时被其他子组件访问。
* **EventProcessor**：负责处理各个事件（例如：process_new_round、process_proposal、process_vote）。它公布了每种事件类型的异步处理函数与驱动协议。
* **Pacemaker**：负责共识协议的活跃性。它由于超时证书或法定人数认证而改变回合，并且当它是当前回合的提议者时提议块。
* **SafetyRules**：负责共识协议的安全。它处理法定人数认证和LedgerInfo，以了解新的提交，并确保遵循两个投票规则 —— 即使在重启的情况下（因为所有安全数据都保存到本地存储）。

所有共识信息都由其创建者签名并由其接收者验证。消息验证发生在最靠近网络层的地方，以避免无效或不必要的数据进入共识协议。

## 模块的代码组织（How is this module organized?）

    consensus
    ├── src
    │   └── chained_bft                # Implementation of the LibraBFT protocol
    │       ├── block_storage          # In-memory storage of blocks and related data structures
    │       ├── consensus_types        # Consensus data types (i.e. quorum certificates)
    │       ├── consensusdb            # Database interaction to persist consensus data for safety and liveness
    │       ├── liveness               # Pacemaker, proposer, and other liveness related code
    │       ├── safety                 # Safety (voting) rules
    │       └── test_utils             # Mock implementations that are used for testing only
    └── state_synchronizer             # Synchronization between validators to catch up on committed state
