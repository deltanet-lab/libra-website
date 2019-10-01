---
id: consensus
title: 共识
custom_edit_url: https://github.com/libra/libra/edit/master/consensus/README.md
---


共识组件使用LibraBFT共识协议进行状态机复制。

## 概览

A consensus protocol allows a set of validators to create the logical appearance of a single database. The consensus protocol replicates submitted transactions among the validators, executes potential transactions against the current database, and then agrees on a binding commitment to the ordering of transactions and resulting execution. As a result, all validators can maintain an identical database for a given version number following the [state machine replication paradigm](https://dl.acm.org/citation.cfm?id=98167). The Libra protocol uses a variant of the [HotStuff consensus protocol](https://arxiv.org/pdf/1803.05069.pdf), a recent Byzantine fault-tolerant ([BFT](https://en.wikipedia.org/wiki/Byzantine_fault)) consensus protocol, called LibraBFT. It provides safety (all honest validators agree on commits and execution) and liveness (commits are continually produced) in the partial synchrony model defined in the paper "Consensus in the Presence of Partial Synchrony" by Dwork, Lynch, and Stockmeyer ([DLS](https://groups.csail.mit.edu/tds/papers/Lynch/jacm88.pdf)) and mentioned in the paper ["Practical Byzantine Fault Tolerance" (PBFT)](http://pmg.csail.mit.edu/papers/osdi99.pdf) by Castro and Liskov, as well as newer protocols such as [Tendermint](https://arxiv.org/abs/1807.04938). In this document, we present a high-level description of the LibraBFT protocol and discuss how the code is organized. Refer to the [Libra Blockchain Paper](https://developers.libra.org/docs/the-libra-blockchain-paper) to learn more about how LibraBFT fits into the Libra protocol. For details on the specifications and proofs of LibraBFT, read the full [technical report](https://developers.libra.org/docs/state-machine-replication-paper).

Agreement on the database state must be reached between validators, even if
there are Byzantine faults. The Byzantine failures model allows some validators
to arbitrarily deviate from the protocol without constraint, with the exception
of being computationally bound (and thus not able to break cryptographic assumptions). Byzantine faults are worst-case errors where validators collude and behave maliciously to try to sabotage system behavior. A consensus protocol that tolerates Byzantine faults caused by malicious or hacked validators can also mitigate arbitrary hardware and software failures.

LibraBFT assumes that a set of 3f + 1 votes is distributed among a set of validators that may be honest or Byzantine. LibraBFT remains safe, preventing attacks such as double spends and forks when at most f votes are controlled by Byzantine validators &mdash; also implying that at least 2f+1 votes are honest.  LibraBFT remains live, committing transactions from clients, as long as there exists a global stabilization time (GST), after which all messages between honest validators are delivered to other honest validators within a maximal network delay $\Delta$ (this is the partial synchrony model introduced in [DLS](https://groups.csail.mit.edu/tds/papers/Lynch/jacm88.pdf)). In addition to traditional guarantees, LibraBFT maintains safety when validators crash and restart — even if all validators restart at the same time.


共识协议允许一组验证器创建单个数据库的逻辑外观。协商一致协议在提交者之间复制提交的事务，对当前数据库执行潜在的事务，然后同意对事务的有序执行和执行的约束性承诺。因此，所有的验证器可以在给定的版本号之后保持[状态机复制范例](https://dl.acm.org/citation.cfm?id=98167)相同的数据库。天秤协议使用[HotStuff共识协议](https://arxiv.org/pdf/1803.05069.pdf)的变体，最近的拜占庭容错（[BFT](https://en.wikipedia.org/wiki/Byzantine_fault)）一致协议，称为Labababt。它提供了安全性（所有诚实的验证者同意提交和执行）和活跃性（持续产生）的部分同步模型中定义的“一致存在的部分同步”的Dwork，Lynch，和StordMeYER（[DLS](https://groups.csail.mit.edu/tds/papers/Lynch/jacm88.pdf)），并在本文中提到[卡斯特罗]和Liskov的“实际拜占庭容错”（http://PMGCSAN.MIT.EDU/PUDS/OSDI99PDF），以及更新的协议，如[TeNeMtNeT]（http://ARXIV.org/ABS/ 1807.04938）。在本文中，我们将对librabft协议进行高级描述，并讨论如何组织代码。参考[Libra区块链论文](https://developers.libra.org/docs/the-libra-blockchain-paper)以了解更多关于LibraBFT如何融入Libra协议。有关LibraBFT规范和证明的详细信息，请阅读完整的[技术报告](https://developers.libra.org/docs/state-machine-replication-paper)。

即使存在拜占庭式故障，也必须在验证器之间达成数据库状态的协议。拜占庭故障模型允许一些验证者在不受约束的情况下任意偏离协议，除了计算绑定（因此不能破解密码假设）。拜占庭错误是最坏情况下的错误，验证器串通并恶意地试图破坏系统行为。一个能够容忍恶意或黑客验证程序导致的拜占庭错误的一致性协议也可以减轻任意硬件和软件故障。

假设一组3f+1的选票分布在一组可能是诚实的或拜占庭式的验证器中。LababFFT仍然安全，当双倍的票数被ByZaldAdvestals&amp; MaSH控制时，防止诸如双花和分叉之类的攻击；也意味着至少2F + 1票是诚实的。只要存在一个全局稳定时间（GST），Labababt仍然是活的，从客户端提交事务，之后，所有诚实的验证器之间的所有消息都被传递到最大的网络延迟$Delta $中的其他诚实的验证器（这是在[DLS](https://groups.csail.mit.edu/tds/papers/Lynch/jacm88.pdf)中引入的部分同步模型）。除了传统的保证之外，当验证程序崩溃和重新启动时，RealabFT保持安全性，即使所有验证器同时重启。

### LibraBFT概览

In LibraBFT, validators receive transactions from clients and share them with each other through a shared mempool protocol. The LibraBFT protocol then proceeds in a sequence of rounds. In each round, a validator takes the role of leader and proposes a block of transactions to extend a certified sequence of blocks (see quorum certificates below) that contain the full previous transaction history. A validator receives the proposed block and checks their voting rules to determine if it should vote for certifying this block. These simple rules ensure the safety of LibraBFT — and their implementation can be cleanly separated and audited. If the validator intends to vote for this block, it executes the block’s transactions speculatively and without external effect. This results in the computation of an authenticator for the database that results from the execution of the block. The validator then sends a signed vote for the block and the database authenticator to the leader. The leader gathers these votes to form a quorum certificate that provides evidence of $\ge$ 2f + 1 votes for this block and broadcasts the quorum certificate to all validators.

A block is committed when a contiguous 3-chain commit rule is met. A block at round k is committed if it has a quorum certificate and is confirmed by two more blocks and quorum certificates at rounds k + 1 and k + 2. The commit rule eventually allows honest validators to commit a block. LibraBFT guarantees that all honest validators will eventually commit the block (and proceeding sequence of blocks linked from it). Once a sequence of blocks has committed, the state resulting from executing their transactions can be persisted and forms a replicated database.

在librabft中，验证程序从客户端接收事务，并通过共享mempool协议彼此共享。然后，LababFT协议以一系列的循环进行。在每一轮中，验证器扮演leader的角色，并提出一个事务块来扩展包含完整的前一个事务历史记录的经过认证的块序列（见下面的仲裁证书）。验证器接收所提议的块并检查其投票规则，以确定它是否应该投票验证该块。这些简单的规则保证了图书馆的安全，并且它们的实施可以被干净地分开和审核。如果验证器打算投票给这个块，它将推测性地执行块的事务，而不会产生外部影响。这导致计算从块的执行产生的数据库的验证器。验证器然后将该块的有符号投票和数据库验证器发送给leader。领导收集这些选票形成法定人数证书，提供$2f+ 1块投票的证据，并向所有验证者广播法定人数证书。

满足连续3链提交规则时提交块。如果第k轮的一个区块有法定人数证书，并且在第k+1轮和第k+2轮的两个区块和法定人数证书中得到确认，则该区块被提交。提交规则最终允许诚实的验证器提交一个块。LababFFT保证所有诚实的验证者最终都会提交块（并继续从它链接的块）。一旦提交了一系列块，执行它们的事务所产生的状态就可以持久化并形成一个复制数据库。

### Hotstuff范式的优势

We evaluated several BFT-based protocols against the dimensions of performance, reliability, security, ease of robust implementation, and operational overhead for validators. Our goal was to choose a protocol that would initially support at least 100 validators and would be able to evolve over time to support 500–1,000 validators. We had three reasons for selecting the HotStuff protocol as the basis for LibraBFT: (i) simplicity and modularity; (ii) ability to easily integrate consensus with execution; and (iii) promising performance in early experiments.

The HotStuff protocol decomposes into modules for safety (voting and commit rules) and liveness (pacemaker). This decoupling provides the ability to develop and experiment independently and on different modules in parallel. Due to the simple voting and commit rules, protocol safety is easy to implement and verify. It is straightforward to integrate execution as a part of consensus to avoid forking issues that arise from non-deterministic execution in a leader-based protocol. Finally, our early prototypes confirmed high throughput and low transaction latency as independently measured in [HotStuff]((https://arxiv.org/pdf/1803.05069.pdf)). We did not consider proof-of-work based protocols, such as [Bitcoin](https://bitcoin.org/bitcoin.pdf), due to their poor performance
and high energy (and environmental) costs.

我们评估了若干基于BFT的协议，针对性能、可靠性、安全性、易实现性的易用性以及验证器的操作开销。我们的目标是选择一个最初支持至少100个验证器的协议，并且能够随着时间的推移来支持500到1000个验证器。我们选择hotstuff协议作为librabft的基础有三个原因：（i）简单性和模块性；（ii）容易将一致性与执行集成的能力；以及（iii）在早期实验中有很好的性能。

hotsuff协议分解为安全（投票和提交规则）和活跃（起搏器）模块。这种解耦提供了独立开发和实验的能力，并在不同的模块并行。由于简单的投票和提交规则，协议安全性易于实现和验证。将执行作为共识的一部分进行集成是很简单的，以避免在基于leader的协议中由不确定性执行引起的分叉问题。最后，我们的早期原型证实了在[HOTHOTHOR]（（http://ARXIV.org/pdf／1803.05069 pdf））中独立测量的高吞吐量和低事务延迟。我们没有考虑基于工作证明的协议，比如[比特币]（https://bitcoin.org/bitcoin.pdf），因为它们的性能很差以及高昂的能源（和环境）成本。

### HotStuff Extensions and Modifications

In LibraBFT, to better support the goals of the Libra ecosystem, we extend and adapt the core HotStuff protocol and implementation in several ways. Importantly, we reformulate the safety conditions and provide extended proofs of safety, liveness, and optimistic responsiveness. We also implement a number of additional features. First, we make the protocol more resistant to non-determinism bugs, by having validators collectively sign the resulting state of a block rather than just the sequence of transactions. This also allows clients to use quorum certificates to authenticate reads from the database. Second, we design a pacemaker that emits explicit timeouts, and validators rely on a quorum of those to move to the next round — without requiring synchronized clocks. Third, we intend to design an unpredictable leader election mechanism in which the leader of a round is determined by the proposer of the latest committed block using a verifiable random function [VRF](https://people.csail.mit.edu/silvio/Selected%20Scientific%20Papers/Pseudo%20Randomness/Verifiable_Random_Functions.pdf). This mechanism limits the window of time in which an adversary can launch an effective denial-of-service attack against a leader. Fourth, we use aggregate signatures that preserve the identity of validators who sign quorum certificates. This allows us to provide incentives to validators that contribute to quorum certificates. Aggregate signatures also do not require a complex [threshold key setup](https://www.cypherpunks.ca/~iang/pubs/DKG.pdf).

在LibraBFT，为了更好地支持天秤座生态系统的目标，我们以多种方式扩展和调整核心HOTHOTS协议和实现。重要的是，我们重新制定安全条件，并提供安全、活跃和乐观响应的扩展证明。我们还实现了一些附加功能。首先，我们通过让验证器集体签署块的结果状态，而不仅仅是事务序列，使协议更能抵抗非确定性错误。这还允许客户端使用仲裁证书对从数据库读取的内容进行身份验证。其次，我们设计了一个发出显式超时的起搏器，并且验证器依靠那些法定人数移动到下一轮-而不需要同步时钟。第三，我们打算设计一个不可预测的领导者选举机制，其中一个回合的领导者是由一个可验证的随机函数的提议者使用可验证的随机函数[VRF](https://people.csail.mit.edu/silvio/Selected%20Scientific%20Papers/Pseudo%20Randomness/Verifiable_Random_Functions.pdf)来确定的。这种机制限制了对手可以对领导者发起有效的拒绝服务攻击的时间窗口。第四，我们使用聚合签名来保存签署仲裁证书的验证者的身份。这允许我们提供对法定人数证书的验证者的激励。聚合签名也不需要复杂的[门限密钥生成](https://www.cypherpunks.ca/~iang/pubs/DKG.pdf)。

## Implementation Details

The consensus component is mostly implemented in the [Actor](https://en.wikipedia.org/wiki/Actor_model) programming model &mdash; i.e., it uses message-passing to communicate between different subcomponents with the [tokio](https://tokio.rs/) framework used as the task runtime. The primary exception to the actor model (as it is accessed in parallel by several subcomponents) is the consensus data structure *BlockStore* which manages the blocks, execution, quorum certificates, and other shared data structures. The major subcomponents in the consensus component are:

一致性组件主要在[演员](https://en.wikipedia.org/wiki/Actor_model)编程模型中实现，&mdash; 它使用消息传递来在不同子组件之间以[tokio](https://tokio.rs/)框架作为任务运行时进行通信。Actudio模型的主要例外（因为它由多个子组件并行访问）是一致的数据结构*BuffSturt*，它管理块、执行、仲裁证书和其他共享数据结构。共识部分的主要子组成部分包括：

* **TxnManager** is the interface to the mempool component and supports the pulling of transactions as well as removing committed transactions. A proposer uses on-demand pull transactions from mempool to form a proposal block.
* **StateComputer** is the interface for accessing the execution component. It can execute blocks, commit blocks, and can synchronize state.
* **BlockStore** maintains the tree of proposal blocks, block execution, votes, quorum certificates, and persistent storage. It is responsible for maintaining the consistency of the combination of these data structures and can be concurrently accessed by other subcomponents.
* **EventProcessor** is responsible for processing the individual events (e.g., process_new_round, process_proposal, process_vote). It exposes the async processing functions for each event type and drives the protocol.
* **Pacemaker** is responsible for the liveness of the consensus protocol. It changes rounds due to timeout certificates or quorum certificates and proposes blocks when it is the proposer for the current round.
* **SafetyRules** is responsible for the safety of the consensus protocol. It processes quorum certificates and LedgerInfo to learn about new commits and guarantees that the two voting rules are followed &mdash; even in the case of restart (since all safety data is persisted to local storage).

All consensus messages are signed by their creators and verified by their receivers. Message verification occurs closest to the network layer to avoid invalid or unnecessary data from entering the consensus protocol.

## 模块的代码组织

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
