---
id: bytecode-verifier
title: 字节码验证器
custom_edit_url: https://github.com/deltanet-lab/libra-website-cn/edit/master/docs/crates/bytecode_verifier.md
---


## 概览

The bytecode verifier contains a static analysis tool for rejecting invalid Move bytecode. It checks the safety of stack usage, types, resources, and references.

The body of each function in a compiled module is verified separately while trusting the correctness of function signatures in the module. Checking that each function signature matches its definition is a separate responsibility. The body of a function is a sequence of bytecode instructions. This instruction sequence is checked in several phases described below.

字节码验证器包含一个静态分析工具，用于拒绝无效的Move字节码。它检查堆栈使用、类型、资源和引用的安全性。

因为检查每个函数签名与其定义是否匹配是一项单独的职责，所以在对编译后的模块中每个函数主体分别进行验证时，我们会信任模块中函数签名的正确性。函数体是字节码指令序列。这个指令序列在下面描述的几个阶段中被检查。

## 构建控制流程图（CFG Construction）

A control-flow graph is constructed by decomposing the instruction sequence into a collection of basic blocks. Each basic block contains a contiguous sequence of instructions; the set of all instructions is partitioned among the blocks. Each block ends with a branch or return instruction. The decomposition into blocks guarantees that branch targets land only at the beginning of some block. The decomposition also attempts to ensure that the generated blocks are maximal. However, the soundness of the analysis does not depend on maximality.

通过将指令序列分解为基本块的集合来构造控制流图。每个基本块包含一个连续的指令序列；所有指令的集合在块之间进行分区。每个块以分支或返回指令结束。分解成块保证分支目标只在某个块的开始处着陆。分解还试图确保生成的块是最大的。然而，分析的合理性并不取决于最大化。

## 栈安全（Stack Safety）

The execution of a block happens in the context of a stack and an array of local variables. The parameters of the function are a prefix of the array of local variables. Arguments and return values are passed across function calls via the stack. When a function starts executing, its arguments are already loaded into its parameters. Suppose the stack height is *n* when a function starts executing; then valid bytecode must enforce the invariant that when execution lands at the beginning of a basic block, the stack height is *n*. Furthermore, at a return instruction, the stack height must be *n*+*k* where *k*, s.t. *k*>=0 is the number of return values. The first phase of the analysis checks that this invariant is maintained by analyzing each block separately, calculating the effect of each instruction in the block on the stack height, checking that the height does not go below *n*, and that is left either at *n* or *n*+*k* (depending on the final instruction of the block and the return type of the function) at the end of the block.

块的执行发生在堆栈和局部变量数组的上下文中。函数的参数是局部变量数组的前缀。参数和返回值通过堆栈遍历函数调用。当函数开始执行时，其参数已被加载到其参数中。假设当函数开始执行时堆栈高度为*n*；那么有效字节码必须强制执行，当执行在基本块的开始时，堆栈高度为*n*。此外，在返回指令中，堆栈高度必须是*n*+*k*，其中*k*，s.t.*k*>=0是返回值的个数。分析的第一阶段通过分析每个块来维护该不变量，计算块中的每个指令对堆栈高度的影响，检查高度不低于*N*，在块的末尾，它要么留在*n*或*n*+*k*（取决于块的最终指令和函数的返回类型）。

## 类型安全（Type Safety）

The second phase of the analysis checks that each operation, primitive or defined function, is invoked with arguments of appropriate types. The operands of an operation are values located either in a local variable or on the stack. The types of local variables of a function are already provided in the bytecode. However, the types of stack values are inferred. This inference and the type checking of each operation can be done separately for each block. Since the stack height at the beginning of each block is *n* and does not go below *n* during the execution of the block, we only need to model the suffix of the stack starting at *n* for type checking the block instructions. We model this suffix using a stack of types on which types are pushed and popped as the instruction stream in a block is processed. Only the type stack and the statically-known types of local variables are needed to type check each instruction.

分析的第二阶段检查是否使用适当类型的参数调用了每个操作（原始或定义的函数）。运算的操作数是位于局部变量或堆栈中的值。 函数的局部变量的类型已在字节码中提供。但是，可以推断堆栈值的类型。 可以针对每个块分别进行此推断和每个操作的类型检查。 由于每个块开始处的堆栈高度为*n*，并且在执行该块期间不会低于*n*，因此我们只需对以*n*开头的堆栈后缀进行建模，即可对块指令进行类型检查。我们使用一堆类型对这个后缀进行建模，在处理块中的指令流时，将在这些类型上推送和弹出这些类型。仅需要类型堆栈和静态已知的局部变量类型即可对每个指令进行类型检查。

