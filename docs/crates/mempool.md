---
id: mempool
title: 内存池
custom_edit_url: https://github.com/deltanet-lab/libra-website-cn/edit/master/docs/crates/mempool.md
---

内存池是一个内存缓冲区，用于保存等待执行的事务。

## 概览

Admission control (AC) module sends transactions to mempool. Mempool holds the transactions for a period of time, before consensus commits them. When a new transaction is added, mempool shares this transaction with other validators (validator nodes) in the system. Mempool is a “shared mempool,” as transactions between mempools are shared with other validators. This helps maintain a pseudo-global ordering.

准入控制（AC）模块将事务发送到内存池。在达成共识之前，Mempool将交易保留一段时间。添加新事务后，内存池将与系统中的其他验证程序（验证程序节点）共享此事务。内存池是“共享内存池”，因为内存池之间的事务与其他验证程序共享。这有助于维持伪全局顺序。

When a validator receives a transaction from another mempool, the transaction is ordered when it’s added to the ordered queue of the recipient validator. To reduce network consumption in the shared mempool, each validator is responsible for the delivery of its own transactions. We don't rebroadcast transactions originating from a peer validator.

当验证器从另一个内存池接收到事务时，该事务将被添加到接收者验证器的已序队列中，并被排序。为了减少共享内存池中的网络消耗，每个验证器负责交付自己的事务。我们不会重播源自对等验证者的交易。

We only broadcast transactions that have some probability of being included in the next block. This means that either the sequence number of the transaction is the next sequence number of the sender account, or it is sequential to it. For example, if the current sequence number for an account is 2 and local mempool contains transactions with sequence numbers 2, 3, 4, 7, 8, then only transactions 2, 3, and 4 will be broadcast.

我们仅广播可能包含在下一个区块中的交易。这意味着交易的序号是发件人帐户的下一个序号，或者是顺序的。例如，如果帐户的当前序号为2，并且本地内存池包含序号为2、3、4、7、8的交易，则仅广播交易2、3和4。

The consensus module pulls transactions from mempool, mempool does not push transactions into consensus. This is to ensure that while consensus is not ready for transactions:

共识模块将事务从内存池中拉出，内存池不会将事务推入共识中。这是为了确保在尚未达成共识的情况下进行交易：

* Mempool can continue ordering transactions based on gas; and
* Consensus can allow transactions to build up in the mempool.

* Mempool可持续基于燃料价格对交易进行排序；和
* 可以使交易的共识在内存池中达成。

This allows transactions to be grouped into a single consensus block, and prioritized by gas price.

这允许将交易分组到一个共识块中，并按燃料价格确定优先级。

Mempool doesn't keep track of transactions sent to consensus. On each get_block request (to pull a block of transaction from mempool), consensus sends a set of transactions that were pulled from mempool, but not committed. This allows the mempool to stay agnostic about different consensus proposal branches.

Mempool不会跟踪已达成共识的交易。在每个get_block请求上（从内存池中提取事务块），共识发送一组从内存池中提取但未提交的事务。这使Mempool可以不了解不同的共识提议分支。

When a transaction is fully executed and written to storage, consensus notifies mempool. Mempool then drops this transaction from its internal state.

当事务完全执行并写入存储后，共识会通知内存池。然后，内存池将该事务从其内部状态删除。

## 实现细节

Internally, mempool is modeled as `HashMap<AccountAddress, AccountTransactions>` with various indexes built on top of it.

在内部，内存池被建模为`HashMap<AccountAddress, AccountTransactions>`，并在其之上构建了各种索引。

The main index - PriorityIndex is an ordered queue of transactions that are “ready” to be included in the next block (i.e., they have a sequence number which is sequential to the current sequence number for the account). This queue is ordered by gas price so that if a client is willing to pay more (than other clients) per unit of execution, then they can enter consensus earlier.

主索引 - PriorityIndex是“已准备好”包含在下一个区块中的交易的有序队列（即，它们的序列号与该帐户的当前序列号相继）。此队列按燃料价格排序，因此，如果一个客户愿意为每个执行单位支付更多的费用（比其他客户多），那么他们可以更早地达成共识。

Note that, even though global ordering is maintained by gas price, for a single account, transactions are ordered by sequence number. All transactions that are not ready to be included in the next block are part of a separate ParkingLotIndex. They are moved to the ordered queue once some event unblocks them.

请注意，即使按燃料价格维护全局顺序，对于单个帐户，交易也按序列号排序。未准备好包含在下一个块中的所有事务都是单独的ParkingLotIndex的一部分。一旦某些事件解除阻止，它们就会移到有序队列中。

Here is an example: mempool has a transaction with sequence number 4, while the current sequence number for that account is 3. This transaction is considered “non-ready.” Callback from consensus notifies that transaction was committed (i.e., transaction 3 was submitted to a different node and has hence been committed on chain). This event “unblocks” the local transaction, and transaction #4 is moved to the OrderedQueue.

这是一个示例：mempool的事务的序列号为4，而该帐户的当前序列号为3。该事务被认为是“未就绪”。来自共识的回调通知事务已提交（即事务3已提交）。到另一个节点，因此已在链上提交）。此事件“解除阻止”本地事务，并且事务＃4移至OrderedQueue。

Mempool only holds a limited number of transactions to avoid overwhelming the system and to prevent abuse and attack. Transactions in Mempool have two types of expirations: systemTTL and client-specified expiration. When either of these is reached, the transaction is removed from Mempool.

Mempool仅保留有限数量的事务，以避免使系统不堪重负，并防止滥用和攻击。Mempool中的事务有两种到期类型：systemTTL和客户端指定的到期。当达到上述任何一个条件时，该事务将从Mempool中删除。

SystemTTL is checked periodically in the background, while the expiration specified by the client is checked on every Consensus commit request. We use a separate system TTL to ensure that a transaction doesn’t remain stuck in the Mempool forever, even if Consensus doesn't make progress.

在后台定期检查SystemTTL，同时在每个共识提交请求中检查客户端指定的到期时间。我们使用单独的系统TTL，以确保即使共识未取得进展，交易也不会永远停留在Mempool中。

## 模块代码组织
```
    mempool/src
    ├── core_mempool             # main in memory data structure
    ├── proto                    # protobuf definitions for interactions with mempool
    ├── lib.rs
    ├── mempool_service.rs       # gRPC service
    ├── runtime.rs               # bundle of shared mempool and gRPC service
    └── shared_mempool.rs        # shared mempool
```

