---
id: glossary
title: 词汇表
---


## A

* * *

### 累加器根哈希（accumulator root hash）

* 所谓**累加器根哈希**是一颗[默克尔累加器]树的根哈希(https://eprint.iacr.org/2009/625.pdf)。 

### 存取路径（Access path）

* 所谓**存取路径**指定了资源或Move模块在某个账户下的位置。
* In a state of the Libra Blockchain, 一个账户(account)表现为一组存取路径(access paths)到值(values)的映射(map)。 an account is represented as a map of access paths to values. The Move VM deserializes this representation into modules and resources.
* Clients can use access paths to request a resource or a specific piece of data stored inside a resource.

### 账户（Account）

* An **account** in the Libra Blockchain is a container for an arbitrary number of [Move modules](#move-module) and [Move resources](#move-resources). This essentially means that the state of each account is comprised of both code and data.
* The account is identified by an [account address](#account-address).

### 账户地址（Account Address）

* The **address** of a Libra account is a 256-bit value.
* Users can create an address by generating a cryptographic key-pair.
* The account address is a cryptographic hash of a user's public verification key.
* There is no limit on the number of addresses a Libra user can create. 

### 准入控制（Admission Control (AC)）

* In Libra Core, **admission control** is the sole external interface to the validator.  Any incoming request (transaction submission or queries) from a client goes through admission control. A client does not have the ability to access the storage, or any other component in the system, without going through AC.  This filters requests and protects the system.

* AC is a validator's entry point for all client interactions.  It performs basic validity checks on a submitted transaction. After completing validity checks, it passes the transaction to [mempool](#mempool).

* A client will use AC for submitting transactions and performing queries (reads).

### 认证钥匙（Authentication Key）

* An **authentication key** is used to authenticate the cryptographic key used to sign a transaction. 
* It is a piece of data stored in the user's account on the blockchain. 
* Users can rotate their signing key by rotating their authentication key.

## B

* * *

### 区块（Block）

* A **block** is an ordered list of one or more transactions. It is used by validators to reach consensus on the ordering and execution results of the transactions. 
* Blocks are an internal implementation concept in the Libra Blockchain, i.e., they are not visible to the client. All transactions that are committed to the Libra ledger were part of a block at some point in time, however the blockchain is represented as a sequence of transactions.

### 区块链（Blockchain）

* 所谓**区块链**是一个分布式公开账本。
* Libra区块链由核准的交易集合和所有交易的执行结果组成。 

### 拜占庭验证者（Byzantine Validator）

* 所谓**拜占庭验证者**是指那些不遵循共识协议并企图损害协议的正确执行。 that does not follow the specification of the consensus protocol, and wishes to compromise the correct execution of the protocol.
* BFT算法通常支持至多三分之一的算法投票权被拜占庭验证者持有。

### 拜占庭容错（Byzantine Fault Tolerance (BFT)）

* **Byzantine Fault Tolerance** (BFT) is the ability of a distributed system to provide safety and liveness guarantees in the presence of faulty, or “[Byzantine](#byzantine-validator),”  members below a certain threshold. 
* The Libra Blockchain uses LibraBFT, a consensus protocol based on [HotStuff.](#hotstuff)
* BFT algorithms typically operate with a number of entities, collectively holding N votes (which are called “validators” in the Libra application of the system). 
* N is chosen to withstand some number of validators holding f votes, which might be malicious.
* In this configuration, N is typically set to 3f+1. Validators holding up to f votes will be allowed to be faulty &mdash; offline, malicious, slow, etc. As long as 2f+1 votes are held by [honest](#honest-validator) validators, they will be able to reach consensus on consistent decisions.
* This implies that BFT consensus protocols can function correctly, even if up to one-third of the voting power is held by validator nodes that are compromised, or fail.

## C

* * *

### 客户端（Client）

A **client** is a piece of software that has the capability to interact with the Libra Blockchain.

* It can allow the user to construct, sign, and submit new transactions to the admission control component of a validator node.
* It can issue queries to the Libra Blockchain and request the status of a transaction or account.
* A client can be run by the end-user or on behalf of the end user (for example, for a custodial wallet). 

### 共识（Consensus）

* **共识**是验证器节点的一个组件。
* 共识组件负责协商所有验证器节点The consensus component is responsible for coordination and agreement amongst all validators on the block of transactions to be executed, their order, and the execution results.
* The Libra Blockchain is formed with these agreed-upon transactions and their corresponding execution results.

### 共识协议（Consensus Protocol）

* A **consensus protocol** is collectively executed by n validator nodes to accept or reject a transaction and to agree on the ordering of transactions and [execution results](#execution-result).
* See [BFT](#byzantine-fault-tolerance-bft)

### 托管钱包（Custodial Wallet）

* 在**托管钱包**模型中，钱包产品负责保管客户的资金和私钥。

## D

* * *

### 数字货币(Digital currency)

* *别名*：加密货币
* Libra就是一种数字货币。

## E

* * *

### Ed25519

* **Ed25519**是我们支持的数字签名方案。
* More specifically, Libra uses the PureEdDSA scheme over the Ed25519 curve, as defined in RFC 8032.

### 纪元（Epoch）

* An **epoch** is a period of time during which an instance of the consensus protocol runs with a fixed set of validators and voting rights.
* To change the set of validators and/or their voting rights, the current epoch ends with the commit of a special/administrative smart contract transaction and a new one is started.

* **纪元**是一段时间，在此期间，共识协议的实例使用一组固定的验证器和投票权运行。
* 要更改验证器和/或其投票权，当前纪元以提交一个特殊/管理智能合约交易作为结束，并启动新的纪元。

### 事件（Event）

* An **event** is the user-facing representation of the effects of executing a transaction.
* A transaction may be designed to emit any number of events as a list. For example, a peer-to-peer payment transaction emits a `SentPaymentEvent` for the sender account and a `ReceivedPaymentEvent` for the recipient account. 
* In the Libra protocol, events provide evidence that the successful execution of a transaction resulted in a specific effect. The `ReceivedPaymentEvent` (in the above example) allows the recipient to confirm that a payment was received into their account. 
* Events are persisted on the blockchain and are used to answer queries by [clients](#client).  


* 所谓**事件**是执行交易的效果的面向用户的表示。
* 一个交易可以设计为以列表的形式发出任意数量的事件。例如，在点对点支付交易中为发件人帐户发出`SentPaymentEvent`，为收件人帐户发出`ReceivedPaymentEvent`。
* 在libra协议中，事件提供了成功执行交易导致特定效果的证据。`ReceivedPaymentEvent`（在上面的示例中）允许收件人确认他们的帐户中收到了付款。
* 事件在区块链上持久化，用于回答[客户端](#client)的查询。

### 执行结果（Execution Result）

* 一个交易的执行结果是如下的组合:
    * 受交易影响的账户集的新状态。
    * 一组被交易执行触发的事件。
    * 退出代码，用于表明执行结果成功与否，如果失败则表示具体的错误。
    * 执行交易所消耗的gas单位数量。

### 超时时间(Expiration Time)

A transaction ceases to be valid after its **expiration time**. If it is assumed that:

* Time_C is the current time that is agreed upon between validators (Time_C is not the local time of the client);
* Time_E is the expiration time of a transaction T_N; and
* Time_C > Time_E and transaction T_N has not been included in the blockchain,

then there is a guarantee that T_N will never be included in the blockchain.

## F

* * *

### 水龙头（Faucet）

* 所谓**水龙头**是一种获取免费的Libra数字币的途径，就是“放水”的意思，该币没有实际价值，只能用于测试网。 
* Faucet是一种运行于测试网络的服务。 This service only exists to facilitate minting coins for the testnet.
* You can use the Faucet by sending a request to create coins and transfer them into a given account on your behalf.

## G

* * *

### 燃料（Gas）

* **燃料** is a way to pay for computation and storage on a blockchain network.  All transactions on the Libra network cost a certain amount of gas.
* The gas required for a transaction depends on the size of the transaction, the computational cost of executing the transaction, and the amount of additional global state created by the transaction (e.g., if new accounts are created).
* The purpose of gas is regulating demand for the limited computational and storage resources of the validators, including preventing denial of service (DoS) attacks.

### 燃料价格（Gas Price）

* Each transaction specifies the **gas price** (in microlibra/gas units) it is willing to pay. 
* The price of gas required for a transaction depends on the current demand for usage of the network.
* The **gas cost** (denominated in gas units) is fixed at a point in time.

## H

* * *

### 诚实验证者(Honest Validator)

* A validator that faithfully executes the consensus protocol and is not Byzantine.

### 尤物（HotStuff）

* **HotStuff** is a recent proposal for a [BFT](#byzantine-fault-tolerance-bft) consensus protocol. 
* LibraBFT, Libra's consensus algorithm, is based on HotStuff.
* It simplifies the reasoning about safety, and it addresses some performance limitations of previous consensus protocols.

## L

* * *

### LBR

* **LBR**是Libra数字币的缩写。

### 领导者(Leader)

* 所谓**领导者**是指为共识协议提交一组（区块）交易建议的验证者节点。 
* In leader-based protocols, nodes must agree on a leader to make progress.
* Leaders are selected by a function that takes the current [round number](https://fb.quip.com/LkbMAEBIVNbh#ffYACAO6CzD) as input. 

### Libra (The Currency)

* **Libra** is a global digital currency.
* It is stored on the Libra Blockchain.
* It is backed by a reserve of assets.
* It is governed by the independent Libra Association.

### Libra协会

* The **Libra协会** is an independent, not-for-profit membership organization, headquartered in Geneva, Switzerland. The association's purpose is to coordinate and provide a framework for governance of the network and reserve. 
* The association is created by the validator nodes who will run on the Libra network.
* Refer to the [Libra white paper](https://libra.org/en-us/whitepaper) for the a description of the mission, vision, and purview of the Libra Association.

### Libra协会委员会

* Libra协会委员会是Libra协会的治理主体。
* Libra协会委员会是Libra协会的一部分。

### LibraBFT

* LibraBFT是Libra协议的拜占庭共识算法。
* LibraBFT是基于HotStuff的。

### Libra区块链

* The **Libra区块链** is a ledger of immutable transactions agreed upon by the validator nodes on the Libra network (the network of validator nodes).

### Libra Core

* **Libra Core** is the official name for the open-source implementation of the Libra protocol published by the Libra Association.
* This software is the first implementation of the Libra protocol and the Move language. 
* Libra Core includes both validator and client functionalities.

### Libra协议

* **Libra协议**是关于Libra生态系统中如何提交、排序、执行和记录交易的规范。

### Libra储备

* **Libra reserve** is the total monetary holdings that back Libra.
* To be a validator node for the Libra Association, it is a requirement to invest in the reserve.

* **Libra储备**是支持Libra的总货币持有量的保证金。
* 要成为Libra协会的验证节点，需要投资于储备。

### LibraAccount.T

* A **`LibraAccount.T`** is a Move resource that holds all the administrative data associated with an account, such as sequence number, balance, and authentication key.
*  A **`LibraAccount.T`** is the only resource that every account is guaranteed to contain.

### LibraAccount module

* **The LibraAccount module** is a Move module that contains the code for manipulating the administrative data held in a particular `LibraAccount.T` resource.
* Code for checking or incrementing sequence numbers, withdrawing or depositing currency, and extracting gas deposits is included in the LibraAccount module. 

### Libra测试网络 

* 请查看[测试网络](#testnet).

## M

* * *
### 主网

* The Libra mainnet is the main network of the Libra Blockchain with a digital currency known as [Libra](#libra). 
* The Libra currency on mainnet will be backed by a reserve of assets.
* Mainnet will be governed by the independent [Libra Association](#libra-assocition) tasked with evolving the ecosystem. 

### Maximum Gas Amount

* The **Maximum Gas Amount**  of a transaction is the maximum amount of gas the sender is ready to pay for the transaction.
* The gas charged is equal to the gas price multiplied by units of work required to process this transaction. If the result is less than the max gas amount, the transaction has been successfully executed.
* If the transaction runs out of gas while it is being executed or the account runs out of balance during execution, then the sender will be charged for gas used and the transaction will fail. 

### 内存池（Mempool）

* **内存池（Mempool）** is one of the components of the validator node. It holds an in-memory buffer of transactions that have been submitted but not yet agreed upon and executed. Mempool receives transactions from [admission control](#admission-control).
* Transactions in the mempool of a validator are added from the admission control (AC) of the current validator and from the mempool of other validators.
* When the current validator is the leader, its consensus pulls the transactions from its mempool and proposes the order of the transactions that form a block. The validator quorum then votes on the proposal. 

### 默克尔树（Merkle Trees）

* **Merkle tree** is a type of authenticated data structure that allows for efficient verification of data integrity and updates.
* Libra network treats the entire blockchain as a single data structure that records the history of transactions and states over time.
* The Merkle tree implementation simplifies the work of apps accessing the blockchain. It allows apps to:
    * Read any data from any point in time. 
    * Verify the integrity of the data using a unified framework.

### 默克尔累加器（Merkle Accumulator）

* [默克尔累加器（Merkle Accumulator）](https://www.usenix.org/legacy/event/sec09/tech/full_papers/crosby.pdf) is an _append-only_ Merkle tree that the Libra Blockchain uses to store the ledger.
* 默克尔累加器 can provide proofs that a transaction was included in the chain (“proof of inclusion”).
* They are also called [history trees](http://people.cs.vt.edu/danfeng/courses/cs6204/sp10-papers/crosby.pdf) in literature.

### Move

* **Move** is a new programming language that implements all the transactions on the Libra Blockchain. 
* It has two different kinds of code &mdash; [transaction scripts](#transaction-script) and [Move modules](#move-module).
* For further information on “Move,” refer to the [Move technical paper](../move-paper.md)

### Move字节码

* Move程序可以编译为Move字节码。
* Move字节码 is used to express transaction scripts and Move modules.

### Move模块

* A **Move module** defines the rules for updating the global state of the Libra Blockchain. 
* In the Libra protocol, a Move module is a **smart contract**.
* Each user-submitted transaction includes a transaction script. The transaction script invokes procedures of one or more Move modules to update the global state of the blockchain according to the rules.

### Move资源

* **Move资源** contain data that can be accessed according to the **procedures** declared in a Move **module.**
* Move resources can never be copied, reused, or lost. This protects Move programmers from accidentally or intentionally losing track of a resource.

### Move虚拟机(MVM)

* The **Move virtual machine** executes transaction scripts written in [Move bytecode](#move-bytecode) to produce an [execution result](#execution-result). This result is used to update the blockchain **state**.
* The virtual machine is part of a [validator node](#validator-node).

## N

* * *

### 节点（Node）

* A **node** is a peer entity of the Libra ecosystem that tracks the state of the Libra Blockchain.
* A Libra node comprises of logical components. [Mempool](#mempool), [consensus](#consensus), and [virtual machine](#virtual-machine) are examples of node components. 

## O

* * *

### 开源社区（Open Source Community）

* **Open source community** is a term used for a group of developers who work on open-source software. If you're reading this glossary, then you're part of the Libra developer community.

## P

* * *

### 许可与非许可（Permissioned vs. Permissionless）

* Permissioned and permissionless are attributes of the way by which nodes join the set of validators in a blockchain.
* If only the nodes chosen by a single entity or organization are allowed to join the committee, it's a **permissioned** system.
* If any node can join the committee, it's a **permissionless** system.
* Libra starts as a permissioned system and will transition to permissionless.

### 证据（Proof）

* A **proof** is a way to verify the accuracy of data in the blockchain. 
* Every operation in the Libra Blockchain can be verified cryptographically that it is indeed correct and that data has not been omitted.
* For example, if a user queries the information within a particular executed transaction, they will be provided with a cryptographic proof that the data returned to them is indeed correct.

## R

* * *

### Round

* A **round** consists of achieving consensus on a block of transactions and their execution results.

### Round Number

* A **round number** is a shared counter used to select leaders during an [epoch](#epoch) of the consensus protocol.

## S 

* * *

### 序列号（Sequence Number）

* The **sequence number** for an account indicates the number of transactions that have been sent from that account. It is incremented every time a transaction sent from that account is executed and stored in the blockchain.
* A transaction is executed only if it matches the current sequence number for the sender account. This helps sequence multiple transactions from the same sender and prevents replay attacks.
* If the current sequence number of an account A is X, then a transaction T on account A will only be executed if T's sequence number is X. 
* These transactions will be held in mempool until they are the next sequence number for that account (or until they expire).
* When the transaction is applied, the sequence number of the account will become X+1. The account has a strictly increasing sequence number.

### Sender

* *Alternate name*: Sender address.
* **Sender** is the address of the originator account for a transaction. A transaction must be signed by the originator.

### 智能合约（Smart Contract）

* 请查看[Move模块](#move-module).

### 状态（State）

* A **state** in the Libra protocol is a snapshot of the distributed database. 
* A transaction modifies the database and produces a new and updated state.

### 状态根哈希（State Root Hash）

* **State root hash** is a [Merkle hash](https://en.wikipedia.org/wiki/Merkle_tree) over all keys and values the state of the Libra Blockchain at a given version.

## T

* * *
### 测试网络（testnet）

* The **testnet** is a live demonstration of an early prototype of the Libra Blockchain software, also known as **Libra Core**. 
* The Libra testnet is comprised of test [validator nodes](#validator-node) running [Libra Core](#libra-core), the software which maintains the Libra cryptocurrency. 
* The testnet is built for experimenting with new ideas without disturbing or breaking the main cryptocurrency software. 
* testnet is the predecessor to the Libra [mainnet](#mainnet), but testnet has a digital currency _with no real world value_.

### 交易（Transaction）

* A raw **transaction** contains the following fields:
    * [Sender (account address)](#account-address)
    * [Transaction script](#transaction-script)
    * [Gas price](#gas-price)
    * [Maximum gas amount](#maximum-gas-amount)
    * [Sequence number](#sequence-number)
    * [Expiration time](#expiration-time)
* A signed transaction is a raw transaction with the digital signature.
* An executed transaction changes the state of the Libra Blockchain.

### 交易脚本（Transaction script）

* Each transaction submitted by a user includes a **transaction script**.
* It represents the operation a client submits to a validator node.  
* The operation could be a request to move coins from user A to user B, or it could involve interactions with published [Move modules](#move-modules)/smart contracts.
* The transaction script is an arbitrary program that interacts with resources published in the global storage of the Libra Blockchain by calling the procedures of a module. It encodes the logic for a transaction.
* A single transaction script can send funds to multiple recipients and invoke procedures from several different modules.
* A transaction script **is not** stored in the global state and cannot be invoked by other transaction scripts. It is a single-use program.

## V

* * *

### 验证节点（Validator Node）

* *别名*: 验证者，验证器。
* A **validator** is an entity of the Libra ecosystem that validates the Libra Blockchain. 从客户端接收请求并运行共识，执行，存储。
* A validator maintains the history of all the transactions on the blockchain.
* Internally, a validator node needs to keep the current state, to execute transactions and to calculate the next state. 

### 版本（Version）

* 所谓**版本**在区块链文化中也被称为“高度”。
* The Libra Blockchain doesn't have an explicit notion of a block &mdash; it only uses blocks for batching and executing transactions.  
* A transaction at height 0 is the first transaction (genesis transaction), and a transaction at height 100 is the 101th transaction in the transaction store.

## W

* * *

### 合法交易（Well Formed Transaction）

A Libra transaction is **well formed** if each of the following conditions are true for the transaction:
* 该交易具有有效的签名。The transaction has a valid signature.
* 发送者的账户是存在的。An account exists at the sender address.
* It includes a public key, and the hash of the public key matches the sender account's authentication key. 
* 交易序列号与发送者账户的序号一致。
* 发送者的账户余额大于[最大gas量](#maximum-gas-amount)。
* 交易未超过超时时间。