## 资源安全（Resource Safety）

Resources represent the assets of the blockchain. As such, there are certain restrictions on these types that do not apply to normal values. Intuitively, resource values cannot be copied and must be used by the end of the transaction (this means that they are moved to global storage or destroyed). Concretely, the following restrictions apply:

* `CopyLoc` and `StLoc` require that the type of local is not of resource kind.
* `WriteRef`, `Eq`, and `Neq` require that the type of the reference is not of resource kind.
* At the end of a function (when `Ret` is reached), no local whose type is of resource kind must be empty, i.e., the value must have been moved out of the local.

As mentioned above, this last rule around `Ret` implies that the resource *must* have been either:

* Moved to global storage via `MoveToSender`.
* Destroyed via `Unpack`.

Both `MoveToSender` and `Unpack` are internal to the module in which the resource is declared.

资源代表区块链的资产。因此，对这些类型存在某些限制，这些限制不适用于正常值。直观地讲，资源值无法复制，必须在事务结束时使用（这意味着它们已移至全局存储或已销毁）。具体来说，以下限制适用：

* `CopyLoc`和`StLoc`要求本地类型不是资源类型。
* `WriteRef`，`Eq`和`Neq`要求引用的类型不是资源类型。
* 在函数的末尾（到达`Ret`时），任何类型为资源类型的局部语言都不能为空，即，该值必须已移出局部语言。

如上所述，关于`Ret`的最后一条规则意味着资源*必须*为以下两种情况之一：

* 通过`MoveToSender`移至全局存储。
* 通过`Unpack`销毁。

MoveToSender和Unpack都在声明资源的模块内部。

## 引用安全（Reference Safety）

References are first-class in the bytecode language. Fresh references become available to a function in several ways:

* Inputing parameters.
* Taking the address of the value in a local variable.
* Taking the address of the globally published value in an address.
* Taking the address of a field from a reference to the containing struct.
* Returning value from a function.

The goal of reference safety checking is to ensure that there are no dangling references. Here are some examples of dangling references:

* Local variable `y` contains a reference to the value in a local variable `x`; `x` is then moved.
* Local variable `y` contains a reference to the value in a local variable `x`; `x` is then bound to a new value.
* Reference is taken to a local variable that has not been initialized.
* Reference to a value in a local variable is returned from a function.
* Reference `r` is taken to a globally published value `v`; `v` is then unpublished.

References can be either exclusive or shared; the latter allow read-only access. A secondary goal of reference safety checking is to ensure that in the execution context of the bytecode program — including the entire evaluation stack and all function frames — if there are two distinct storage locations containing references `r1` and `r2` such that `r2` extends `r1`, then both of the following conditions hold:

* If `r1` is tagged as exclusive, then it must be inactive, i.e. it is impossible to reach a control location where `r1` is dereferenced or mutated.
* If `r1` is shared, then `r2` is shared.

The two conditions above establish the property of referential transparency, important for scalable program verification, which looks roughly as follows: consider the piece of code `v1 = *r; S; v2 = *r`, where `S` is an arbitrary computation that does not perform any write through the syntactic reference `r` (and no writes to any `r'` that extends `r`). Then `v1 == v2`.

引用是字节码语言中的第一流。新的引用可以通过几种方式用于功能：

* 输入参数。
* 将值的地址放在局部变量中。
* 在地址中取全球公开值的地址。
* 从引用到包含结构的字段获取地址。
* 从函数返回值。

参考安全检查的目的是确保没有悬挂的参考。以下是一些悬空引用的示例：

* 局部变量`y`包含对局部变量`x`中值的引用；然后`x`被移动。
* 局部变量`y`包含对局部变量`x`中值的引用；然后将`x`绑定到一个新值。
* 引用未初始化的局部变量。
* 从函数返回对局部变量中值的引用。
* 参考`r`取为全球发布的值`v`； `v`则未发布。

引用可以是独占或共享；后者允许只读访问。参考安全检查的第二个目标是确保在字节码程序的执行上下文中-包括整个评估堆栈和所有功能框-如果存在两个包含引用r1和r2的不同存储位置，使得`r2`扩展`r1`，则同时满足以下两个条件：

