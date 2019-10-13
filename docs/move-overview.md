---
id: move-overview
title: Move入门
---

Move是一种新的编程语言，为Libra区块链提供了一个安全和可编程的基础。Libra区块链中的帐户是一个容器，其可以包含任意数量的Move资源和Move模块。提交到Libra区块链的每个交易都使用在Move中编写的交易脚本对其逻辑进行编码。交易脚本可以调用模块声明的过程来更新区块链的全局状态。

在本指南的第一部分中，我们将对move语言的主要功能进行概要介绍：

1. [Move交易脚本使交易可编程](#move-transaction-scripts-enable-programmable-transactions)
2. [Move模块允许组合智能合约](#move-modules-allow-composable-smart-contracts)
3. [Move拥有头等资源](#move-has-first-class-resources)

对于好奇的读者来说，[Move技术论文](move-paper.md)包含了关于语言的更多细节。在本指南的第二部分中，我们将“内部揭秘”并向您展示如何使用[Move中间表示码](#move-intermediate-representation)编写自己的Move程序。在最初的测试网络版本中不支持自定义Move程序，但这些功能可供您在本地试用。

## Move的关键特性

### Move交易脚本使交易可编程

* Each Libra transaction includes a **Move transaction script** that encodes the logic a validator should perform on the client's behalf (for example, to move Libra from Alice's account to Bob's account). 
* The transaction script interacts with [Move resources](#move-has-first-class-resources) published in the global storage of the Libra Blockchain by calling the procedures of one or more [Move modules](#move-modules-allow-composable-smart-contracts). 
* A transaction script is not stored in the global state, and it cannot be invoked by other transaction scripts. It is a single-use program.
* We present several examples of transaction scripts in [Writing Transaction Scripts](#writing-transaction-scripts).

* 每个Libra交易包括一个**Move交易脚本**，它编码一个验证器应该在客户端上执行的逻辑（例如，将Libra从Alice的帐户转移到Bob的帐户）。
* 交易脚本通过调用一个或多个[Move模块](#move-modules-allow-composable-smart-contracts)的过程与Libra区块链的全局存储中发布的[Move资源](#move-has-first-class-resources)交互。
* 交易脚本未存储在全局状态中，其他交易脚本无法调用它。这是一个一次性程序。
* 我们在[编写交易脚本](#writing-transaction-scripts)中介绍了几个交易脚本的例子。

### Move模块允许实现可组合的智能合约

Move modules define the rules for updating the global state of the Libra Blockchain. Modules fill the same niche as smart contracts in other blockchain systems. Modules declare [resource](#move-has-first-class-resources) types that can be published under user accounts. Each account in the Libra Blockchain is a container for an arbitrary number of resources and modules.

* A module declares both struct types (including resources, which are a special kind of struct) and procedures.
* The procedures of a Move module define the rules for creating, accessing, and destroying the types it declares.
* Modules are reusable. A struct type declared in one module can use struct types declared in another module, and a procedure declared in one module can invoke public procedures declared in another module. A module can invoke procedures declared in other Move modules. Transaction scripts can invoke any public procedure of a published module.
* Eventually, Libra users will be able to publish modules under their own accounts.

Move模块定义更新Libra区块链全局状态的规则。模块与其他区块链系统中的智能合约填补了相同的利基。模块声明可以在用户帐户下发布的[资源]（移动具有一级资源）类型。Libra区块链中的每个帐户都是任意数量资源和模块的容器。

* 模块声明结构类型（包括资源，这是一种特殊的结构）和过程。
* Move模块的过程定义了创建、访问和销毁其声明的类型的规则。
* 模块是可重用的。在一个模块中声明的结构类型可以使用在另一个模块中声明的结构类型，而在一个模块中声明的过程可以调用在另一个模块中声明的公共过程。模块可以调用在其他移动模块中声明的过程。事务脚本可以调用已发布模块的任何公共过程。
* 最终，Libra用户将能够在自己的帐户下发布模块。

### Move的资源是一级类型

* Move的关键特性是能够定义自定义资源类型。资源类型用于编码具有丰富可编程特性的安全数字资产。
* 资源是语言中的常见值，它们可以存储为数据结构，作为参数传递给过程，从过程返回，等等。
* Move的类型系统为资源提供了特殊的安全保障。Move资源永远不能复制、重用或丢弃。资源类型只能由定义该类型的模块创建或销毁。这些保证是通过[Move虚拟机](reference/glossary.md#move-virtual-machine-mvm)静态执行字节码验证器来实现的，Move虚拟机将拒绝运行未通过字节码验证器验证的程序代码。
* Libra币是作为名为`LibraCoin.T`的资源类型实现的。`LibraCoin.T`在语言中没有特殊的地位；每个Move资源都享有相同的保护。


## Move揭秘

### Move中间表示

This section describes how to write [transaction scripts](#writing-transaction-scripts) and [modules](#writing-modules) in the Move intermediate representation (IR). We caution the reader that the IR is an early (and unstable) precursor to a forthcoming Move source language (see [Future Developer Experience](#future-developer-experience) for more details). Move IR is a thin syntactic layer over Move bytecode that is used to test the bytecode verifier and virtual machine, and it is not particularly developer-friendly. It is high level enough to write human-readable code, yet low level enough to compile directly to Move bytecode. Nevertheless, we are excited about the Move language and hope that developers will give the IR a try, despite the rough edges. 

We will proceed by presenting snippets of heavily-commented Move IR. We encourage readers to follow along with the examples by compiling, running, and modifying them locally. The README files `libra/language/README.md` and `libra/language/compiler/README.md` explain how to do this.

本节描述如何使用Move中间表示（IR）中编写[交易脚本](#writing-transaction-scripts)和[模块](#writing-modules)。我们警告读者，IR是即将到来的移动源语言的早期（且不稳定）先驱（参见[未来开发者体验]（“未来开发者体验”）以获得更多细节）。move-ir是move字节码之上的一个很薄的语法层，用于测试字节码验证程序和虚拟机，它对开发人员不是特别友好。它是高水平的，足以编写人类可读代码，但低水平足以直接编译来移动字节码。尽管如此，我们仍然对move语言感到兴奋，并希望开发人员能够尝试一下ir，尽管它有一些粗糙的边缘。

我们将通过展示大量评论Move IR片段。我们鼓励读者通过在本地编译、运行和修改示例来遵循这些示例。自述文件`libra/language/README.md`和`libra/language/compiler/README.md`解释了如何执行此操作。

### 编写交易脚本（Writing Transaction Scripts）

As we explained in [Move Transaction Scripts Enable Programmable Transactions](#move-transaction-scripts-enable-programmable-transactions), users write transaction scripts to request updates to the global storage of the Libra Blockchain. There are two important building blocks that will appear in almost any transaction script: the `LibraAccount.T` and `LibraCoin.T` resource types. `LibraAccount` is the name of the module, and `T` is the name of a resource declared by that module. This is a common naming convention in Move; the “main” type declared by a module is typically named `T`. 

When we say that a user "has an account at address `0xff` on the Libra Blockchain", what we mean is that the address `0xff` holds an instance of the `LibraAccount.T` resource. Every nonempty address has a `LibraAccount.T` resource. This resource stores account data, such as the sequence number, authentication key, and balance. Any part of the Libra system that wants to interact with an account must do so by reading data from the `LibraAccount.T` resource or invoking procedures of the `LibraAccount` module.

The account balance is a resource of type `LibraCoin.T`. As we explained in [Move Has First Class Resources](#move-has-first-class-resources), this is the type of a Libra coin. This type is a "first-class citizen" in the language just like any other Move resource. Resources of type `LibraCoin.T` can be stored in program variables, passed between procedures, and so on.

We encourage the interested reader to examine the Move IR definitions of these two key resources in the `LibraAccount` and `LibraCoin` modules under the `libra/language/stdlib/modules/` directory.

Now let us see how a programmer can interact with these modules and resources in a transaction script.

正如我们在[Move交易脚本使交易可编程](#move-transaction-scripts-enable-programmable-transactions)中所解释的，用户编写交易脚本以请求对Libra区块链的全局存储进行更新。在几乎所有的交易脚本中都有两个重要的构建块：`LibraAccount.T`和`LibraCoin.T`资源类型。`LibraAccount`是模块的名称，`T`是由该模块声明的资源的名称。这是Move中常用的命名约定；由模块声明的“主”类型通常称为‘t’。

当我们说用户“在Libra区块链上的地址'0xff'有一个帐户”时，我们的意思是地址'0xff'拥有一个`LibraCoin.T`资源的实例。每个非空地址都有一个“libraaccount.t”资源。该资源存储帐户数据，例如序列号、认证密钥和余额。与帐户交互的天秤系统的任何一个部分都必须通过从“天秤帐号”资源读取数据或调用“库帐户”模块的过程来完成。

帐户余额是`LibraCoin.T`类型的资源。正如我们在[移动拥有一等资源](#move-has-first-class-resources)中所解释的，这是Libra币的类型。这种类型的人在语言上是“一等公民”，就像其他的移动资源一样。类型`LibraCoin.T`的资源可以存储在程序变量中，在程序之间传递，等等。

我们鼓励感兴趣的读者在目录`libra/language/stdlib/modules/`下，研究`LibraAccount`和`LibraCoin`模块中的这两个关键资源的Move IR定义。

现在让我们看看程序员如何在事务脚本中与这些模块和资源交互。

----------------

正如我们在[Move交易脚本让交易可编程](#move-transaction-scripts-enable-programmable-transactions)中所解释的那样，用户编写交易脚本以请求更新Libra区块链的全局存储。几乎所有交易脚本中都会出现两个重要的构建基块：LibraAccount.T和LibraCoin.T资源类型。`LibraAccount`是模块的名称，而“T”是该模块声明的资源的名称。这是Move中的通用命名约定。模块声明的“主要”类型通常称为“T”。

当我们说用户“在Libra区块链上的地址`0xff`上有一个帐户”时，我们的意思是地址'0xff`拥有`LibraAccount.T`资源的实例。每个非空地址都有一个`LibraAccount.T`资源。此资源存储帐户数据，例如序列号，身份验证密钥和余额。要与帐户进行交互的Libra系统的任何部分都必须通过从`LibraAccount.T`资源中读取数据或调用LibraAccount模块的过程来进行此操作。

帐户余额是类型为`LibraCoin.T`的资源。正如我们在[移动具有一流资源](#move-has-first-class-resources)中所解释的那样，这是天秤座硬币的类型。与任何其他Move资源一样，此类型在语言上是“一流公民”。可以将LibraCoin.T类型的资源存储在程序变量中，并在过程之间传递等等。

我们鼓励感兴趣的读者在`libra/language/stdlib/modules/`目录下的`LibraAccount`和`LibraCoin`模块中检查这两个关键资源的移动IR定义。

现在让我们看看程序员如何在事务脚本中与这些模块和资源进行交互。

```move
// Simple peer-peer payment example.

// Use LibraAccount module published on the blockchain at account address
// 0x0...0 (with 64 zeroes). 0x0 is shorthand that the IR pads out to
// 256 bits (64 digits) by adding leading zeroes.
import 0x0.LibraAccount;
import 0x0.LibraCoin;
main(payee: address, amount: u64) {
  // The bytecode (and consequently, the IR) has typed locals.  The scope of
  // each local is the entire procedure. All local variable declarations must
  // be at the beginning of the procedure. Declaration and initialization of
  // variables are separate operations, but the bytecode verifier will prevent
  // any attempt to use an uninitialized variable.
  let coin: LibraCoin.T;
  
  // Acquire a LibraCoin.T resource with value `amount` from the sender's
  // account.  This will fail if the sender's balance is less than `amount`.
  coin = LibraAccount.withdraw_from_sender(move(amount));
  // Move the LibraCoin.T resource into the account of `payee`. If there is no
  // account at the address `payee`, this step will fail
  LibraAccount.deposit(move(payee), move(coin));

  // Every procedure must end in a `return`. The IR compiler is very literal:
  // it directly translates the source it is given. It will not do fancy
  // things like inserting missing `return`s.
  return;
}
```

This transaction script has an unfortunate problem &mdash; it will fail if there is no account under the address `payee`. We will fix this problem by modifying the script to create an account for the `payee` if one does not already exist.

此事务脚本有一个不幸的问题 &mdash; 如果地址`payee`下没有帐户，它将失败。我们将通过修改脚本来解决这个问题，以创建一个`payee`的帐户，如果其还不存在。

```move
// A small variant of the peer-peer payment example that creates a fresh
// account if one does not already exist.

import 0x0.LibraAccount;
import 0x0.LibraCoin;
main(payee: address, amount: u64) {
  let coin: LibraCoin.T;
  let account_exists: bool;

  // Acquire a LibraCoin.T resource with value `amount` from the sender's
  // account.  This will fail if the sender's balance is less than `amount`.
  coin = LibraAccount.withdraw_from_sender(move(amount));

  account_exists = LibraAccount.exists(copy(payee));

  if (!move(account_exists)) {
    // Creates a fresh account at the address `payee` by publishing a
    // LibraAccount.T resource under this address. If theres is already a
    // LibraAccount.T resource under the address, this will fail.
    create_account(copy(payee));
  }

  LibraAccount.deposit(move(payee), move(coin));
  return;
}
```

让我们看一个更复杂的例子。在本例中，我们将使用事务脚本向多个收件人付款，而不是仅向一个收件人付款。

```move
// Multiple payee example. This is written in a slightly verbose way to
// emphasize the ability to split a `LibraCoin.T` resource. The more concise
// way would be to use multiple calls to `LibraAccount.withdraw_from_sender`.

import 0x0.LibraAccount;
import 0x0.LibraCoin;
main(payee1: address, amount1: u64, payee2: address, amount2: u64) {
  let coin1: LibraCoin.T;
  let coin2: LibraCoin.T;
  let total: u64;

  total = move(amount1) + copy(amount2);
  coin1 = LibraAccount.withdraw_from_sender(move(total));
  // This mutates `coin1`, which now has value `amount1`.
  // `coin2` has value `amount2`.
  coin2 = LibraCoin.withdraw(&mut coin1, move(amount2));

  // Perform the payments
  LibraAccount.deposit(move(payee1), move(coin1));
  LibraAccount.deposit(move(payee2), move(coin2));
  return;
}
```

This concludes our "tour" of transaction scripts. For more examples, including the transaction scripts supported in the initial testnet, refer to `libra/language/stdlib/transaction_scripts`.

我们的事务脚本之旅到此结束。对于更多的示例，包括在初始测试网络中支持的事务脚本，请查看`libra/language/stdlib/transaction_scripts`。

### 编写模块（Writing Modules）

We will now turn our attention to writing our own Move modules instead of just reusing the existing `LibraAccount` and `LibraCoin` modules. Consider this situation:
Bob is going to create an account at address *a* at some point in the future. Alice wants to "earmark" some funds for Bob so that he can pull them into his account once it is created. But she also wants to be able to reclaim the funds for herself if Bob never creates the account.

To solve this problem for Alice, we will write a module `EarmarkedLibraCoin` which:
* Declares a new resource type `EarmarkedLibraCoin.T` that wraps a Libra coin and recipient address.
* Allows Alice to create such a type and publish it under her account (the `create` procedure).
* Allows Bob to claim the resource (the `claim_for_recipient` procedure).
* Allows anyone with an `EarmarkedLibraCoin.T` to destroy it and acquire the underlying coin (the `unwrap` procedure).

现在，我们将注意力转向编写自己的Move模块，而不是仅重用现有的`LibraAccount`和`LibraCoin`模块。考虑这种情况：Bob将来会在地址*a*上创建一个帐户。Alice想为Bob“专款”一些资金，以便他一旦创建就可以将其存入他的帐户。但是，如果Bob从未创建该帐户，她还希望能够自己收回资金。

为了解决爱丽丝的这个问题，我们将编写模块`EarmarkedLibraCoin`，该模块：
* 声明一个新的资源类型`EarmarkedLibraCoin.T`，其中包装了一个天秤座硬币和收件人地址。
* 允许Alice创建这样的类型并将其发布到她的帐户下（`create`过程）。
* 允许Bob声明资源（`claim_for_recipient`过程）。
* 允许拥有`EarmarkedLibraCoin.T`的任何人销毁它并获得基础硬币（`unwrap`程序）。

```move
// A module for earmarking a coin for a specific recipient
module EarmarkedLibraCoin {
  import 0x0.LibraCoin;

  // A wrapper containing a Libra coin and the address of the recipient the
  // coin is earmarked for.
  resource T {
    coin: LibraCoin.T,
    recipient: address
  }

  // Create a new earmarked coin with the given `recipient`.
  // Publish the coin under the transaction sender's account address.
  public create(coin: LibraCoin.T, recipient: address) {
    let t: Self.T;

    // Construct or "pack" a new resource of type T. Only procedures of the
    // `EarmarkedLibraCoin` module can create an `EarmarkedLibraCoin.T`.
    t = T {
      coin: move(coin),
      recipient: move(recipient),
    };

    // Publish the earmarked coin under the transaction sender's account
    // address. Each account can contain at most one resource of a given type;
    // this call will fail if the sender already has a resource of this type.
    move_to_sender<T>(move(t));
    return;
  }

  // Allow the transaction sender to claim a coin that was earmarked for her.
  public claim_for_recipient(earmarked_coin_address: address): Self.T acquires T {
    let t: Self.T;
    let t_ref: &Self.T;
    let sender: address;

    // Remove the earmarked coin resource published under `earmarked_coin_address`.
    // If there is no resource of type T published under the address, this will fail.
    t = move_from<T>(move(earmarked_coin_address));

    t_ref = &t;
    // This is a builtin that returns the address of the transaction sender.
    sender = get_txn_sender();
    // Ensure that the transaction sender is the recipient. If this assertion
    // fails, the transaction will fail and none of its effects (e.g.,
    // removing the earmarked coin) will be committed.  99 is an error code
    // that will be emitted in the transaction output if the assertion fails.
    assert(*(&move(t_ref).recipient) == move(sender), 99);

    return move(t);
  }

  // Allow the creator of the earmarked coin to reclaim it.
  public claim_for_creator(): Self.T acquires T {
    let t: Self.T;
    let sender: address;

    sender = get_txn_sender();
    // This will fail if no resource of type T under the sender's address.
    t = move_from<T>(move(sender));
    return move(t);
  }

  // Extract the Libra coin from its wrapper and return it to the caller.
  public unwrap(t: Self.T): LibraCoin.T {
    let coin: LibraCoin.T;
    let recipient: address;

    // This "unpacks" a resource type by destroying the outer resource, but
    // returning its contents. Only the module that declares a resource type
    // can unpack it.
    T { coin, recipient } = move(t);
    return move(coin);
  }

}
```

Alice can create an earmarked coin for Bob by creating a transaction script that invokes `create` on Bob's address *a* and a `LibraCoin.T` that she owns. Once *a* has been created, Bob can claim the coin by sending a transaction from *a*. This invokes `claim_for_recipient`, passes the result to `unwrap`, and stores the returned `LibraCoin` wherever he wishes. If Bob takes too long to create an account under *a* and Alice wants to reclaim her funds, she can do so by using `claim_for_creator` followed by `unwrap`.

The observant reader may have noticed that the code in this module is agnostic to the internal structure of `LibraCoin.T`. It could just as easily be written using generic programming (e.g., `resource T<AnyResource: R> { coin: AnyResource, ... }`). We are currently working on adding support for exactly this sort of parametric polymorphism to Move.

Alice可以通过创建一个交易脚本为Bob创建专用硬币，该交易脚本会在Bob的地址*a*和她拥有的`LibraCoin.T`上调用`create`。创建*a*后，Bob可以通过从*a*发送交易来要求硬币。这将调用`claim_for_recipient`，将结果传递给`unwrap`，并将返回的`LibraCoin`存储在他希望的任何地方。如果Bob花费太长时间在*a*下创建帐户，而Alice想要收回她的资金，则可以通过使用`claim_for_creator`然后再使用`unwrap`来收回。

细心的读者可能已经注意到，该模块中的代码与`LibraCoin.T`的内部结构无关。它可以使用通用编程轻松编写（例如，`resource T <AnyResource：R> {coin：AnyResource，...}`）。我们目前正在努力为Move添加对此类参量多态性的支持。

### 未来开发者体验（Future Developer Experience）

In the near future, the IR will stabilize, and compiling and verifying programs will become more user-friendly. Additionally, location information from the IR source will be tracked and passed to the verifier to make error messages easier to debug. However, the IR will continue to remain a tool for testing Move bytecode. It is meant to be a semantically transparent representation of the underlying bytecode. To allow effective tests, the IR compiler must produce bad code that will be rejected by the bytecode verifier or fail at runtime in the compiler. A user-friendly source language would make different choices; it should refuse to compile code that will fail at a subsequent step in the pipeline.

In the future, we will have a higher-level Move source language. This source language will be designed to express common Move idioms and programming patterns safely and easily. Since Move bytecode is a new language and the Libra Blockchain is a new programming environment, our understanding of the idioms and patterns we should support is still evolving. The source language is in the early stages of development, and we do not have a timetable for its release yet.

在不久的将来，IR将稳定，编译和验证程序将变得更加友好。此外，来自IR源的位置信息将被跟踪并传递给验证器，以使错误消息更易于调试。然而，IR将继续作为测试move字节码的工具。它意味着底层字节码的语义透明表示。为了允许有效的测试，IR编译器必须产生由字节码验证器拒绝的错误代码或编译器中运行时失败的代码。用户友好的源语言会做出不同的选择；它应该拒绝编译在流水线的后续步骤中失败的代码。

在未来，我们将有一个更高级的Move源语言。该源语言将被设计成更安全和更容易地表达常见的Move习惯用法和编程模式。由于Move字节码是一种新的语言，而Libra区块链是一种新的编程环境，我们对应该支持的习惯用法和编程模式的理解仍在不断发展。源语言处于开发的早期阶段，我们还没有它的发布时间表。
