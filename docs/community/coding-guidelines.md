---
id: coding-guidelines
title: Coding Guidelines
---


This document describes the coding guidelines for the Libra Core Rust codebase.

本文档介绍了Libra Core Rust代码库的编码准则。

## 编码格式

All code formatting is enforced with [rustfmt](https://github.com/rust-lang/rustfmt) with a project-specific configuration.  Below is an example command to adhere to the Libra Core project conventions.

使用[rustfmt](https://github.com/rust-lang/rustfmt)进行代码格式化，且具有特定于项目的配置。以下是遵守Libra Core项目约定的示例命令。

```
libra$ cargo fmt
```

## Code analysis

[Clippy](https://github.com/rust-lang/rust-clippy)用于捕获常见错误，并作为持续集成的一部分运行。在提交代码进行审核之前，您可以使用我们的配置运行clippy：

```
libra$ ./scripts/clippy.sh
```

通常，我们遵循[rust-lang-nursery](https://rust-lang-nursery.github.io/api-guidelines/about.html)中的建议。 本指南的其余部分提供了有关特定主题的详细指南，以实现代码库的统一性。

## Code documentation

Any public fields, functions, and methods should be documented with [Rustdoc](https://doc.rust-lang.org/book/ch14-02-publishing-to-crates-io.html#making-useful-documentation-comments).

 Please follow the conventions as detailed below for modules, structs, enums, and functions.  The *single line* is used as a preview when navigating Rustdoc.  As an example, see the 'Structs' and 'Enums' sections in the [collections](https://doc.rust-lang.org/std/collections/index.html) Rustdoc.

任何公共领域，功能和方法都应使用[Rustdoc](https://doc.rust-lang.org/book/ch14-02-publishing-to-crates-io.html#making-useful-documentation-comments)。

请遵循以下有关模块，结构，枚举和函数的约定。导航Rustdoc时，*单行*用作预览。例如，请参阅[collections](https://doc.rust-lang.org/std/collections/index.html)Rustdoc中的“Structs”和“Enums”部分。

 ```
 /// [Single line] One line summary description
 ///
 /// [Longer description] Multiple lines, inline code
 /// examples, invariants, purpose, usage, etc.
 [Attributes] If attributes exist, add after Rustdoc
 ```

示例如下:

```rust
/// Represents (x, y) of a 2-dimensional grid
///
/// A line is defined by 2 instances.
/// A plane is defined by 3 instances.
#[repr(C)]
struct Point {
    x: i32,
    y: i32,
}
```

### Constants and fields

Describe the purpose and definition of this data.

### Functions and methods

Document the following for each function:

* The action the method performs - “This method *adds* a new transaction to the mempool.” Use *active voice* and *present tense* (i.e. adds/creates/checks/updates/deletes).
* Describe how and why to use this method.
* Any condition that must be met _before_ calling the method.
* State conditions under which the function will `panic!()` or returns an `Error`
* Brief description of return values.
* Any special behavior that is not obvious

为每个功能记录以下内容：

* 该方法执行的操作 - “此方法*向内存池添加*新事务。”使用*活动语音*和*表示时态*（即添加/创建/检查/更新/删除）。
* 描述如何以及为什么使用此方法。
* 调用该方法之前必须满足的任何条件。
* 说明条件，函数将在该条件下执行`panic!()`或返回`Error`。
* 返回值的简要说明。
* 任何不明显的特殊行为

### README.md for top-level directories and other major components

Each major component of Libra Core needs to have a `README.md` file. Major components are:
* top-level directories (e.g. `libra/network`, `libra/language`)
* the most important crates in the system (e.g. `vm_runtime`)

This file should contain:

 * The *conceptual* *documentation* of the component.
 * A link to the external API documentation for the component.
 * A link to the master license of the project.
 * A link to the master contributing guide for the project.

A template for readmes:

Libra Core的每个主要组件都需要具有一个`README.md`文件。主要组件有：
* 顶级目录（例如`libra/network`，`libra/language`）
* 系统中最重要的板条箱（例如`vm_runtime`）

该文件应包含：

  * 组件的*概念*性*文档*。
  * 指向该组件的外部API文档的链接。
  * 指向项目主许可证的链接。
  * 指向项目主要贡献者指南的链接。

自述文件的模板：

```markdown
# Component Name

[Summary line: Start with one sentence about this component.]

## Overview

* Describe the purpose of this component and how the code in
this directory works.
* Describe the interaction of the code in this directory with
the other components.
* Describe the security model and assumptions about the crates
in this directory. Examples of how to describe the security
assumptions will be added in the future.

## Implementation Details

* Describe how the component is modeled. For example, why is the
  code organized the way it is?
* Other relevant implementation details.

## API Documentation

For the external API of this crate refer to [Link to rustdoc API].

[For a top-level directory, link to the most important APIs within.]

## Contributing

Refer to the Libra Project contributing guide [LINK].

## License

Refer to the Libra Project License [LINK].
```

A good example of README.md is `libra/network/README.md` that describes the networking crate.

## Code suggestions

In the following sections, we have suggested some best practices for a uniform codebase. We will investigate and identify the practices that can be enforced using Clippy. This information will evolve and improve over time.

在以下各节中，我们为统一代码库提出了一些最佳实践。我们将调查并确定可以使用Clippy实施的实践。随着时间的流逝，这些信息将不断发展和完善。

### Attributes

Make sure to use the appropriate attributes for handling dead code:
确保使用适当的属性来处理无效代码：

```
// For code that is intended for production usage in the future
#[allow(dead_code)]
// For code that is only intended for testing and
// has no intended production use
#[cfg(test)]
```

### Avoid Deref polymorphism

Don't abuse the Deref trait to emulate inheritance between structs, and thus reuse methods.  For more information, read [here](https://github.com/rust-unofficial/patterns/blob/master/anti_patterns/deref.md).

### Comments

We recommend that you use `//` and `///` comments rather than block comments `/* ... */` for uniformity and simpler grepping.

### Cloning

If `x` is reference counted, prefer [`Arc::clone(x)`](https://doc.rust-lang.org/std/sync/struct.Arc.html) over `x.clone()`. [`Arc::clone(x)`](https://doc.rust-lang.org/std/sync/struct.Arc.html) explicitly indicates that we are cloning `x`. This avoids confusion about whether we are performing an expensive clone of a `struct`, `enum`, other types, or just a cheap reference copy.

Also, if you are passing around [`Arc<T>`](https://doc.rust-lang.org/std/sync/struct.Arc.html) types, consider using a newtype wrapper:

```rust
#[derive(Clone, Debug)]
pub struct Foo(Arc<FooInner>);
```

### Concurrent types

Concurrent types such as [`CHashMap`](https://docs.rs/crate/chashmap), [`AtomicUsize`](https://doc.rust-lang.org/std/sync/atomic/struct.AtomicUsize.html), etc. have an immutable borrow on self i.e. `fn foo_mut(&self,...)` in order to support concurrent access on interior mutating methods. Good practices (such as those in the examples mentioned) avoid exposing synchronization primitives externally (e.g. `Mutex`, `RwLock`) and document the method semantics and invariants clearly.

*When to use channels vs concurrent types?*

Listed below are high-level suggestions based on experience:

* Channels are for ownership transfer, decoupling of types, and coarse-grained messages.  They fit well for transferring ownership of data, distributing units of work, and communicating async results.  Furthermore, they help break circular dependencies (e.g. `struct Foo` contains an `Arc<Bar>` and `struct Bar` contains an `Arc<Foo>` that leads to complex initialization).

* Concurrent types (e.g. such as [`CHashMap`](https://docs.rs/crate/chashmap) or structs that have interior mutability building on [`Mutex`](https://doc.rust-lang.org/std/sync/struct.Mutex.html), [`RwLock`](https://doc.rust-lang.org/std/sync/struct.RwLock.html), etc.) are better suited for caches and states.

### Error handling

Error handling suggestions follow the [Rust book guidance](https://doc.rust-lang.org/book/ch09-00-error-handling.html).  Rust groups errors into two major categories: recoverable and unrecoverable errors.  Recoverable errors should be handled with [Result](https://doc.rust-lang.org/std/result/).  Our suggestions on unrecoverable errors are listed below:

*Panic*

* `panic!()` - Runtime panic! should only be used when the resulting state cannot be processed going forward.  It should not be used for any recoverable errors.
* `unwrap()` - Unwrap should only be used for mutexes (e.g. `lock().unwrap()`) and test code.  For all other use cases, prefer `expect()`. The only exception is if the error message is custom-generated, in which case use `.unwrap_or_else(|| panic!("error: {}", foo))`
* `expect()` - Expect should be invoked when a system invariant is expected to be preserved.  `expect()` is preferred over `unwrap()` and should contain a detailed error message on failure in most cases.
* `assert!()` - This macro is kept in both debug/release and should be used to protect invariants of the system as necessary
* `unreachable!()` - This macro will panic on code that should not be reached (violating an invariant) and can be used where appropriate.

### Generics

Generics allow dynamic behavior (similar to [`trait`](https://doc.rust-lang.org/book/ch10-02-traits.html) methods) with static dispatch.  As the number of generic type parameters increase, the difficulty of using the type/method also increases (e.g. consider the combination of trait bounds required for this type, duplicate trait bounds on related types, etc.).  In order to avoid this complexity, we generally try to avoid using a large number of generic type parameters.  We have found that converting code with a large number of generic objects to trait objects with dynamic dispatch often simplifies our code.

泛型允许动态行为（类似于[`trait`](https://doc.rust-lang.org/book/ch10-02-traits.html)方法）和静态调度。随着通用类型参数数量的增加，使用类型/方法的难度也会增加（例如，考虑此类型所需的特征范围的组合，相关类型上重复的特征范围的组合等）。为了避免这种复杂性，我们通常尝试避免使用大量的泛型类型参数。我们发现，通过动态调度将具有大量泛型对象的代码转换为特征对象通常可以简化我们的代码。

### Getters/setters

Excluding test code, set field visibility to private as much as possible. Private fields allow constructors to enforce internal invariants. Implement getters for data that consumers may need, but avoid setters unless mutable state is necessary.

Public fields are most appropriate for [`struct`](https://doc.rust-lang.org/book/ch05-00-structs.html) types in the C spirit: compound, passive data structures without internal invariants.  Naming suggestions follow the guidance [here](https://rust-lang-nursery.github.io/api-guidelines/naming.html#getter-names-follow-rust-convention-c-getter) as shown below.

除测试代码外，请将字段可见性设置为私有。私有字段允许构造函数强制执行内部不变式。为消费者可能需要的数据实现吸气剂，但除非必要的可变状态，否则避免使用吸气剂。

在C语言中，公共字段最适合[`struct`](https://doc.rust-lang.org/book/ch05-00-structs.html)类型：复合，无源数据结构，没有内部不变量。命名建议遵循[此处](https://rust-lang-nursery.github.io/api-guidelines/naming.html#getter-names-follow-rust-convention-c-getter)的指导，如下所示。

```rust
struct Foo {
    size: usize,
    key_to_value: HashMap<u32, u32>
}

impl Foo {
    /// Return a copy when inexpensive
    fn size(&self) -> usize {
        self.size
    }

    /// Borrow for expensive copies
    fn key_to_value(&self) -> &HashMap<u32, u32> {
        &self.key_to_value
    }

    /// Setter follows set_xxx pattern
    fn set_foo(&mut self, size: usize){
        self.size = size;
    }

    /// For a more complex getter, using get_XXX is acceptable
    /// (similar to HashMap) with well-defined and
    /// commented semantics
    fn get_value(&self, key: u32) -> Option<&u32> {
        self.key_to_value.get(&key)
    }
}
```

### Logging

We currently use [slog](https://docs.rs/slog/) for logging.

* [error!](https://docs.rs/slog/2.4.1/slog/macro.error.html) - Error-level messages have the highest urgency in [slog](https://docs.rs/slog/).  An unexpected error has occurred (e.g. exceeded the maximum number of retries to complete an RPC or inability to store data to local storage).
* [warn!](https://docs.rs/slog/2.4.1/slog/macro.warn.html) - Warn-level messages help notify admins about automatically handled issues (e.g. retrying a failed network connection or receiving the same message multiple times, etc.).
* [info!](https://docs.rs/slog/2.4.1/slog/macro.info.html) - Info-level messages are well suited for "one time" events (such as logging state on one-time startup and shutdown) or periodic events that are not frequently occurring - e.g. changing the validator set every day.
* [debug!](https://docs.rs/slog/2.4.1/slog/macro.debug.html) - Debug-level messages can occur frequently (i.e. potentially > 1 message per second) and are not typically expected to be enabled in production.
* [trace!](https://docs.rs/slog/2.4.1/slog/macro.trace.html) - Trace-level logging is typically only used for function entry/exit.

我们目前使用[slog](https://docs.rs/slog/)进行日志记录。

* [错误！](https://docs.rs/slog/2.4.1/slog/macro.error.html) - 错误级消息在[slog](https://docs.rs/slog/)中具有最高紧急度。发生意外错误（例如，超出了可完成RPC的最大重试次数或无法将数据存储到本地存储）。
* [警告！](https://docs.rs/slog/2.4.1/slog/macro.warn.html) - 警告级别的消息有助于通知管理员有关自动处理的问题（例如重试失败的网络连接或接收多次重复相同的消息，依此类推）。
* [info！](https://docs.rs/slog/2.4.1/slog/macro.info.html) - 信息级消息非常适合“一次性”事件（例如，时间启动和关闭）或不经常发生的周期性事件 - 例如每天更改验证器集。
* [debug！](https://docs.rs/slog/2.4.1/slog/macro.debug.html) - 调试级别的消息可能会频繁发生（例如，每秒可能有1条以上的消息），通常不会出现在生产中启用。
* [trace！](https://docs.rs/slog/2.4.1/slog/macro.trace.html) - 跟踪级别的日志记录通常仅用于函数进入/退出。

### Testing

*Unit tests*

Ideally, all code should be unit tested.  Unit test files should be in the same directory as `mod.rs` and their file names should end in `_test.rs`.  A module to be tested should have the test modules annotated with `#[cfg(test)]`.  For example, if in a crate there is a db module, the expected directory structure is as follows:

*单元测试*

理想情况下，所有代码都应进行单元测试。单元测试文件应该和`mod.rs`在同一目录中，并且它们的文件名应该以`_test.rs`结尾。 要测试的模块应使用`#[cfg(test)]`注释测试模块。 例如，如果一个箱子中有一个数据库模块，则预期的目录结构如下：

```
src/db                        -> directory of db module
src/db/mod.rs                 -> code of db module
src/db/read_test.rs           -> db test 1
src/db/write_test.rs          -> db test 2
src/db/access/mod.rs          -> directory of access submodule
src/db/access/access_test.rs  -> test of access submodule
```

*Property-based tests*

Libra contains [property-based tests](https://blog.jessitron.com/2013/04/25/property-based-testing-what-is-it/) written in Rust using the [`proptest` framework](https://github.com/AltSysrq/proptest). Property-based tests generate random test cases and assert that invariants, also called *properties*, hold for the code under test.

Some examples of properties tested in Libra:

* Every serializer and deserializer pair is tested for correctness with random inputs to the serializer. Any pair of functions that are inverses of each other can be tested this way.
* The results of executing common transactions through the VM are tested using randomly generated scenarios and verified with an *oracle*.

A tutorial for `proptest` can be found in the [`proptest` book](https://altsysrq.github.io/proptest-book/proptest/getting-started.html).

References:

* [What is Property Based Testing?](https://hypothesis.works/articles/what-is-property-based-testing/) (includes a comparison with fuzzing)
* [An introduction to property-based testing](https://fsharpforfunandprofit.com/posts/property-based-testing/)
* [Choosing properties for property-based testing](https://fsharpforfunandprofit.com/posts/property-based-testing-2/)

*Conditional compilation of tests*

Libra [conditionally compiles](https://doc.rust-lang.org/stable/reference/conditional-compilation.html) code that is *only relevant for tests, but does not consist of tests* (unitary or otherwise). Examples of this include proptest strategies, implementations and derivations of specific traits (e.g. the occasional `Clone`), helper functions, etc. Since Cargo is [currently not equipped for activating features in benchmarks](https://github.com/rust-lang/cargo/issues/2911), we rely on two conditions to perform this conditional compilation:
- the test flag, which is activated by dependent test code in the same crate as the conditional test-only code.
- the "testing" custom feature, activated by dependent test code in another crate as the conditional test-only code (as below).

As a consequence, it is recommended that you set up your test-only code in the following fashion. For the sake of example, we'll consider you are defining a test-only helper function `foo` in `foo_crate`:
1. Define the "testing" flag in `foo_crate/Cargo.toml` and make it non-default:
    ```
    [features]
    default = []
    testing = []
    ```
2. Annotate your test-only helper `foo` with both the `test` flag (for in-crate callers) and the `"testing"` custom feature (for out-of-crate callers):
    ```
    #[cfg(any(test, feature = "testing"))]
    fn foo() { ... }
    ```
3. Add a dev-dependency activating the "testing" feature to crates that import this test-only member:
    ```
    [dev-dependencies.foo_crate]
    path = { "<same as the one in [dependencies]>"}
    features = ["testing"]
    ```
4. (optional) Use `cfg_attr` to make test-only trait derivations conditional:
    ```
    #[cfg_attr(any(test, feature = "testing"), derive(FooTrait))]
    #[derive(Debug, Display, ...)] // inconditional derivations
    struct Foo { ... }
    ```
5. (optional) Set up feature transitivitity for crates that call crates that have test-only members. Let's say it's the case of `bar_crate`, which, through its test helpers, calls into `foo_crate` to use your test-only `foo`. Here's how you would set up `bar_crate/Cargo.toml`:
    ```
    [features]
    default = []
    testing = ["foo_crate/testing"]
    ```

*A final note on integration tests*: All tests that use conditional test-only elements in another crate need to activate the "testing" feature through the `[features]` section in their `Cargo.toml`. [Integration tests](https://doc.rust-lang.org/rust-by-example/testing/integration_testing.html) can neither rely on the `test` flag nor do they have a proper `Cargo.toml` for feature activation. In the Libra codebase, we therefore recommend that *integration tests which depend on test-only code in their tested crate* be extracted to their own crate. You can look at `language/vm/serializer_tests` for an example of such an extracted integration test.

*Note for developers*: The reason we use a feature re-export (in the `[features]` section of the `Cargo.toml` is that a profile is not enough to activate the `"testing"` feature flag. See [cargo-issue #291](https://github.com/rust-lang/cargo/issues/2911) for details).

*Fuzzing*

Libra contains harnesses for fuzzing crash-prone code like deserializers, using [`libFuzzer`](https://llvm.org/docs/LibFuzzer.html) through [`cargo fuzz`](https://rust-fuzz.github.io/book/cargo-fuzz.html). For more examples, see the `testsuite/libra_fuzzer` directory.