* 如果`r1`被标记为独占，则它必须是非活动的，即不可能到达`r1`被取消引用或突变的控制位置。
* 如果共享`r1`，则共享`r2`。

上面的两个条件建立了引用透明性，这对于可伸缩程序验证很重要，它看起来大致如下：考虑代码段`v1 = *r; S; v2 = *r`，其中`S`是任意计算，不通过语法引用`r`执行任何写操作（并且不对扩展`r`的任何`r`进行写操作）。然后是`v1 == v2`。

### Analysis Setup

The reference safety analysis is set up as a flow analysis (or abstract interpretation). An abstract state is defined for abstractly executing the code of a basic block. A map is maintained from basic blocks to abstract states. Given an abstract state *S* at the beginning of a basic block *B*, the abstract execution of *B* results in state *S'*. This state *S'* is propagated to all successors of *B* and recorded in the map. If a state already existed for a block, the freshly propagated state is “joined” with the existing state. If the join fails an error is reported. If the join succeeds but the abstract state remains unchanged, no further propagation is done. Otherwise, the state is updated and propagated again through the block. An error may also be reported when an instruction is processed during the propagation of abstract state through a block.

参考安全分析被设置为流分析（或抽象解释）。 定义了一个抽象状态，用于抽象地执行基本块的代码。映射是从基本块到抽象状态的。 给定基本块*B*开头的抽象状态*S*，*B*的抽象执行将导致状态*S'*。状态*S'*会传播到*B*的所有后继，并记录在映射中。 如果某个块的状态已经存在，则将新传播的状态与现有状态“合并”。如果连接失败，将报告错误。如果连接成功，但是抽象状态保持不变，则不会进行进一步的传播。否则，状态将更新并再次通过块传播。 在通过块传播抽象状态期间处理指令时，也会报告错误。

### Abstract State

The abstract state has three components:

* A partial map from locals to abstract values. Locals that are not in the domain of this map are unavailable. Availability is a generalization of the concept of being initialized. A local variable may become unavailable subsequent to initialization as a result of being moved. An abstract value is either *Reference*(*n*) (for variables of reference type) or *Value*(*ns*) (for variables of value type), where *n* is a nonce and *ns* is a set of nonces. A nonce is a constant used to represent a reference. Let *Nonce* represent the set of all nonces. If a local variable *l* is mapped to *Value*(*ns*), it means that there are outstanding borrowed references pointing into the value stored in *l*. For each member *n* of *ns*, there must be a local variable *l* mapped to *Reference*(*n*). If a local variable *x* is mapped to *Reference*(*n*) and there are local variables *y* and *z* mapped to *Value*(*ns1*) and *Value*(*ns2*) respectively, then it is possible that *n* is a member of both *ns1* and *ns2*. This simply means that the analysis is lossy. The special case when *l* is mapped to *Value*({}) means that there are no borrowed references to *l*, and, therefore, *l* may be destroyed or moved.
* The partial map from locals to abstract values is not enough by itself to check bytecode programs because values manipulated by the bytecode can be large nested structures with references pointing into the middle. A reference pointing into the middle of a value could be extended to produce another reference. Some extensions should be allowed but others should not. To keep track of relative extensions among references, the abstract state has a second component. This component is a map from nonces to one of the following two kinds of borrowed information:
* A set of nonces.
* A map from fields to sets of nonces.

The current implementation stores this information as two separate maps with disjointed domains:
  * *borrowed_by* maps from *Nonce* to *Set*<*Nonce*>.
  * *fields_borrowed_by* maps from *Nonce* to *Map*<*Field*, *Set*<*Nonce*>>.
      * If *n2* in *borrowed_by*[*n1*], then it means that the reference represented by *n2* is an extension of the reference represented by *n1*.
      * If *n2* in *fields_borrowed_by*[*n1*][*f*], it means that the reference represented by *n2* is an extension of the *f*-extension of the reference represented by *n1*. Based on this intuition, it is a sound overapproximation to move a nonce *n* from the domain of *fields_borrowed_by* to the domain of *borrowed_by* by taking the union of all nonce sets corresponding to all fields in the domain of *fields_borrowed_by*[*n*].
