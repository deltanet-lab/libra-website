---
id: execution
title: 执行
custom_edit_url: https://github.com/deltanet-lab/libra-website-cn/edit/master/docs/crates/execution.md
---


## 概览

The Libra Blockchain is a replicated state machine. Each validator is a replica
of the system. Starting from genesis state S<sub>0</sub>, each transaction
T<sub>i</sub> updates previous state S<sub>i-1</sub> to S<sub>i</sub>. Each
S<sub>i</sub> is a mapping from accounts (represented by 32-byte addresses) to
some data associated with each account.

Libra区块链是一个复制状态机。每个验证器都是系统的一个副本。从初始状态S<sub>0</sub>开始，每个事务T<sub>i</sub>将先前的状态S<sub>i-1</sub>更新为S<sub>i</sub>。每个S<sub>i</sub>是从帐户（32字节的地址）到与每个帐户相关联的某些数据的映射。

The execution component takes the ordered transactions, computes the output
for each transaction via the Move virtual machine, applies the output on the
previous state, and generates the new state. The execution system cooperates
with the consensus algorithm &mdash; HotStuff, a leader-based algorithm — to
help it agree on a proposed set of transactions and their execution. Such a
group of transactions is a block. Unlike in other blockchain systems, blocks
have no significance other than being a batch of transactions — every
transaction is identified by its position within the ledger, which is also
referred to as its "version". Each consensus participant builds a tree of blocks
like the following:

执行组件获取有序的事务，通过Move虚拟机计算每个事务的输出，将输出应用于先前状态，并生成新状态。执行系统与共识算法HotStuff（基于领导者的算法）配合使用，以帮助它就提议的一组交易及其执行达成共识。这样的一组交易是一个区块。与其他区块链系统不同，区块除了作为一批交易之外没有其他意义 - 每个交易都由其在账本中的位置标识，这也称为其“版本”。每个共识参与者都构建如下的块树：

```
                   ┌-- C
          ┌-- B <--┤
          |        └-- D
<--- A <--┤                            (A is the last committed block)
          |        ┌-- F <--- G
          └-- E <--┤
                   └-- H

          ↓  After committing block E

                 ┌-- F <--- G
<--- A <--- E <--┤                     (E is the last committed block)
                 └-- H
```

A block is a list of transactions that should be applied in the given order once
the block is committed. Each path from the last committed block to an
uncommitted block forms a valid chain. Regardless of the commit rule of the
consensus algorithm, there are two possible operations on this tree:

1. Adding a block to the tree using a given parent and extending a specific
   chain (for example, extending block `F` with the block `G`). When we extend a
   chain with a new block, the block should include the correct execution
   results of the transactions in the block as if all its ancestors have been
   committed in the same order. However, all the uncommitted blocks and their
   execution results are held in some temporary location and are not visible to
   external clients.
2. Committing a block. As consensus collects more and more votes on blocks, it
   decides to commit a block and all its ancestors according to some specific
   rules. Then we save all these blocks to permanent storage and also discard
   all the conflicting blocks at the same time.

Therefore, the execution component provides two primary APIs - `execute_block`
and `commit_block` - to support the above operations.


区块是提交区块后应以给定顺序执行的事务列表。从最后一个提交的块到未提交的块的每条路径形成一个有效链。无论共识算法的提交规则如何，此树上都有两种可能的操作：

1. 使用给定的父级将一个块添加到树中并扩展特定链（例如，用块`G`扩展块`F`）。当我们用新的块扩展链时，该块中应包括事务的正确执行结果，就好像其所有祖先都以相同顺序提交一样。但是，所有未提交的块及其执行结果都保存在某个临时位置，并且对于外部客户端不可见。
2. 提交一个块。随着共识在区块上获得越来越多的选票，它决定根据某些特定规则来提交区块及其所有祖先。然后，我们将所有这些块保存到永久存储中，并同时丢弃所有冲突的块。

因此，执行组件提供了两个主要的API - `execute_block`和`commit_block` - 以支持上述操作。


## 实现细节（Implementation Details）

The state at each version is represented as a sparse Merkle tree in storage.
When a transaction modifies an account, the account and the siblings from the
root of the Merkle tree to the account are loaded into memory. For example, if
we execute a transaction T<sub>i</sub> on top of the committed state and the
transaction modified account `A`, we will end up having the following tree:

每个版本的状态都表示为存储中的稀疏Merkle树。当交易修改帐户时，该帐户和从Merkle树根到该帐户路径上的同级项将被加载到内存中。 例如，如果我们在帐户`A`已提交状态的基础上执行交易T<sub>i</sub>，则将得到以下树：

```
             S_i
            /   \
           o     y
          / \
         x   A
```

In the tree shown above, `A` has the new state of the account, and `y` and `x`
are the siblings on the path from the root of the tree to `A`. If the next
transaction T<sub>i+1</sub> modified another account `B` that lives in the
subtree at `y`, a new tree will be constructed, and the structure will look
like the following:

在上面显示的树中，`A`具有帐户的新状态，`y`和`x`是从树的根到`A`的路径上的同级节点。如果下一个交易T<sub>i+1</sub>修改了另一个子帐户`B`，该子帐户位于`y`子树中，则将构造一棵新树，其结构如下所示：


```
                S_i      S_{i+1}
               /   \    /       \
              /     y  /         \
             / _______/           \
            //                     \
           o                        y'
          / \                      / \
         x   A                    z   B
```

Using this structure, we are able to query the global state, taking into account
the output of uncommitted transactions. For example, if we want to execute
another transaction T<sub>i+1</sub><sup>'</sup>, we can use the tree
S<sub>i</sub>. If we look for account A, we can find its new value in the tree.
Otherwise, we know the account does not exist in the tree, and we can fall back on
storage. As another example, if we want to execute transaction T<sub>i+2</sub>,
we can use the tree S<sub>i+1</sub> that has updated values for both account `A`
and `B`.

使用这种结构，我们可以查询全局状态，同时考虑未提交事务的输出。例如，如果我们要执行另一个事务T<sub>i+1</sub><sup>'</sup>，则可以使用树S<sub>i</sub>。 如果我们查找帐户A，则可以在树中找到其新值。否则，我们知道该帐户在树中不存在，我们可以转而使用存储。再举一个例子，如果我们想执行事务T<sub>i+2</sub>，我们可以使用树S<sub>i+1</sub>，该树已经更新了两个帐户`A`和`B`的值。


## 模块的代码组织（How is this component organized?）
```
    execution
            └── execution_client   # A Rust wrapper on top of GRPC clients.
            └── execution_proto    # All interfaces provided by the execution component.
            └── execution_service  # Execution component as a GRPC service.
            └── execution_tests    # Tests for the execution service.
            └── executor           # The main implementation of execution component.
```
