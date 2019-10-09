---
id: move-language
title: Move语言
custom_edit_url: https://github.com/deltanet-lab/libra-website-cn/edit/master/docs/crates/language.md
---


Move is a new programming language developed to provide a safe and programmable foundation for the Libra Blockchain.

Move是一种新的编程语言，旨在为Libra区块链提供安全且可编程的基础。

## 概览

The Move language directory consists of five parts:

- [virtual machine](vm/) (VM) &mdash; contains the bytecode format, a bytecode interpreter, and infrastructure for executing a block of transactions. This directory also contains the infrastructure to generate the genesis block.

- [bytecode verifier](bytecode_verifier/) &mdash; contains a static analysis tool for rejecting invalid Move bytecode. The virtual machine runs the bytecode verifier on any new Move code it encounters before executing it. The compiler runs the bytecode verifier on its output and surfaces the errors to the programmer.

- [compiler](compiler/) &mdash; contains the Move intermediate representation (IR) compiler which compiles human-readable program text into Move bytecode. *Warning: the IR compiler is a testing tool. It can generate invalid bytecode that will be rejected by the Move bytecode verifier. The IR syntax is a work in progress that will undergo significant changes.*

- [standard library](stdlib/) &mdash; contains the Move IR code for the core system modules such as `LibraAccount` and `LibraCoin`.

- [tests](functional_tests/) &mdash; contains the tests for the virtual machine, bytecode verifier, and compiler. These tests are written in Move IR and run by a testing framework that parses the expected result of running a test from special directives encoded in comments.

Move语言目录包含五个部分：

- [虚拟机](vm/)（VM）：包含字节码格式，字节码解释器和用于执行事务块的基础结构。该目录还包含生成创世块的基础结构。

- [字节码验证程序](bytecode_verifier/)：包含用于拒绝无效Move字节码的静态分析工具。虚拟机在执行之前会在遇到的任何新Move代码上运行字节码验证程序。编译器在其输出上运行字节码验证程序，并将错误显示给程序员。

- [编译器](compiler/)：包含Move中间表示（IR）编译器，该编译器将人类可读的程序文本编译为Move字节码。 *警告：IR编译器是一种测试工具。它可以生成无效的字节码，该字节码将被Move字节码验证程序拒绝。IR语法是一项正在进行中的工作，将进行重大更改。*

- [标准库](stdlib/)：包含核心系统模块（如`LibraAccount`和`LibraCoin`）的Move IR代码。

- [测试](functional_tests/)：包含针对虚拟机，字节码验证程序和编译器的测试。这些测试是用Move IR编写的，并由测试框架运行，该框架从包含在注释中的特殊指令来解析运行测试的预期结果。

## Move语言如何适用于Libra Core（How the Move Language Fits Into Libra Core）

Libra Core components interact with the language component through the VM. Specifically, the [admission control](../admission_control/) component uses a limited, read-only [subset](../vm_validator/) of the VM functionality to discard invalid transactions before they are admitted to the mempool and consensus. The [execution](../execution/) component uses the VM to execute a block of transactions.

Libra Core组件通过VM与语言组件进行交互。具体来说，[准入控制](../admission_control/)组件使用VM功能的有限只读[subset](../vm_validator/)来在无效事务进入内存池和共识之前将其丢弃。[执行](../execution/)组件使用VM执行事务块。

## 探索Move IR

* You can find many small Move IR examples in the [tests](functional_tests/tests/testsuite) directory. The easiest way to experiment with Move IR is to create a new test in this directory and follow the instructions for running the tests.
* More substantial examples can be found in the [standard library](stdlib/modules) directory. The two notable ones are [LibraAccount.mvir](stdlib/modules/libra_account.mvir), which implements accounts on the Libra blockchain, and [LibraCoin.mvir](stdlib/modules/libra_coin.mvir), which implements Libra coin.
* The four transaction scripts supported in the Libra testnet are also in the standard library directory. They are [peer-to-peer transfer](stdlib/transaction_scripts/peer_to_peer_transfer.mvir), [account creation](stdlib/transaction_scripts/create_account.mvir), [minting new Libra](stdlib/transaction_scripts/mint.mvir), and [key rotation](language/stdlib/transaction_scripts/rotate_authentication_key.mvir). The transaction script for minting new Libra will only work for an account with proper privileges.
* The most complete documentation of the Move IR syntax is the [grammar](compiler/ir_to_bytecode/src/parser.rs). You can also take a look at the [parser for the Move IR](compiler/ir_to_bytecode/syntax/src/syntax.lalrpop).
* Refer to the [IR compiler README](compiler/README.md) for more details on writing Move IR code.

* 您可以在[tests](functional_tests/tests/testsuite)目录中找到许多较小的Move IR示例。试验IR的最简单方法是在此目录中创建一个新测试，并按照说明运行测试。
* 更重要的示例可以在[standard library](stdlib/modules)目录中找到。两个值得注意的是在Libra区块链上实现帐户的[LibraAccount.mvir](stdlib/modules/libra_account.mvir)和用于实现Libra硬币的[LibraCoin.mvir](stdlib/modules/libra_coin.mvir)。
* Libra测试网络支持的四个事务脚本也位于标准库目录中。它们是[点对点传输](stdlib/transaction_scripts/peer_to_peer_transfer.mvir)，[帐户创建](stdlib/transaction_scripts/create_account.mvir)，[创建新Libra](stdlib/transaction_scripts/create_account.mvir)和[密钥轮换](language/stdlib/transaction_scripts/rotate_authentication_key.mvir)。铸造新Libra的交易脚本仅适用于具有适当特权的帐户。
* Move IR语法的最完整文档是[语法](compiler/ir_to_bytecode/src/parser.rs)。您还可以查看[Move IR解析器](compiler/ir_to_bytecode/syntax/src/syntax.lalrpop)。
* 有关编写移动IR代码的更多详细信息，请参考[IR编译器自述文件](compiler/README.md)。

## 代码目录结构

```
├── README.md          # This README
├── benchmarks         # Benchmarks for the Move language VM and surrounding code
├── bytecode_verifier  # The bytecode verifier
├── e2e_tests          # Infrastructure and tests for the end-to-end flow
├── functional_tests   # Testing framework for the Move language
├── compiler           # The IR to Move bytecode compiler
├── stdlib             # Core Move modules and transaction scripts
├── test.sh            # Script for running all the language tests
└── vm
    ├── cost_synthesis # Cost synthesis for bytecode instructions
    ├── src            # Bytecode language definitions, serializer, and deserializer
    ├── tests          # VM tests
    ├── vm_genesis     # The genesis state creation, and blockchain genesis writeset
    └── vm_runtime     # The bytecode interpreter
```