* To propagate an abstract state across the instructions in a block, the values and references on the stack must also be modeled. We had earlier described how we model the usable stack suffix as a stack of types. We now augment the contents of this stack to be a structure containing a type and an abstract value. We maintain the invariant that non-reference values on the stack cannot have pending borrows on them. Therefore, if there is an abstract value *Value*(*ns*) on the stack, then *ns* is empty.

抽象状态包含三个组成部分：

* 从局部变量到抽象值的局部映射。不在此地图域中的本地人不可用。可用性是对初始化概念的概括。局部变量可能会在初始化后由于被移动而变得不可用。抽象值是*Reference*（*n*）（对于引用类型的变量）或*Value*（*ns*）（对于值类型的变量），其中* n *是随机数，*ns*是a随机数的集合。随机数是用于表示参考的常数。让* Nonce *代表所有随机数的集合。如果将局部变量*l*映射到*Value*（* ns *），则意味着存在指向* l *中存储的值的未完成借用引用。对于* ns *的每个成员* n *，必须有一个映射到* Reference *（* n *）的局部变量* l *。如果将局部变量* x *映射到* Reference *（* n *）并且存在局部变量* y *和* z *分别映射到* Value *（* ns1 *）和* Value *（* ns2 *） ，则* n *可能是* ns1 *和* ns2 *的成员。这仅意味着分析是有损的。 * l *映射到* Value *（{}）的特殊情况意味着没有借用的* l *引用，因此* l *可能被破坏或移动。
*从局部变量到抽象值的局部映射本身不足以检查字节码程序，因为由字节码操纵的值可以是大型嵌套结构，且引用指向中间。指向值中间的引用可以扩展以生成另一个引用。某些扩展名应被允许，而其他扩展名则不应被允许。为了跟踪引用之间的相对扩展，抽象状态具有第二个组件。此组件是从随机数到以下两种借用信息之一的映射：
* 一组随机数。
* 从字段到随机数集的映射。

当前的实现将此信息存储为两个单独的映射，这些映射具有互斥的域：
  * * rowrowed_by *从* Nonce *映射到* Set * <* Nonce *>。
  * * fields_borrowed_by *从* Nonce *映射到* Map * <* Field *，* Set * <* Nonce * >>。
      *如果* borrowed_by * [* n1 *]中的* n2 *，则表示* n2 *表示的引用是* n1 *表示的引用的扩展。
      *如果* fields_borrowed_by * [* n1 *] [* f *]中的* n2 *，则表示* n2 *表示的引用是* n1 *表示的引用的* f *扩展的扩展。根据这种直觉，通过将与*fields_borrowed_by*域中的所有字段相对应的所有随机数集的并集，将随机数* n *从* fields_borrowed_by *的域移动到*borrowed_by*的域是一种声音的近似估计。 [*n*]。
*要在块中的指令之间传播抽象状态，还必须对堆栈上的值和引用进行建模。前面我们已经描述了如何将可用的堆栈后缀建模为类型堆栈。现在，我们将该堆栈的内容扩充为包含类型和抽象值的结构。我们保持不变性，即堆栈上的非引用值不能在它们上面有未决借用。因此，如果堆栈上有一个抽象值*Value*（*ns*），则*ns*为空。


### 值与引用（Values and References）

Let us take a closer look at how values and references, shared and exclusive, are modeled.

* A non-reference value is modeled as *Value*(*ns*) where *ns* is a set of nonces representing borrowed references. Destruction/move/copy of this value is deemed safe only if *ns* is empty. Values on the stack trivially satisfy this property, but values in local variables may not.
* A reference is modeled as *Reference*(*n*), where *n* is a nonce. If the reference is tagged as shared, then read access is always allowed and write access is never allowed. If a reference *Reference*(*n*) is tagged exclusive, write access is allowed only if *n* does not have a borrow, and read access is allowed if all nonces that borrow from *n* reside in references that are tagged as shared. Furthermore, the rules for constructing references guarantee that an extension of a reference tagged as shared must also be tagged as shared. Together, these checks provide the property of referential transparency mentioned earlier.

At the moment, the bytecode language does not contain any direct constructors for shared references. `BorrowLoc` and `BorrowGlobal` create exclusive references. `BorrowField` creates a reference that inherits its tag from the source reference. Move (when applied to a local variable containing a reference) moves the reference from a local variable to the stack. `FreezeRef` is used to convert an existing exclusive reference to a shared reference. In the future, we may add a version of `BorrowGlobal` that generates a shared reference

