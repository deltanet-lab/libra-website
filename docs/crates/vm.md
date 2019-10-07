---
id: vm
title: 虚拟机
custom_edit_url: https://github.com/deltanet-lab/libra-website-cn/edit/master/language/vm/README.md
---


The MoveVM executes transactions expressed in the Move bytecode. There are
two main crates: the core VM and the VM runtime. The VM core contains the low-level
data type for the VM - mostly the file format and abstraction over it. A gas
metering logical abstraction is also defined there.

MoveVM执行以Move字节码表示的事务。 有两个主要的creates：core VM和VM runtime。 VM内核包含低级
VM的数据类型 - 主要是文件格式和对其的抽象。燃料的计量逻辑抽象也在这里定义。

## 概览

The MoveVM is a stack machine with a static type system. The MoveVM honors
the specification of the Move language through a mix of file format,
verification (for reference [bytcode verifier README](https://github.com/deltanet-lab/libra-website-cn/blob/master/language/bytecode_verifier/README.md))
and runtime constraints. The structure of the file format allows the
definition of modules, types (resources and unrestricted types), and
functions. Code is expressed via bytecode instructions, which may have
references to external functions and types.  The file format also imposes
certain invariants of the language such as opaque types and private fields.
From the file format definition it should be clear that modules define a
scope/namespace for functions and types. Types are opaque given all fields
are private, and types carry no functions or methods.

MoveVM是具有静态类型系统的堆栈计算机。 MoveVM通过混合使用文件格式、验证器和运行时约束来实现Move语言的规范（供参考[bytcode验证程序README](https://github.com/deltanet-lab/libra-website-cn/blob/master/language/bytecode_verifier/README.md)）。 文件格式的结构允许定义模块，类型（资源和非受限类型）和函数。代码通过字节码指令表示，该指令可能引用了外部函数和类型。 文件格式还强加了语言的某些不变性，例如不透明类型和私有字段。
根据文件格式定义，应该清楚模块定义了
函数和类型的范围/命名空间。 如果所有字段均为私有，则类型是不透明的，并且类型不包含任何函数或方法。

## 实现细节（Implementation Details）

The MoveVM core crate provides the definition of the file format and all
utilities related to the file format:
* A simple Rust abstraction over the file format
  (`libra/language/vm/src/file_format.rs`) and the bytecodes. These Rust
  structures are widely used in the code base.
* Serialization and deserialization of the file format. These define the
  on-chain binary representation of the code.
* Some pretty printing functionalities.
* A proptest infrastructure for the file format.
* The gas cost/synthesis infrastructure.

The `CompiledModule` and `CompiledScript` definitions in
`libra/language/vm/src/file_format.rs` are the top-level structs for a Move
*Module* or *Transaction Script*, respectively. These structs provide a
simple abstraction over the file format. Additionally, a set of
[*Views*](https://github.com/deltanet-lab/libra-website-cn/blob/master/language/vm/src/views.rs) are defined to easily navigate and inspect
`CompiledModule`s and `CompiledScript`s.


MoveVM核心库提供了文件格式的定义以及所有与文件格式有关的工具：
* 文件格式的简单Rust抽象(`libra/language/vm/src/file_format.rs`)和字节码，这些Rust结构在代码库中被广泛使用。
* 文件格式的序列化和反序列化，这些定义了代码的链上二进制表示。
* 一些漂亮的打印功能。
* 用于文件格式的proptest基础设施。
* 燃料成本/合成基础设施。

在`libra/language/vm/src/file_format.rs`中定义的`CompiledModule`和`CompiledScript`
是Move的顶层结构
分别是*Module*或*Transaction Script*。 这些结构提供了对文件格式的简单抽象。 另外，一组
[*Views*](https://github.com/deltanet-lab/libra-website-cn/blob/master/language/vm/src/views.rs)的定义可以轻松导航和检查`CompiledModule`s和`CompiledScript`s。

## 代码目录结构（Folder Structure）

```
.
├── cost_synthesis  # Infrastructure for gas cost synthesis
├── src             # VM core files
├── tests           # Proptests
├── vm_genesis      # Helpers to generate a genesis block, the initial state of the blockchain
└── vm_runtime      # Interpreter and runtime data types (see README in that folder)
```

