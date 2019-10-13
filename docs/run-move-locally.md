---
id: run-move-locally
title: 在本机运行Move程序
---
<blockquote class="block_note">

**注意：**当前，您只能在本地网络上运行自定义Move模块和脚本，而不能在Libra测试网上运行。

</blockquote>

This tutorial guides you through publishing a Move module and executing a Move transaction script on a local blockchain. To perform operations that are not natively supported by the existing Move transaction scripts, you can create and publish Move modules and write scripts to use these modules. For basic information on Move, refer to [Getting Started with Move](move-overview.md). For deeper technical understanding of Move, refer to the [technical paper](move-paper.md). For guidance on running a local network of nodes, refer to [Run a Local Network](run-local-network.md). The Libra CLI client provides the `dev` command to compile, publish, and execute Move programs locally. Refer to the [CLI Guide - dev command](reference/libra-cli#dev-d-mdash-operations-related-to-move-transaction-scripts-and-modules) for command usage. To see the list of subcommands,  enter `dev` on the CLI.

本教程将指导您发布本地模块上的Move模块并执行Move事务脚本。要执行现有Move事务脚本本身不支持的操作，可以创建和发布Move模块并编写脚本以使用这些模块。有关Move的基本信息，请参阅[Move入门](move-overview.md)。要获得对Move的更深入的技术了解，请参阅[技术论文](move-paper.md)。有关运行节点的本地网络的指导，请参阅[运行本地网络](run-local-network.md)。Libra CLI客户端提供`dev`命令来在本地编译，发布和执行Move程序。有关命令的用法，请参考[CLI指南-dev命令](reference/libra-cli#dev-d-mdash-operations-related-to-move-transaction-scripts-and-modules)。要查看子命令列表，请在CLI上输入`dev`。

To create, compile, and publish Move modules to an account on the local blockchain, follow the instructions in [compile and publish Move modules](#compile-and-publish-move-modules). To compile and execute a Move transaction script, follow the instructions in [compile and execute transaction scripts](#compile-and-execute-transaction-scripts).

要将Move模块创建，编译和发布到本地区块链上的帐户，请遵循[编译与发布Move模块](#compile-and-publish-move-modules)中的说明。要编译和执行Move事务脚本，请遵循[编译和执行事务脚本](#compile-and-execute-transaction-scripts)中的说明。

## 编译与发布Move模块（Compile and Publish Move Modules）

### 创建Move模块（Create Move Module）

Let’s start with an extremely simple module called `MyModule`. This module has a single procedure called `id`, which is an identity function for coins. It takes a `LibraCoin.T` resource as input and hands it back to the calling program. The Move Intermediate Representation (IR) code for this module is provided below, save it in a file named `my_module.mvir.`

让我们从一个名为`MyModule`的极其简单的模块开始。这个模块有一个称为`id`的过程，它是硬币的身份函数。它需要一个`LibraCoin.T`资源作为输入，并将其交给调用程序。下面提供了此模块的移动中间表示（IR）代码，并将其保存在名为`my_module.mvir`的文件中。

```
module MyModule {
  import 0x0.LibraCoin;

  // The identity function for coins: takes a LibraCoin.T as input and hands it back
  public id(c: LibraCoin.T): LibraCoin.T {
    return move(c);
  }
}
```

### Start a Local Network of Validator Nodes

To run a local network with one validator node and create a local blockchain, change to the `libra` directory and run `libra_swarm`, as shown below:

要使用一个验证器节点运行本地网络并创建本地区块链，请转到`libra`目录并运行`libra_swarm`，如下所示：

```
$ cd libra
$ cargo run -p libra_swarm -- -s
```

This command will take some time to run and it will perform the following actions:

* Spawn a local network with one validator node on your computer.
* Generate genesis transaction, mint key, and bootstrap configuration of the node.
* Start an instance of the Libra CLI client; the client is connected to the local network.

Upon successful execution of the command, you'll see the CLI client menu and the `libra%` prompt as shown below:

该命令将需要一些时间才能运行，并且将执行以下操作：

* 在计算机上使用一个验证程序节点生成一个本地网络。
* 生成节点的创世交易，明细密钥和引导程序配置。
* 启动Libra CLI客户端的实例；客户端已连接到本地网络。

成功执行命令后，您将看到CLI客户端菜单和`libra％`提示，如下所示：

```
usage: <command> <args>

Use the following commands:

account | a
Account operations
query | q
Query operations
transfer | transferb | t | tb
<sender_account_address>|<sender_account_ref_id> <receiver_account_address>|<receiver_account_ref_id> <number_of_coins> [gas_unit_price_in_micro_libras (default=0)] [max_gas_amount_in_micro_libras (default 100000)] Suffix 'b' is for blocking.
Transfer coins (in libra) from account to another.
dev
Local Move development
help | h
Prints this help
quit | q!
Exit this client


Please, input commands:

libra%
```

For detailed instructions on working with a local cluster of validator nodes, refer to [Run a Local Network](run-local-network.md).

有关使用验证器节点的本地群集的详细说明，请参阅[运行本地网络](run-local-network.md)。

### 创建账户（Create an Account）

Each Move module and resource type is hosted by a specific account address. For example, `LibraCoin` module is hosted by the account at address `0x0`. To import the `LibraCoin` module in other modules or transaction scripts, you would use `import 0x0.LibraCoin`.

To host `MyModule`, create an account:

每个Move模块和资源类型都由特定的帐户地址托管。例如，`LibraCoin`模块由帐户托管在地址`0x0`。要在其他模块或事务脚本中导入`LibraCoin`模块，可以使用`import 0x0.LibraCoin`。

要托管`MyModule`，请创建一个帐户：

```
libra% account create
>> Creating/retrieving next account from wallet
Created/retrieved account #0 address 810abcc08dbed34ea15d7eb261b8001da6a62d72acdbf87714dd243a175f9b62

```

In the above output, 0 is the index of the account you just created, and the hex string is the address of that account. The index is just a convenient way to refer to this account locally, and it's also called `ref_id`. For more information on account creation, refer to [My First Transaction](my-first-transaction.md).

在上面的输出中，0是您刚创建的帐户的索引，十六进制字符串是该帐户的地址。索引只是在本地引用此帐户的便捷方式，也称为`ref_id`。 有关创建帐户的更多信息，请参阅[我的第一笔交易](my-first-transaction.md)。

The `create` command generates a local keypair. To create the account on the local blockchain, you'll need to mint money into the account, as shown below:

`create`命令将生成一个本地密钥对。要在本地区块链上创建帐户，您需要向该帐户注入资金，如下所示：

```
libra% account mintb 0 76
>> Minting coins
waiting ....transaction is stored!
Finished minting!
```
To check whether the account was successfully created on the local blockchain, query the account balance. Note that the account balance you see in the output is in libra.

```
libra% query balance 0
Balance is: 76.000000
```

### 编译Move模块（Compile Move Module）

To compile `my_module.mvir`, use the [dev compile](reference/libra-cli#dev-d-mdash-operations-related-to-move-transaction-scripts-and-modules) command.

要编译`my_module.mvir`，请使用[dev compile](reference/libra-cli#dev-d-mdash-operations-related-to-move-transaction-scripts-and-modules)命令。

```
libra% dev compile 0 <path to my_module.mvir> module
```
* 0 &mdash; Index/ref_id of the account that the module will be published under.
* `module` &mdash; Indicates that you are compiling a Move module. If you were compiling a transaction script, you would use `script` instead.

Move IR gets fed into the IR compiler in a `.mvir` file and the compiler outputs the corresponding bytecode file. When you are ready to publish this module into an account on the blockchain,  use this bytecode file and not the `.mvir` file.

After the module is successfully compiled, you'll see the following message in the output, it contains the path to the bytecode file produced by compiling `my_module.mvir`.

```
Successfully compiled a program at /var/folders/tq/8gxrrmhx16376zxd5r4h9hhn_x1zq3/T/.tmpigAZCx
```

If you would like to save the bytecode file in a specific path, instead of a temporary path, you can specify it as an argument to the [dev compile](reference/libra-cli#dev-d-mdash-operations-related-to-move-transaction-scripts-and-modules) command.

如果您想将字节码文件保存在特定路径而不是临时路径中，可以将其指定为[dev compile](reference/libra-cli#dev-d-mdash-operations-related-to-move-transaction-scripts-and-modules)命令。

### 发布编译的模块（Publish Compiled Module）

To publish the module bytecode on your local blockchain, run the [dev publish](reference/libra-cli#dev-d-mdash-operations-related-to-move-transaction-scripts-and-modules) command and use the path to the compiled module bytecode file as shown below:

要在本地区块链上发布模块字节码，请运行[dev publish](reference/libra-cli#dev-d-mdash-operations-related-to-move-transaction-scripts-and-modules)命令并使用路径 到已编译的模块字节码文件，如下所示：

```
libra% dev publish 0 /var/folders/tq/8gxrrmhx16376zxd5r4h9hhn_x1zq3/T/.tmpigAZCx

waiting .....transaction is stored!
no events emitted.
Successfully published module
```
Upon successful execution of the `dev publish` command, the bytecode for `MyModule` is published under the sender’s account. To use the procedures and types declared in `MyModule`, other transaction scripts and modules can import it using `import <sender_address>.MyModule`.

 Subsequent modules published under `<sender_address>` must not be named `MyModule`. Each account may hold at most one module with a given name. Attempting to publish a second module named `MyModule` under `<sender_address>` will result in a failed transaction.


成功执行`dev publish`命令后，`MyModule`的字节码将在发送者的帐户下发布。要使用在`MyModule`中声明的过程和类型，其他事务脚本和模块可以使用`import <sender_address>.MyModule`将其导入。

在`<sender_address>`下发布的后续模块不得命名为`MyModule`。每个帐户最多可以拥有一个给定名称的模块。尝试在`<sender_address>`下发布名为`MyModule`的第二个模块将导致交易失败。

## 编译并执行交易脚本（Compile and Execute Transaction Scripts）

### 创建交易脚本（Create Transaction Script）

<blockquote class="block_note">

**注意：**您可以在[libra/language/stdlib/transaction_scripts](https://github.com/deltanet-lab/libra-website-cn/tree/master/language/stdlib/transaction_scripts)目录发现大量交易脚本示例。
</blockquote>

Now let’s write the following script to use `MyModule` and save it as `custom_script.mvir`:

现在，让我们编写以下脚本来使用`MyModule`并将其另存为`custom_script.mvir`：

```
import 0x0.LibraAccount;
import 0x0.LibraCoin;
import {{sender}}.MyModule;

main(amount: u64) {
  let coin: LibraCoin.T;
  coin = LibraAccount.withdraw_from_sender(move(amount));
  //calls the id procedure defined in our custom module
  LibraAccount.deposit(get_txn_sender(), MyModule.id(move(coin)));
  return;
}
```

In this script, `{{sender}}`will be automatically replaced with sender account address when the script is executed. Alternatively, you could write an import with a fully qualified address:

在此脚本中，执行脚本时，将自动用发件人帐户地址替换`{{sender}}`。或者，您可以编写具有完全限定地址的导入：

```
 import 0x810abcc08dbed34ea15d7eb261b8001da6a62d72acdbf87714dd243a175f9b62.MyModule;
```

### 编译交易脚本（Compile Transaction Script）

To compile your transaction script, use the [dev compile](reference/libra-cli#dev-d-mdash-operations-related-to-move-transaction-scripts-and-modules) command.

要编译事务脚本，请使用[dev compile](reference/libra-cli#dev-d-mdash-operations-related-to-move-transaction-scripts-and-modules)命令。

```
libra% dev compile 0 <path_to_custom_script.mvir> script
```

 `custom_script.mvir` is in Move IR, and upon successful compilation of `custom_script.mvir` the compiler will  output the corresponding bytecode file. You'll use this bytecode file (not the `.mvir` file) when you execute this script. After the script is successfully compiled, you'll see the path to the bytecode file in your output:

`custom_script.mvir`位于Move IR中，并且成功编译`custom_script.mvir`后，编译器将输出相应的字节码文件。 执行此脚本时，将使用此字节码文件（而不是`.mvir`文件）。脚本成功编译后，您将在输出中看到字节码文件的路径：

```
Successfully compiled a program at /var/folders/tq/8gxrrmhx16376zxd5r4h9hhn_x1zq3/T/.tmpDZhL21
```

If you would like to save the bytecode file at a specific path, and not at a temporary path, you can specify it as an argument to the [dev compile](reference/libra-cli#dev-d-mdash-operations-related-to-move-transaction-scripts-and-modules) command.

如果要将字节码文件保存在特定路径而不是临时路径，则可以将其指定为[dev compile](reference/libra-cli#dev-d-mdash-operations-related-to-move-transaction-scripts-and-modules)命令。

### 执行交易脚本（Execute Transaction Script）

To execute your script, use the [dev execute](reference/libra-cli#dev-d-mdash-operations-related-to-move-transaction-scripts-and-modules) command on the bytecode output from [Compile Transaction Script](#compile-transaction-script) step above.

要执行脚本，请对[编译事务脚本](#compile-transaction-script)步骤中输出的字节码使用[dev execute](reference/libra-cli#dev-d-mdash-operations-related-to-move-transaction-scripts-and-modules)命令。

<blockquote class="block_note">

**注意：** 传递给`dev execute`命令的确切参数集将取决于特定脚本期望的参数。
</blockquote>

```
libra% dev execute 0 /var/folders/tq/8gxrrmhx16376zxd5r4h9hhn_x1zq3/T/.tmpDZhL21 10
waiting .....transaction is stored!
Successfully finished execution
```

* `0` &mdash; Index/ref_id of the sender account. For this example, it is the same account which compiled and published the module.
* `/var/folders/tq/8gxrrmhx16376zxd5r4h9hhn_x1zq3/T/.tmpDZhL21` &mdash; Path to the compiled_script for this example.
* `10` &mdash; Amount of microlibra. This amount must be less than or equal to the amount in the sender’s account.

## 答疑（Troubleshooting）

### 编译Move程序（Compile Move Program）

如果客户端找不到您的Move程序（模块或脚本），您将会看到此错误：

```
libra% dev compile 0 ~/my-tscripts/custom_script.mvir script
>> Compiling program
No such file or directory (os error 2)
```

如果看到以下错误，请参考[dev compile](reference/libra-cli#dev-d-mdash-operations-related-to-move-transaction-scripts-and-modules)命令的用法，指定所有 必需的参数，然后尝试再次编译。

```
Invalid number of arguments for compilation
```
For syntax related compilation errors, refer to [Move IR syntax](https://github.com/deltanet-lab/libra-website-cn/blob/master/language/compiler/ir_to_bytecode/syntax/src/lib.rs).

与语法相关的编译错误，请参阅[Move IR语法](https://github.com/deltanet-lab/libra-website-cn/blob/master/language/compiler/ir_to_bytecode/syntax/src/lib.rs)。

### 发布编译好的模块（Publish Compiled Module）

If you compile a module using one account (e.g., `dev compile` 0 ...) and try to publish it to a different account (e.g., `dev publish` 1 ...), you'll see the following error:

如果您使用一个帐户（例如，`dev compile` 0 ...）编译模块，然后尝试将其发布到其他帐户（例如，`dev publish` 1 ...），则会看到以下错误：

```
libra% dev publish 1 /var/folders/tq/8gxrrmhx16376zxd5r4h9hhn_x1zq3/T/.tmpigAZCx

Transaction failed with vm status: Validation(SendingAccountDoesNotExist("sender address: 21cd9d131bce6050218281f737186861e9dcb7b7804485742e1be8fd564137f9"))

```

A compiled module contains the address of the account where the module is to be published, and the [Move Virtual Machine (VM)](https://developers.libra.org/docs/crates/vm) only allows a transaction sender to publish a module under the sender’s own account address. If this was not true, another user could publish modules under your account! To fix this error, recompile the module using the desired sender address.

If you do not provide the correct path to your compiled module, you'll see this error:

编译后的模块包含要在其中发布该模块的帐户的地址，[Move虚拟机（VM）](https://developers.libra.org/docs/crates/vm)仅允许事务发送方执行以下操作：在发件人自己的帐户地址下发布模块。如果不是这样，其他用户可以在您的帐户下发布模块！ 要解决此错误，请使用所需的发送者地址重新编译模块。

如果您没有提供编译模块的正确路径，则会看到此错误：

```
libra% dev publish 0 incorrect-path-to-compiled-module
No such file or directory (os error 2)
```
If the account with index 1 does not exist, trying to publish the module to 1 will result in the following error:

在索引为1的帐户不存在的情况下，尝试将模块发布为1，则将导致以下错误：

```
Unable to find account by account reference id: 1, to see all existing accounts, run: 'account list'
```
Republishing/updating an existing module under the same sender account address does not have any effect on the blockchain. It’s a failed transaction, but it deducts gas from the sender account and increments the sequence number of the sender account by one. It’s possible to publish the same module at a different sender account address, provided the module was compiled using that account address.

在相同的发件人帐户地址下重新发布/更新现有模块对区块链没有任何影响。这是一笔失败的交易，但它会从发件人帐户中扣除汽油，并将发件人帐户的序列号增加一。如果该模块是使用该帐户地址编译的，则可以在其他发件人帐户地址上发布同一模块。

### 执行交易脚本（Execute Transaction Script）

If the sender account index is invalid, you'll see this error:

如果发件人帐户索引无效，则会看到此错误：

```
libra% dev execute 2 /var/folders/tq/8gxrrmhx16376zxd5r4h9hhn_x1zq3/T/.tmpDZhL21 10
Unable to find account by account reference id: 2, to see all existing accounts, run: 'account list'
```

The following error indicates that either the arguments to the transaction script are missing or one or more of the arguments are of the wrong type.

以下错误表明事务脚本的参数丢失，或者一个或多个参数的类型错误。

```
libra% dev execute 0 /var/folders/tq/8gxrrmhx16376zxd5r4h9hhn_x1zq3/T/.tmpDZhL21
Transaction failed with vm status: Verification([Script(TypeMismatch("Actual Type Mismatch"))])

```

## 参考资料（Reference）

* [Run a Local Network](run-local-network.md) &mdash; Provides information on running a local network.
* [Getting Started with Move](move-overview.md) &mdash; Introduces you to Move, a new blockchain programming language.
* [Move Technical Paper](move-paper.md).
* Move READMEs:
    * [Move Language](https://developers.libra.org/docs/crates/move-language).
    * [Move IR Compiler](https://developers.libra.org/docs/crates/ir-to-bytecode).
    * [Bytecode Verifier](https://l.facebook.com/l.php?u=https%3A%2F%2Fdevelopers.libra.org%2Fdocs%2Fcrates%2Fbytecode-verifier&h=AT22hXPt7Fjx80GBMVQ5NOZaVAvQRzD-W4QLZK3j44-Jk11H7EzR7RpTqJpaWX0FMSWFcMdhlvfSTw7TVYk15xAC2fd520s8erlICkc4F_AMTOWrMowCqqG5Qv8RLXROLXZ1MTxGMGq4L1J7czZSas5l).
    * [Virtual Machine](https://developers.libra.org/docs/crates/vm).
* [CLI Guide](reference/libra-cli.md) — Lists the commands of the Libra CLI client.
* [My First Transaction](my-first-transaction.md) &mdash; Guides you through executing your very first transaction on the Libra Blockchain using the Libra CLI client.
