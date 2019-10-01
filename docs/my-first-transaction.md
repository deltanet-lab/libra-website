---
id: my-first-transaction
title: 我的第一笔交易
---

本文档将指导您完成在Libra区块链上的第一笔交易。 在执行执行第一笔交易的步骤之前，建议您阅读以下文档，以熟悉Libra生态系统和Libra协议的关键方面：

* [欢迎页](welcome-to-libra.md)
* [Libra协议: 关键概念](libra-protocol.md)

我们提供了一个命令行界面（CLI）客户端来与区块链进行交互。

## 假设

本文档中的所有命令均假定：

* 您正在Linux（基于Red Hat或基于Debian的）或macOS系统上运行。
* 您与互联网的连接稳定。
* `git`已安装在您的系统上。
* Homebrew安装在macOS系统上。
* `yum`或`apt-get`已安装在Linux系统上。

## 提交交易的步骤

在此示例中，我们将下载必要的Libra组件并在两个用户之间进行交易：Alice和Bob。

执行以下步骤，将交易提交到Libra测试网络上的验证者节点：

1. [克隆并构建Libra Core](#clone-and-build-libra-core)。
2. [构建Libra命令行客户端并连接到测试网](#build-libra-cli-client-and-connect-to-the-testnet)。
3. [创建Alice和Bob的帐户](#create-alice-s-and-bob-s-account)。
4. [铸造代币并添加到Alice和Bob的帐户中](#add-libra-coins-to-alice-s-and-bob-s-accounts)。
5. [提交一个交易](#submit-a-transaction)。

## 克隆并构建Libra Core

### 克隆Libra Core代码库

```bash
git clone https://github.com/libra/libra.git
```

### 安装Libra Core

要安装Libra Core，请转至`libra`目录并运行安装脚本以安装依赖项，如下所示：

```
cd libra
./scripts/dev_setup.sh
```
The setup script performs these actions:

* 安装 rustup &mdash; rustup是Rust编程语言的安装程序，Libra Core使用该语言实现。
* 安装指定版本的rust-toolchain.
* 安装 CMake &mdash; 管理构建过程。
* 安装 protoc &mdash; protocol buffers的编译器。
* 安装 Go &mdash; 用于构建protocol buffers。

如果安装失败，请参见[故障排除](#setup)

## 构建Libra命令行客户端并连接到Testnet

要连接到在Libra测试网络上运行的验证器节点，请按照如下所示运行客户端。

```bash
./scripts/cli/start_cli_testnet.sh
```

该命令利用cargo（Rust的包管理器）构建并运行客户端，并将客户端连接到测试网上的验证者节点。

客户端连接到测试网上的节点后，您将看到以下输出。 要随时退出客户端，请使用`quit`命令。

```
usage: <command> <args>

Use the following commands:

account | a
  Account operations
query | q
  Query operations
transfer | transferb | t | tb
  <sender_account_address>|<sender_account_ref_id> <receiver_account_address>|<receiver_account_ref_id> <number_of_coins> [gas_unit_price (default=0)] [max_gas_amount (default 10000)] Suffix 'b' is for blocking.
  Transfer coins from account to another.
help | h
  Prints this help
quit | q!
  Exit this client


Please, input commands:

libra%
```

如果在构建客户端和连接到测试网时遇到问题，请参阅[故障排除](#client-build-and-run)。

<blockquote class="block_note">

**注意**：如果要在系统上本地运行验证器节点，请按照[运行本地验证器节点](#run-a-local-validator-node)中的说明进行操作。 创建帐户，铸造硬币和执行交易的说明与测试网络上节点的说明相同。

</blockquote>

## 创建Alice和Bob的帐户

一旦客户端连接到测试网，就可以运行命令行命令来创建新帐户。 我们将引导您为两个用户创建帐户（我们将其称为Alice和Bob）。

### 第一步：确保命令行客户端已经在你的系统上运行

**libra%**命令行提示符表示您的Libra CLI客户端正在运行。 要查看`account`命令的帮助信息，请输入“account”，如下所示：

```plaintext
libra% account
usage: account <arg>

Use the following args for this command:

create | c
  Create an account. Returns reference ID to use in other operations
list | la
  Print all accounts that were created or loaded
recover | r <file path>
  Recover Libra wallet from the file path
write | w <file name>
  Save Libra wallet mnemonic recovery seed to disk
mint | mintb | m | mb <receiver account> <number of coins>
  Mint coins to the account. Suffix 'b' is for blocking
```

### 第二步：创建Alice的账户

请注意，使用CLI创建帐户不会更新区块链，而只会创建本地密钥对。

要创建Alice的帐户，请输入以下命令：

`libra% account create`

Sample output on success:

```plaintext
>> Creating/retrieving next account from wallet
Created/retrieved account #0 address 3ed8e5fafae4147b2a105a0be2f81972883441cfaaadf93fc0868e7a0253c4a8
```

#0是Alice帐户的索引，十六进制字符串是Alice帐户的地址。 索引只是引用爱丽丝帐户的一种方式。 帐户索引是本地CLI索引，可以在其他CLI命令中使用，以使用户方便地参考他们创建的帐户。 该索引对区块链没有意义。 仅当通过铸造将钱添加到Alice的帐户中，或者通过其他用户的转账将资金转移到Alice的帐户中时，才会在区块链上创建Alice的帐户。 请注意，您也可以在CLI命令中使用十六进制地址。 帐户索引只是帐户地址的便利包装。

### 第三步：创建Bob的账户

为了创建Bob的账户，请重复账户创建的命令：

`libra% account create`

Sample output on success:

```plaintext
>> Creating/retrieving next account from wallet
Created/retrieved account #1 address 8337aac709a41fe6be03cad8878a0d4209740b1608f8a81566c9a7d4b95a2ec7
```

#1是Bob帐户的索引，十六进制字符串是Bob帐户的地址。
有关索引的更多详细信息，请参考[创建爱丽丝的帐户](#step-2-create-alice-s-account)。

### 第四步(可选)：查询账户

要列出您已创建的帐户，请输入以下命令：

`libra% account list`

Sample output on success:
```plaintext
User account index: 0, address: 3ed8e5fafae4147b2a105a0be2f81972883441cfaaadf93fc0868e7a0253c4a8, sequence number: 0
User account index: 1, address: 8337aac709a41fe6be03cad8878a0d4209740b1608f8a81566c9a7d4b95a2ec7, sequence number: 0
```

帐户的序列号指示已从该帐户发送的交易数量。 每次执行从该帐户发送的交易并将其存储在区块链中时，它都会增加。 要了解更多信息，请参阅[交易序列号](reference/glossary.md#sequence-number)。

## 将Libra币添加到Alice和Bob的帐户中

铸造硬币并将硬币添加到测试网上的帐户是通过Faucet服务完成的。 Faucet是与测试网一起运行的服务。 该服务仅用于为测试网络铸造硬币，而对于[主网](reference/glossary.md#mainnet)不存在。 它创建的Libra币没有现实价值。 假设您已经[创建了Alice和Bob的帐户](#create-alice-s-and-bob-s-account)（分别具有索引0和索引1），则可以按照以下步骤将Libra添加到两个帐户中。

### 步骤1：将110个Libra添加到Alice的帐户

要铸造Libra并添加到Alice的帐户中，请输入以下命令：

`libra% account mint 0 110`

* 0 是Alice的账户索引。
* 110是添加到Alice账户中的Libra的总量。

成功的帐户造币命令还将在区块链上创建爱丽丝的帐户。

成功样例输出：

```plaintext
>> Minting coins
Mint request submitted
```

请注意，提交请求后，这意味着已将其成功添加到（测试网中验证者节点的）内存池中。 它不一定意味着它将成功完成。 稍后，我们将查询帐户余额以确认铸造是否成功。

如果您的帐户mint命令未能成功提交您的请求，请参阅[故障处理](#minting-and-adding-money-to-account)

### 步骤2：将52个Libra添加到Bob的帐户中

要铸造Libra并添加到Bob的帐户，请输入以下命令：

`libra% account mint 1 52`

* 1是Bob帐户的索引。
* 52是要加到Bob帐户上的Libra币的数目。
* 成功的"account mint"命令还将在区块链上创建Bob的帐户。在区块链上创建Bob帐户的另一种方法是将Alice帐户中的钱转到Bob帐户。

成功的示例输出：

```plaintext
>> Minting coins
Mint request submitted
```

如果"account mint"命令未成功执行，请参阅[故障排除](#minting-and-adding-money-to-account)

### 步骤3: 查看余额

为了查看Alice的账户余额，请输入如下命令：

`libra% query balance 0`

成功的示例输出：

`Balance is: 110`

为了查看Bob的账户余额，请输入如下命令：

`libra% query balance 1`

成功的示例输出：

`Balance is: 52`

## 提交一个交易

在提交交易以将Libra从Alice的帐户转移到Bob的帐户之前，我们将查询每个帐户的序列号。 这将帮助我们了解执行交易如何更改每个帐户的序列号。

### 查询帐号的序列号

```plaintext
libra% query sequence 0
>> Getting current sequence number
Sequence number is: 0
libra% query sequence 1
>> Getting current sequence number
Sequence number is: 0
```

In `query sequence 0`, 0 is the index of Alice’s account. A sequence number of 0 for both Alice’s and Bob’s accounts indicates that no transactions from either Alice’s or Bob’s account has been executed so far.

### 现金转账

要提交交易以将10个Libra从Alice的帐户转移到Bob的帐户，请输入以下命令：

`libra% transfer 0 1 10`

* 0 is the index of Alice’s account.
* 1 is the index of Bob’s account.
* 10 is the number of Libra to transfer from Alice’s account to Bob’s account.

成功样例输出：

```plaintext
>> Transferring
Transaction submitted to validator
To query for transaction status, run: query txn_acc_seq 0 0 <fetch_events=true|false>
```

You can use the command `query txn_acc_seq 0 0 true` (transaction by account and sequence number) to retrieve the information about the transaction you just submitted. The first parameter is the local index of the sender account, and the second parameter is the sequence number of the account. To see a sample output of this command refer to [Sample Outputs](#query-transaction-by-account-and-sequence-number).

You just submitted your transaction to a validator node on testnet, and it was included in the [mempool](reference/glossary.md#mempool) of the validator. This doesn't necessarily mean your transaction has been executed. In theory, if the system were slow or overloaded, it would take some time to see the results, and you may have to check multiple times by querying the accounts. To query an account with index 0, you can use the command  `query account_state 0.` The expected output is shown in the [Sample Outputs](#query-events) section

To troubleshoot the transfer command, refer to [Troubleshooting](#the-transfer-command).

**The Blocking Transfer Command**: You can use the `transferb` command (as shown below), instead of the `transfer` command. `transferb` will submit the transaction and return to the client prompt only after the transaction has been committed to the blockchain. An example is shown below:

`libra% transferb 0 1 10`

Refer to [Life of a Transaction](life-of-a-transaction.md) for an understanding of the lifecycle of a transaction from submission to execution and storage.

您可以使用命令`query txn_acc_seq 0 0 true`（按帐户和序列号进行交易）来检索您刚才提交的交易的信息。第一个参数是发送方帐户的本地索引，第二个参数是帐户的序列号。若要查看此命令的示例输出，请参考[示例输出](#query-transaction-by-account-and-sequence-number)。

您刚刚将交易提交给了测试网络上的验证节点，它被放在验证器的[内存池](reference/glossary.md#mempool)中。这并不一定意味着你的交易已经被执行。理论上，如果系统是慢的或超载的，则需要一些时间来查看结果，并且您可能需要通过查询帐户多次检查。若要查询索引为0的帐户，可以使用命令`query account_state 0`。预期输出显示在[示例输出](#query-events)部分

要对传输命令进行故障排除，请参阅[故障排除](#the-transfer-command)。

**阻塞式转账命令**：您可以使用`transferb`命令（如下所示），而不是`transfer`命令。` transferb`只有在交易已经写入到区块链后，才会提交交易并返回到客户端提示。示例如下所示：

`libra% transferb 0 1 10`

有关从提交到执行和存储的整个交易生命周期的了解，请参阅[交易生命周期](life-of-a-transaction.md)。

### 转账后查询交易序列号

```plaintext
libra% query sequence 0
>> Getting current sequence number
Sequence number is: 1
libra% query sequence 1
>> Getting current sequence number
Sequence number is: 0
```

Alice的帐户（索引为0）的交易序列号为1表示到目前为止，Alice的帐户已发送了一笔交易。 Bob的帐户（索引为1）的交易序列号为0表示到目前为止，尚未从Bob的帐户发送任何交易。 每次从帐户发送交易时，交易序列号都会增加1。

### 转账后检查两个账户的余额

要检查两个帐户的最终余额，请像在[此步骤](#step-3-check-the-balance)中一样，再次查询每个帐户的余额。 如果您的交易（转帐）成功执行，您应该在Alice的帐户中看到100个Libra，在Bob的帐户中看到62个Libra。

```plaintext
libra% query balance 0
Balance is: 100
libra% query balance 1
Balance is: 62
```

### 恭喜!

您已成功在Libra测试网上执行了交易，并将10个Libra从Alice的帐户转移到了Bob的帐户！

## 答疑

### 安装

* 更新Rust:
    * Run `rustup update` from your libra directory.
* 更新protoc:
    * Update `protoc` to version 3.6.0 or above.
* Re-run setup script from your libra directory:
    * `./scripts/dev_setup.sh`

### 客户端构建和运行

If you are experiencing build failures, try to remove the cargo lock file from the libra directory:

* `rm Cargo.lock`

If your client did not connect to the testnet:

* Check your internet connection.
* Ensure that you are using the latest version of the client. Pull the latest Libra Core and rerun the client:
    * `./scripts/cli/start_cli_testnet.sh`


### Minting and Adding Money to Account

* If the validator node you connected to on testnet is unavailable, you will get a “Server unavailable” message as shown below:

  ```plaintext
  libra% account mint 0 110
  >> Minting coins
  [ERROR] Error minting coins: Server unavailable, please retry and/or check **if** host passed to the client is running
  ```
* If your balance was not updated after submitting a transaction, wait a moment and query the balance again. There may be a delay if the blockchain is experiencing a very high volume of transactions.  If your balance still is not updated, please try minting again.

* To check if an account exists, query the account state. For an account with index 0 enter this:

  `libra% query account_state 0`

### The Transfer Command

If the testnet validator node (your client was connected to) is unavailable or your connection to the testnet has timed-out, you will see this error:

```plaintext
libra% transfer 0 1 10
>> Transferring
[ERROR] Failed to perform transaction: Server unavailable, please retry and/or check if host passed to the client is running
```
To troubleshoot transfer errors:

* Check the connection to testnet.
* Query the sender account to make sure it exists. Use the following command for an account with index 0:
    * `query account_state 0`
* You can try quitting the client using `quit` or `q!`, and rerun the following command to connect to the testnet:
    * `./scripts/cli/start_cli_testnet.sh` from the libra directory

## Sample Outputs of Additional Query Commands

### Query Transaction by Account and Sequence Number

This example will query for a single transaction's details using the account and sequence number.

```plaintext
libra% query txn_acc_seq 0 0 true
>> Getting committed transaction by account and sequence number
Committed transaction: SignedTransaction {
 { raw_txn: RawTransaction {
    sender: 3ed8e5fafae4147b2a105a0be2f81972883441cfaaadf93fc0868e7a0253c4a8,
    sequence_number: 0,
    payload: {,
      transaction: peer_to_peer_transaction,
      args: [
        {ADDRESS: 8337aac709a41fe6be03cad8878a0d4209740b1608f8a81566c9a7d4b95a2ec7},
        {U64: 10000000},
      ]
    },
    max_gas_amount: 10000,
    gas_unit_price: 0,
    expiration_time: 1560466424s,
},
 public_key: 55af3fe3f28550a2f1e5ebf073ef193feda44344d94c463b48be202aa0b3255d,
 signature: Signature( R: CompressedEdwardsY: [210, 23, 214, 62, 228, 179, 64, 147, 81, 159, 180, 138, 100, 211, 111, 139, 178, 148, 81, 1, 240, 135, 148, 145, 104, 234, 227, 239, 198, 153, 13, 199], s: Scalar{
  bytes: [203, 76, 105, 49, 64, 130, 162, 81, 22, 237, 159, 26, 80, 181, 111, 94, 84, 6, 152, 126, 181, 192, 62, 103, 130, 94, 246, 174, 139, 214, 3, 15],
} ),
 }
 }
Events:
ContractEvent { access_path: AccessPath { address: 3ed8e5fafae4147b2a105a0be2f81972883441cfaaadf93fc0868e7a0253c4a8, type: Resource, hash: "217da6c6b3e19f1825cfb2676daecce3bf3de03cf26647c78df00b371b25cc97", suffix: "/sent_events_count/" } , index: 0, event_data: AccountEvent { account: 8337aac709a41fe6be03cad8878a0d4209740b1608f8a81566c9a7d4b95a2ec7, amount: 10000000 } }
ContractEvent { access_path: AccessPath { address: 8337aac709a41fe6be03cad8878a0d4209740b1608f8a81566c9a7d4b95a2ec7, type: Resource, hash: "217da6c6b3e19f1825cfb2676daecce3bf3de03cf26647c78df00b371b25cc97", suffix: "/received_events_count/" } , index: 0, event_data: AccountEvent { account: 3ed8e5fafae4147b2a105a0be2f81972883441cfaaadf93fc0868e7a0253c4a8, amount: 10000000 } }
```

Note that the transaction amount is shown in microlibra.

### 事件查询

In the following example, we will query for “sent” events from the account at reference index 0.  You will notice there is a single event since we sent one transaction from this account.  The proof of the current state is also returned so that verification can be performed that no events are missing - this is done when the query does not return “limit” events.

在下面的示例中，我们将在引用索引0处查询来自帐户的“sent”事件。您会注意到有一个事件，因为我们从这个帐户发送了一个交易。还将返回当前状态的证明，以便可以执行验证，确保不缺少任何事件—当查询不返回“limit”事件时，将执行此操作。

```plaintext
libra% query event 0 sent 0 true 10
>> Getting events by account and event type.
EventWithProof {
  transaction_version: 3,
  event_index: 0,
  event: ContractEvent { access_path: AccessPath { address: e7460e02058b36d28e8eef03f0834c605d3d6c57455b8ec9c3f0a3c8b89f248b, type: Resource, hash: "217da6c6b3e19f1825cfb2676daecce3bf3de03cf26647c78df00b371b25cc97", suffix: "/sent_events_count/" } , index: 0, event_data: AccountEvent { account: 46efbad798a739c088e0e98dd9d592c27c7eb45ba1f8ccbdfc00bd4d7f2947f3, amount: 10000000 } },
  proof: EventProof { ledger_info_to_transaction_info_proof: AccumulatorProof { siblings: [HashValue(62570ae9a994bcb20c03c055667a4966fa50d0f17867dd5819465072fd2c58ba), HashValue(cce2cf325714511e7d04fa5b48babacd5af943198e6c1ac3bdd39c53c87cb84c)] }, transaction_info: TransactionInfo { signed_transaction_hash: HashValue(69bed01473e0a64140d96e46f594bc4b463e88e244b694e962b7e19fde17f30d), state_root_hash: HashValue(5809605d5eed94c73e57f615190c165b11c5e26873012285cc6b131e0817c430), event_root_hash: HashValue(645df3dee8f53a0d018449392b8e9da814d258da7346cf64cd96824f914e68f9), gas_used: 0 }, transaction_info_to_event_proof: AccumulatorProof { siblings: [HashValue(5d0e2ebf0952f0989cb5b38b2a9b52a09e8d804e893cb99bf9fa2c74ab304bb1)] } }
}
Last event state: Some(
    AccountStateWithProof {
        version: 3,
        blob: Some(
            AccountStateBlob {
             Raw: 0x010000002100000001217da6c6b3e19f1825cfb2676daecce3bf3de03cf26647c78df00b371b25cc974400000020000000e7460e02058b36d28e8eef03f0834c605d3d6c57455b8ec9c3f0a3c8b89f248b00e1f50500000000000000000000000001000000000000000100000000000000
             Decoded: Ok(
                AccountResource {
                    balance: 100000000,
                    sequence_number: 1,
                    authentication_key: 0xe7460e02058b36d28e8eef03f0834c605d3d6c57455b8ec9c3f0a3c8b89f248b,
                    sent_events_count: 1,
                    received_events_count: 0,
                },
            )
             },
        ),
        proof: AccountStateProof {
            ledger_info_to_transaction_info_proof: AccumulatorProof {
                siblings: [
                    HashValue(62570ae9a994bcb20c03c055667a4966fa50d0f17867dd5819465072fd2c58ba),
                    HashValue(cce2cf325714511e7d04fa5b48babacd5af943198e6c1ac3bdd39c53c87cb84c),
                ],
            },
            transaction_info: TransactionInfo {
                signed_transaction_hash: HashValue(69bed01473e0a64140d96e46f594bc4b463e88e244b694e962b7e19fde17f30d),
                state_root_hash: HashValue(5809605d5eed94c73e57f615190c165b11c5e26873012285cc6b131e0817c430),
                event_root_hash: HashValue(645df3dee8f53a0d018449392b8e9da814d258da7346cf64cd96824f914e68f9),
                gas_used: 0,
            },
            transaction_info_to_account_proof: SparseMerkleProof {
                leaf: Some(
                    (
                        HashValue(c0fbd63b0ae4abfe57c8f24f912f164ba0537741e948a65f00d3fae0f9373981),
                        HashValue(fc45057fd64606c7ca40256b48fbe486660930bfef1a9e941cafcae380c25871),
                    ),
                ),
                siblings: [
                    HashValue(4136803b3ba779bb2c1daae7360f3f839e6fef16ae742590a6698b350a5fc376),
                    HashValue(5350415253455f4d45524b4c455f504c414345484f4c4445525f484153480000),
                    HashValue(a9a6bda22dd6ee78ddd3a42da152b9bd39797b7da738e9d6023f407741810378),
                ],
            },
        },
    },
)
```

### 查询账户状态

In this example, we will query for the state of a single account.

```plaintext
libra% query account_state 0
>> Getting latest account state
Latest account state is:
 Account: 3ed8e5fafae4147b2a105a0be2f81972883441cfaaadf93fc0868e7a0253c4a8
 State: Some(
    AccountStateBlob {
     Raw: 0x010000002100000001217da6c6b3e19f1825cfb2676daecce3bf3de03cf26647c78df00b371b25cc9744000000200000003ed8e5fafae4147b2a105a0be2f81972883441cfaaadf93fc0868e7a0253c4a800e1f50500000000000000000000000001000000000000000100000000000000
     Decoded: Ok(
        AccountResource {
            balance: 100000000,
            sequence_number: 1,
            authentication_key: 0x3ed8e5fafae4147b2a105a0be2f81972883441cfaaadf93fc0868e7a0253c4a8,
            sent_events_count: 1,
            received_events_count: 0,
        },
    )
     },
)
 Blockchain Version: 3
```

## 运行本地验证者节点

To start a validator node locally on your computer and create your own local blockchain network (not connected to the Libra testnet), ensure that you have run the build script as described in [Setup Libra Core](#setup-libra-core), change to the root directory of the Libra Core repository, and run `libra_swarm` as shown below:

要在你的计算上启动一个本地验证节点并创建你自己的本地区块链网络（未连接到Libra测试网络），请确保已按照[安装Libra Core](#setup-libra-core)中的说明运行构建脚本，先进入到Libra Core代码库的根目录，然后运行`libra_swarm`，如下所示：

```bash
$ cd ~/libra
$ cargo run -p libra_swarm -- -s
```

`-p libra_swarm` - causes cargo to run the libra_swarm package, which starts a local blockchain consisting of one node.

`-s` option starts a local client to connect to the local blockchain.

要查看启动节点和连接Libra区块链的其他选项，请运行：

`$ cargo run -p libra_swarm -- -h`

"cargo run"命令可能需要一些时间才能运行完。如果此命令零错误的执行完，则一个Libra命令行客户端和libra验证器节点实例将会运行在您的系统中。成功执行后，您将看到包含CLI客户端菜单和`libra%`提示符的输出。

## 交易的生命周期

一旦您执行了第一笔交易，您可以参考文档[交易的生命周期](life-of-a-transaction.md)了解：

* 查看交易从提交到执行的生命周期。
* 在Libra生态系统中提交和执行交易时，了解Libra验证器的每个逻辑组件之间的交互。

## 参考资料

* [欢迎页](welcome-to-libra.md)。
* [Libra协议: 核心概念](libra-protocol.md) &mdash; 介绍Libra协议的基础概念。
* [Move入门](move-overview.md) &mdash; 向您介绍一种称为Move的新区块链编程语言。
* [交易的生命周期](life-of-a-transaction.md) &mdash; 提供提交和执行交易时“幕后”发生的情况。
* [Libra核心概览](libra-core-overview.md) &mdash; 通过自述文件提供Libra核心组件的概念和实现细节。
* [命令行指导](reference/libra-cli.md) &mdash; 列出Libra命令行客户端的命令（及其用法）。
* [Libra术语表](reference/glossary.md) &mdash; 提供Libra术语的快速参考。
