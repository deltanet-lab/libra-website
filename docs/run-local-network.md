---
id: run-local-network
title: 运行本地网络
---

`libra_swarm` is used to start a local network of validator nodes and a local blockchain on your computer. Running a local network makes it easier to test and debug your code changes. To view the logs generated by your local nodes, use the instructions in [How Do I Access The Logs?](#how-do-i-access-the-logs) You can use the CLI command `dev` to compile, publish, and execute Move Intermediate Representation (IR) programs on your local cluster of nodes. Refer to [Run Move Programs Locally](run-move-locally.md) for further details.

`libra_swarm` package is located in the root directory of the `libra` repository.

`libra_swarm`用于启动验证器节点的本地网络和计算机上的本地区块链。运行本地网络可以更轻松地测试和调试代码更改。 要查看由本地节点生成的日志，请使用[如何访问日志？](#how-do-i-access-the-logs)中的说明。您可以使用CLI命令`dev`进行编译，发布，并在本地节点群集上执行Move中间表示（IR）程序。有关更多详细信息，请参考[本地运行移动程序](run-move-locally.md)。

`libra_swarm`软件包位于`libra`存储库的根目录中。

## Usage

`libra_swarm [FLAGS] [OPTIONS]`

FLAGS:
* `-l | --enable_logging` &mdash; Enables logging.
* `-h | --help` &mdash; Prints help information.
* `-s | --start_client` &mdash; Starts Libra CLI client.
* `-v | --version` &mdash; Prints version information.

OPTIONS:
* `-n | --num_nodes <num_nodes>` &mdash; Number of local nodes to start (1 is the default).
* `-c | --config_dir <config_dir>` &mdash; The directory used by `libra_swarm` to save the config files, logs, libradb, etc. for the nodes. The user can inspect the information saved in the `<config_dir>` even after `libra_swarm` exits. If this directory is unspecified, a temporary directory is used to save this information. The files in `<config_dir>` are automatically deleted when `libra_swarm` exits.

## Prerequisites

To install all the required dependencies, run the build script as described in [Clone and Build Libra Core](my-first-transaction.md#clone-and-build-libra-core).

要安装所有必需的依赖项，请按照[克隆并构建Libra Core](my-first-transaction.md#clone-and-build-libra-core)中所述运行构建脚本。

## 运行本地网络（Run a local network）

<blockquote class="block_note">

**注意:** The local network of validator nodes will not be connected to the testnet; currently, it is not possible to connect the local validator network to the testnet.

</blockquote>

To run a network with one or more validator nodes and to create a local blockchain, run `libra_swarm` with the `-n` option, as shown below. If the `-n` option is not specified, `libra_swarm` will spawn a network with one node.

The following example starts a network with 4 nodes:

要运行具有一个或多个验证器节点的网络并创建本地区块链，请使用带有-n选项的`libra_swarm`，如下所示。如果未指定-n选项，则`libra_swarm`将产生一个节点为1的网络。

以下示例启动具有4个节点的网络：

```
$ cd libra
$ cargo run -p libra_swarm -- -s -n 4
```

The `cargo run -p libra_swarm -- -s` command does the following:

* Spawns a network of validator nodes locally on your computer.
* Performs configuration management of the validator network.
* Starts an instance of the Libra CLI client; the client is connected to the local network.

`cargo run -p libra_swarm -- -s`命令执行以下操作：

* 在您的计算机上本地生成验证程序节点网络。
* 执行验证器网络的配置管理。
* 启动Libra CLI客户端的实例；客户端已连接到本地网络。

The configuration management of the validator network generates:

* A genesis transaction.
* Mint key &mdash; Key for the account that's allowed to perform the mint operation.
* Bootstrap configuration of each validator in the local network &mdash; Ports to listen to, system limits, etc.

验证器网络的配置管理生成：

* 创世交易。
* 薄荷键允许执行铸币操作的帐户的键。
* 本地网络中每个验证器的引导程序配置要监听的端口，系统限制等。

The `cargo run` command may take some time to run. If you have started `libra_swarm` using the `-s` option, upon successful execution of the command, an instance of the Libra CLI client will be running on your system. You will see the CLI client menu and the `libra%` prompt. This instance of the client is connected to the local network of nodes you just spawned. You can now enter CLI commands to interact with the local network.

`cargo run`命令可能需要一些时间才能运行。如果您已经使用`-s`选项启动了`libra_swarm`，那么在成功执行命令后，Libra CLI客户端实例将在您的系统上运行。您将看到CLI客户端菜单和`libra％`提示。客户端的该实例连接到刚生成的节点的本地网络。 现在，您可以输入CLI命令与本地网络进行交互。

## Run Libra CLI client in a Separate Process From `libra_swarm`

In the previous section, we ran `libra_swarm` using the `-s` option. This automatically starts the Libra CLI client and `libra_swarm` in the same process. If you would like to run the CLI client in a separate process from `libra_swarm`, use the following steps:

在上一节中，我们使用`-s`选项运行了`libra_swarm`。这将以相同的过程自动启动Libra CLI客户端和`libra_swarm`。如果您想在与`libra_swarm`分开的进程中运行CLI客户端，请使用以下步骤：

### Step 1: Run `libra_swarm`

Run `libra_swarm` without the `-s` option as shown below:

```
$ cd libra
$ cargo run -p libra_swarm
```
You will see the following information in the output.

您将在输出中看到以下信息。

```
 To run the Libra CLI client in a separate process and connect to the local cluster of nodes you just spawned, use this command:

 cargo run --bin client -- -a localhost -p 57149 -s "/var/folders/xd/sfg4x6713w350lq73kgfc7qxnq5swl/T/.tmpmSSKk9/trusted_peers.config.toml" -m "/var/folders/xd/sfg4x6713w350lq73kgfc7qxnq5swl/T/keypair.ATvJWTliQf0a/temp_faucet_keys"

```

### Step 2: Start an Instance of the CLI Client

To  start an instance of the CLI client and connect to the local network you spawned in step 1:

* In a new terminal window, change to the `libra` directory.
* Run the entire command you see in your output from step 1, as shown below:

要启动命令行客户端实例并连接到您在步骤1中产生的本地网络：

* 在新的终端窗口中，转到`libra`目录。
* 运行在步骤1的输出中看到的整个命令，如下所示：

```
$ cd libra
$ cargo run --bin client -- -a localhost -p 57149 -s "/var/folders/xd/sfg4x6713w350lq73kgfc7qxnq5swl/T/.tmpmSSKk9/trusted_peers.config.toml" -m "/var/folders/xd/sfg4x6713w350lq73kgfc7qxnq5swl/T/keypair.ATvJWTliQf0a/temp_faucet_keys"
```
This will spawn an instance of the CLI client in a separate process, and you will see the `libra%` prompt.

A sample output from running this command is shown below:

这将在单独的过程中生成命令行客户端的实例，并且您会看到`libra％`提示。

运行此命令的示例输出如下所示：

```

Finished dev [unoptimized + debuginfo] target(s) in 0.72s
Running `target/debug/client -a localhost -p 57149 -s "/var/folders/xd/sfg4x6713w350lq73kgfc7qxnq5swl/T/.tmpmSSKk9/trusted_peers.config.toml" -m "/var/folders/xd/sfg4x6713w350lq73kgfc7qxnq5swl/T/keypair.ATvJWTliQf0a/temp_faucet_keys"
Connected to validator at: localhost:57149
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
Local move development
help | h
Prints this help
quit | q!
Exit this client

Please, input commands:

libra%

```

You can now enter CLI commands to interact with the local network. Refer to the [Libra CLI Guide](reference/libra-cli.md) for command usage information. Refer to [My First Transaction](my-first-transaction.md) for guidance on creating accounts and running transactions on your local blockchain.

现在，您可以输入命令行命令与本地网络进行交互。有关命令用法信息，请参考[Libra命令行指南](reference/libra-cli.md)。 有关在本地区块链上创建帐户和运行交易的指导，请参考[我的第一笔交易](my-first-transaction.md)。

## Troubleshooting FAQ

To see usage options for `libra_swarm`, run:

```
$ cargo run -p libra_swarm -- -h
```

### How Do I Enable Logging?

By default, logging is disabled in `libra_swarm`. If you would like to enable logging, run `libra_swarm` with the `-l` option as shown below:

默认情况下，在`libra_swarm`中禁用日志记录。如果您想启用日志记录，请使用`-l`选项运行`libra_swarm`，如下所示：

```
$ cargo run -p libra_swarm -- -s -l
```

### How Do I Access the Logs?

当您运行`cargo run -p libra_swarm -- -s -l`命令后，您将在输出中看到以下内容：

```
Base directory containing logs and configs: Temporary(TempDir { path:"/var/folders/tq/8gxrrmhx16376zxd5r4h9hhn_x1zq3/T/.tmpzeOPC0"})

```

在另一个终端窗口中，可以使用`tail`命令访问日志：

```
$ tail -f <generated_path>/logs/*
```

The `<generated_path>` in the above example is:

```
/var/folders/tq/8gxrrmhx16376zxd5r4h9hhn_x1zq3/T/.tmpzeOPC0
```

### 如何保存日志？（How Do I Persist the Logs?）

The local validator nodes use a temporary directory to generate the logs and the database. This temporary directory is deleted when the `libra_swarm` process exits. To persist the logs after the termination of `libra_swarm`, run `libra_swarm` using the -`-c` option as specified in [libra_swarm usage](#usage).

本地验证器节点使用一个临时目录来生成日志和数据库。当`libra_swarm`进程退出时，该临时目录被删除。要在`libra_swarm`终止后保留日志，请使用[libra_swarm用法](#usage)中指定的` -c`选项运行`libra_swarm`。

## 参考资料（Reference）

* [CLI Guide](reference/libra-cli.md) &mdash; Lists the commands of the Libra CLI client.
* [My First Transaction](my-first-transaction.md) &mdash; Provides step-by-step guidance on creating new accounts on the Libra Blockchain and running transactions.