**Errors.** As mentioned earlier, an error is reported by the checker in one of the following situations:

* An instruction cannot be proven to be safe during the propagation of the abstract state through a block.
* Join of abstract states propagated via different incoming edges into a block fails.

Let us take a closer look at the second reason for error reporting above. Note that the stack of type and abstract value pairs representing the usable stack suffix is empty at the beginning of a block. So, the join occurs only over the abstract state representing the available local variables and the borrow information. The join fails only in the situation when the set of available local variables is different on the two edges. If the set of available variables is identical, the join itself is straightforward &mdash; the borrow sets are joined point-wise. There are two subtleties worth mentioning though:

* The set of nonces used in the abstract states along the two edges may not have any connection to each other. Since the actual nonce values are immaterial, the nonces are canonically mapped to fixed integers (indices of local variables containing the nonces) before performing the join.
* During the join, if a nonce *n* is in the domain of borrowed_by on one side and in the domain of fields_borrowed_by on the other side, *n* is moved from fields_borrowed_by to borrowed_by before doing the join.

### 借用引用（Borrowing References）

Each of the reference constructors ---`BorrowLoc`, `BorrowField`, `BorrowGlobal`, `FreezeRef`, and `CopyLoc`--- is modeled via the generation of a fresh nonce. While `BorrowLoc` borrows from a value in a local variable, `BorrowGlobal` borrows from the global pool of values. `BorrowField`, `FreezeRef`, and `CopyLoc` (when applied to a local containing a reference) borrow from the source reference. Since each fresh nonce is distinct from all previously-generated nonces, the analysis maintains the invariant that all available local variables and stack locations of reference type have distinct nonces representing their abstract value. Another important invariant is that every nonce referred to in the borrow information must reside in some abstract value representing a local variable or a stack location.

### 释放引用（Releasing References）

References, both global and local, are released by the `ReleaseRef` operation. It is an error to return from a function with unreleased references in a local variable of the function. All references must be explicitly released. Therefore, it is an error to overwrite an available reference using the `StLoc` operation.

References are implicitly released when consumed by the operations `ReadRef`, `WriteRef`, `Eq` and `Neq`.

### 全局引用（Global References）

The safety of global references depends on a combination of static and dynamic analysis. The static analysis does not distinguish between global and local references. But the dynamic analysis distinguishes between them and performs reference counting on the global references as follows: the bytecode interpreter maintains a map `M` from an address and fully-qualified resource type pair to a union (Rust enum) comprising the following values:

* `Empty`
* `RefCount(n)` for some `n` >= 0

Extra state updates and checks are performed by the interpreter for the following operations. In the code below, assert failure indicates a programmer error, and panic failure indicates internal error in the interpreter.

```text
MoveFrom<T>(addr) {
    assert M[addr, T] == RefCount(0);
    M[addr, T] := Empty;
}

MoveToSender<T>(addr) {
    assert M[addr, T] == Empty;
    M[addr, T] := RefCount(0);
}

BorrowGlobal<T>(addr) {
    if let RefCount(n) = M[addr, T] then {
        assert n == 0;
        M[addr, T] := RefCount(n+1);
    } else {
        assert false;
    }
}

CopyLoc(ref) {
    if let Global(addr, T) = ref {
        if let RefCount(n) = M[addr, T] then {
            assert n > 0;
            M[addr, T] := RefCount(n+1);
        } else {
            panic false;
        }
    }
}

ReleaseRef(ref) {
    if let Global(addr, T) = ref {
        if let RefCount(n) = M[addr, T] then {
            assert n > 0;
            M[addr, T] := RefCount(n-1);
        } else {
            panic false;
        }
    }
}
```

A subtle point not explicated by the rules above is that `BorrowField` and `FreezeRef`, when applied to a global reference, leave the reference count unchanged. This is because these instructions consume the reference at the top of the stack while producing an extension of it at the top of the stack. Similarly, since `ReadRef`, `WriteRef`, `Eq`, and `Neq` consume the reference at the top of the stack, they will reduce the reference count by 1.

## 模块的代码组织（How is this module organized?）

```text
*
├── invalid_mutations  # Library used by proptests
├── src                # Core bytecode verifier files
├── tests              # Proptests
```
