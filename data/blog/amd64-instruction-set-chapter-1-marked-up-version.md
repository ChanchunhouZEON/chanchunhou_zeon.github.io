---
title: AMD64 Instruction Set Ch-1 (marked-up version)
date: '2026-03-08'
excerpt: The overall view of the AMD64 Volume 2 book which theme is system programming
tags:
  - instruction set
  - system programming
category: system-programming
order: 0
---
### Memory Addressing

**Logical Addresses**: a reference into a segmented-address space.
>[!Definition]
> Logical Address = Segment Selector : <span style="color:#D0F4DE">offset</span>

- Segment Selector: an entry in global/local descriptor table.

| virtual-address space | size | other characteristics |
| --------------------- | ---- | --------------------- |

Additional:
- logical address often referred to *far* pointer.

**Effective Addresses**: The <span style="color:#D0F4DE">offset</span> into a memory segment is referred as an effective address.
>[!Definition]
> Effective Address = Base + (Scale x Index) + Displacement

- *Base*: A value stored in any general-purpose register.
- *Scale*: A positive value of 1, 2, 4, 8.
- *Index*: A two's-complement value stored in any general-purpose register.
- *Displacement*: An 8-bit, 16-bit, or 32-bit two's complement value encoded as part of the instruction.
Additional:
- effective address is often referred to as *near pointers*, used when the segment selector is known implicitly or when the flat-memory model is used.
- Long mode defines an *64*-bit effective address length. *If a processor implementation does not support the full 64-bit virtual-address space, the effective address must be in <span style="color:#A9DEF9">canonical form</span>*.

**Linear(Virtual) Addresses**: formed by adding the segment-base address to the effective address space.
>[!Definition]
> Linear Address = Segment Base Address + Effective Address

Additional:
- When the *flat-memory* model is used(as in *64*-bit mode, a segment-base address is treated as 0), linear address = effective address.
- When in the *long* mode, linear address must be in <span style="color:#A9DEF9">canonical form</span>.

**Physical Addresses** : a reference into the physical-address space(main memory).
- physical addresses are translated from virtual addresses using page-translation mechanisms.
Additional:
 - When the page mechanism is not enabled, *virtual address* = *physical address*.

### Memory Organization

**Virtual Memory**: 
- Protected Mode: 4GB, 32-bit virtual addresses.
- Long Mode: 16EB, 64-bit virtual addresses.
**Physical Memory**
- Real-Address Mode: 1MB physical-address space using 20-bit physical addresses. Real mode is available only from <span style="color:#D4A373">legacy mode</span>.
- Legacy Protected Mode: supports different address-space sizes, depending on the translation mechanism used and whether extensions to those mechanisms are enabled.
	- 4GB physical address space(32-bit physical addresses).Both *segment translation* and *page translation* can be used to access the physical address space.
	- When the physical-address size extensions(**PAE**) are enabled, the page-translation mechanism can be extended to support 52-bit physical address.
- Lone mode: unique to the AMD64 arch. 
	- 4PB physical-address space using(52-bit).
	- requires the use of page-translation and **PAE**.

### Canonical Address Form
**Canonical Address Form**: processor all check bits 63 through the most significant bit to see if those bits are all zeros/ all ones.
- A virtual-memory reference that is not in canonical form causes a general-protection exception(#GP) to occur.
- Implied stack reference when the stack address is not in canonical form causes a stack exception(#SS) to occur. Implied stack references include all push and pop instructions, and any instruction using *RSP*/*RBP* as base register.
Additional:
 - By checking the canonical-address form, the AMD64 arch prevents software from exploiting unused high bits pointers for other purposes.

## Memory Management

### Segmentation

- **Segment descriptor**

| base address value | segment size(limit) | protection | other attributes |
| ------------------ | ------------------- | ---------- | ---------------- |


- **Descriptor table**: collections of segments descriptors.
- **Segment selector register**: specific descriptors are referred/selected from the descriptor table using it.（Six segment-selector registers are available, *providing access to as many as six segments at a time*).

	![[image/amd64/vol2/chap-01/segment-address-computering.png]]
- **Flat Segmentation**: In the *legacy-flat-memory* model, all segment-base address have value of 0, and the segment limits are fixed at 4 GB.The result is *virtual address* = *effective address*.
	![[image/amd64/vol2/chap-01/flat-memory-model.png]]

### Paging

- Page size supported: 4KB, 2MB, 4MB.
- As with segment transition, access to physical pages by lesser-privileged software can be restricted.
- **Page translation**: uses a hierarchical data structure called a page-translation table to translate virtual pages into physical-pages. The number of levels in the translation-table hierarchy ranges from \[1, 4\]. 
	1. The lowest-level table, its entry -> physical page address.
	2. The physical page is then indexed by the least-significant bits of the virtual address to *yield* the physical address.
	![[image/amd64/vol2/chap-01/paged-memory-model.png]]
	Additional:
	- Software running in *long mode* is required to have page translation enabled.

### Mixing Segmentation and Paging
>[!warning]
> Segmentation cannot be disabled, paged-memory management requires some minimum initialization of the segment resources.

>[!warning]
>Paging can be completely disabled, so segmented-memory management does not require initialization of the paging resources.

>[!warning]
>Segments can range in size from a single bytes to 4GB in length. It is therefore possible to <span style="color:#EDAFB8">map multiple segments to single physical page</span> and to <span style="color:#EDAFB8">map multiple physical pages to a single segments</span>.
>(Alignment between segment and physical-page boundaries is not required, but memory-management software is simplified when segment and physical-page boundaries are aligned)

- **flat-memory model**: 
	1. All segment base address have value of 0.
	2. Segments limits are fixed at 4GB.
	- Additional: The segmentation mechanism is still used each time a memory reference is made, *but because virtual address are identical to the effective addresses in this model, the segmentation mechanism is effectively ignored*. Translation of virtual addresses to physical address takes place using *page mechanism* only.
	![[image/amd64/vol2/chap-01/flat-64bit.paged-memory-model.png]]

- **Real Addressing**
	- A <span style="color:#D4A373">legacy mode</span> form of address translation used in real mode.
	- backward compatible with 8086-processor effective-to-physical address translation.
	- 16-bit *effective address* -> 20-bit *physical address*, 1MB physical-address space.
	- <span style="color:#FFD60A">Segment selectors are used in real-address translation, but not as an index into a descriptor table. Instead, the 16-bit segment-selector value is shifted left by 4-bits to form a 20-bit segment-base address.</span>
	- <span style="color:#FFD60A">16-bit effective address is added to this 20-bit segment base address to yield a 20-bit physical address.</span>
	- Support 1MB physical-address space using up to 64K segments aligned on 16-bytes boundaries. Each segment is exactly 64KB long.
	 ![[image/amd64/vol2/chap-01/real-mode.paged-memory-model.png]]
>[!warning]
> If the sum of the segment base and effective address carries over into bit 20, that bit can be optionally truncated to mimic the 20-bit address wrapping of the 8086 processor by A20M# input signal to mask the A20 address bit.
> A20 address bit masking should only be used real mode. Use in other modes result in address translation errors.


## Operating Modes

<span style="color:#D4A373">legacy</span> x86 arch provides 4 operating modes:
- Read Mode
- Protected Mode
- Virtual-8086 Mode
- System Management Mode
Additional: AMD64 adds a new operating mode called *long mode*.
![[image/amd64/vol2/chap-01/operating-mode.table.png]]

Software can move between all supported operating mode as shown below:
![[image/amd64/vol2/chap-01/operating-mode.transist.png]]


### Long Mode
- consists of 2 submodules: *64-bit mode* and *compatibility mode*.
- **64-bit mode**: 
	1. Supports address 64-bit virtual-address space.
	2. Access to General Purpose Register bits 63:32.
	3. Access to additional registers through the REX. VEX, and XOP instruction prefixes:
		- eight additional GPRs(R8-R15).
		- eight additional Streaming SIMD Extension(SSE) registers(YMM/XMM8-15).
	4. 64-bit instruction pointer(RIP).
	5. New RIP-relative data-addressing mode.
	6. Flat-segment address space with single code, data and stack space.
	- Additional:
		1. The mode is enabled by the system software on an <span style="color:#FFD60A">individual code-segment basis</span>.
		2. Requires 64-bit system software and development tools.
		3. Default values: address size: 64bits, operand size: 32bits.(can be overridden on an instruction-by-instruction basis using <span style="color:#FFD60A">instruction prefixes</span>, A new *REX* prefix is introduced for specifying a 64-bit operand size and the new registers)
		
- **Compatibility mode**: allows system software to implement binary compatibility with existing 16-bit & 32-bit x86 applications without recompilation and under 64-bit system software in *long mode*.
	1. Provides binary compatibility with existing 16-bit and 32-bit applications when running on 64-bit system software.
	2. Segmentation functions the same as in the <span style="color:#D4A373">legacy-x86</span> arch, using 16-bit/32-bit protected-mode semantics.
	3. From an application viewpoint, *compatibility mode* ~ *legacy protected-mode*. 
	4. From a system-software viewpoint, the *long mode* mechanisms are used for address translation, interrupt and exception handling, and system data-structures.
	- Additional:
		1. The mode is enabled by the system software on an <span style="color:#FFD60A">individual code-segment basis</span>.
- <span style="color:#FFD60A">Before enabling and activating long mode, system software must first enable protected mode</span>

### Legacy Modes
**Legacy Mode**:(preserves binary compatibility not only with existing x86 16-bit & 32-bit applications but also with existing x86 16-bit & 32-bit system software)
- **Real Mode**
	1. Supports 1MB physical-memory space.
	2. Operand sizes: 16-bit(*default*)/32-bit(*with instruction prefixes*).
	3. Interrupt handling and address generation ~ *80286 processor's real mode*.
	4. Paging is not supported.
	5. All software runs at privilege level 0.
	- Additional:
		1. *Real Mode* is entered after reset/ processor power-up.
		2. *Real Mode* is not supported when the processor is operating in *long mode* because *long mode* requires that *paged protected mode* be enabled.
		
- **protected mode**
	1. Type:
		- Paged: can be optionally enabled to allow *translation of virtual addresses physical addresses* and to use the *page-based memory-protection mechanisms*. 
		- Unpaged: *virtual address* = *physical address*.
	2. Supports *virtual-memory* and 4GB *physical-memory spaces*.
	3. Operand sizes: 16-bit/32-bit.
	4. All segment translation, segment protection and hardware multitasking functions are available.
	5. System software can use segmentation to relocate *effective address* in *virtual-address space*.
	6. Software runs at privilege 0/1/2/3.(<span style="color:#FFD60A">application software runs at privilege level 3, the system software runs at privilege levels 0 & 1, and privilege level 2 is available to system software for other uses</span>, the 16-bit version of this mode was first introduced in the 80286 processor).
	
- **virtual-8086 mode**: allows system software to run 16-bit real-mode software on a virtualized-8086 processor.
	1. Software written for 8086/8088/80186/80188 processor can run as a privilege-level-3 task under *protected mode*.
	2. Supports 1MB *virtual memory space*.
	3. Operand sizes: 16-bit(default)/32-bit(with instruction prefixes).
	4. Uses real-mode address translation.
	5. Enabled by setting the virtual-machine bit in the *EFLAGS* register(*EFLAGS.VM*). <span style="color:#FFD60A">EFLAGS.VM can only set/cleared when the EFLAGS register is loaded from the <span style="color:#FB8500">TSS</span> as a result of a task switch, or by executing and IRET instruction from privilege software. The POPF instruction cannot be used to set/clear the EFLAGS.VM bit</span>.
	- Additional:
		1. *Virtual-8086 mode* is not supported when the processor is operating in *long mode*. When *long mode* is enabled, any attempt to enable *virtual-8086 mode* is silently ignored.

### System Management Mode(SMM)

^aee8ff

*System management mode (SMM)*: is an operating mode designed for system-control activities that are typically transparent to conventional system software.
- One popular use is power management.
- Primarily targeted for use by the basic input-output system(BIOS) & specialized low-level device drivers.
- The code and data for *SMM* are stored in the *SMM* memory area, which is isolated from main memory by the *SMM* output signal.
- <span style="color:#FFD60A">Entered by a system management interrupt(SMI). Upon recognizing a SMI, the processor enters SMM and switches to a separate address space where SMI handler is located and executes</span>.
- Supports real-mode addressing with 4GB segment limits & default operand, address, and stack size of 16-bits(prefixes can be used to override these defaults).

## System Registers
The *system registers* include:
- **Control Registers**: used to control system operation and some system features.
- **System-Flags Registers**: the *RFLAGS* register contains system-status flags and masks. It is also used to enable *virtual-8086 mode* and to control application access to I/O devices and interrupts.
- **Descriptor-Table Registers**: contain the location and size of descriptor tables stored in memory. <span style="color:#FFD60A">Descriptor table hold segmentation data structures used in protected mode.</span>
- **Task Register**: contains the location and size in memory of the <span style="color:#FB8500">task-state segment</span>(*PCB*). The hardware-multitasking mechanism uses the <span style="color:#FB8500">task-state segment</span> to hold state information for a given task. The <span style="color:#FB8500">TSS</span> also holds other data, such as the inner-level stack pointers used when changing to higher privilege level.
- **Debug Registers**: used to control the software-debug mechanism, and to report information back to a debug utility/application.
- **Extended-Feature-Enable Register**: used to enable and report status on special features not controlled by *CRn* control register. In particular, *EFER* is used to control activation of long mode.
- **System-Configuration Register**: The *SYSCFG* register is used to enable and configure *system-bus* features.
- **System-Linkage Registers**: used by system-linkage instructions to specify operating-system entry points, stack locations, and pointers into system-data structures.
- **Memory-Typing Registers**: used to characterize(type) system memory. <span style="color:#FFD60A">Typing memory gives system software control over how instructions and data are cached, and how memory reads and writes are ordered</span>.
- **Debug-Extension Registers**: control additional software-debug reporting features.
- **Performance-Monitoring Registers**: used to count processor and system events, or the duration of events.
- **Machine-Check Register**: control the response of the processor to non-recoverable failures. They are also used to report information on such failures back to system utilities designed to respond to such failures.
	![[image/amd64/vol2/chap-01/system-registers.png]]

## System-Data Structures
<span style="color:#FFD60A">System-data structure are created and maintained by system software for use by the processor when running in protected mode.</span> A processor in protected mode uses these data structures to manage memory and protection, and to store program-state information when an interrupt/task switch occurs.

The system-data structures include:
- **Descriptors**: provides information about a segment to the processor(location, size, privilege level).
	1. <span style="color:#FFD60A">A special type of descriptor, called gate, is used to provide a code selector and entry point for a software routine.(e.g. Interrupt)</span>
	2. Any number of descriptors can be defined, but system software must at a minimum create a descriptor for the currently executing *code segment* and *stack segment*.
- **Descriptor Tables**: hold descriptors.The global-descriptor table holds descriptors available to **all programs**, while a local-descriptor table holds descriptors used by a **single program**. The interrupt-descriptor table holds only gate descriptors used by **interrupt handlers**. System software must initialize the global-descriptor and interrupt-descriptor tables, while use of the local-descriptor table is optional.
- **Task-State Segment**: a special segment for holding processor-state information for a specific program, or task. 
	1. Contains the stack pointers used when switching to more-privileged programs(switch-in kernel).
	2. Hardware multitasking mechanism uses the state information in the segment when suspending and resume a task. f
	3. Calls and interrupts that switch stacks cause the stack pointers to be read from the task-state segment.
	4. System software must crate at least **one** *task-state segment*.
- **Page-Translation Tables**: optional in *protected mode*, required in *long mode*.
	1. 4-level: *long-mode* OS uses it to translate 64-bit virtual-address space into 52-bit physical-address space.
	2. 2-level/3-level: *legacy protected mode* uses it. 
![[image/amd64/vol2/chap-01/system-data-structures.png]]


## Interrupt
>[!Definition]
> Interrupt: A mechanism for the processor to automatically suspend(interrupt) software execution and transfer control to an interrupt handler when an interrupt/exception occurs.

>[!Definition]
>Interrupt handler: privileged software designed to identify and respond to the cause of an interrupt/exception, and return control back to the interrupted software.

Caused reason:
- **Interrupt**: 
	1. Software that executes an interrupt instruction.
	2. System hardware signals an interrupt condition using one of the external-interrupt signals on the processor.
- **Exceptions**: 
	1. Detect an abnormal condition as a result of executing an instruction.

>[!tip]
> System software *not only* sets up the **interrupt handlers**, *but* it must also create and initialize the <span style="color:#FB8B24">data structures</span> the processor uses to execute an interrupt handler when an interrupt occurs. 
> <span style="color:#FB8B24">The data structures include the code-segment descriptors for the interrupt-handler software and any data-segment descriptors for data & stack accesses. </span> **Interrupt gates** must also be supplied.

>[!tip]
><span style="color:#FB8B24">Interrupt gates point to interrupt-handler code-segment descriptors, and the entry point in an interrupt handler. Interrupt gates are stored in the interrupt-descriptor table. The code-segment and data-segment descriptors are stored in the global-descriptor table and, optionally, the local-descriptor table.</span>

The procedure of processor handles an interrupt:
1. Uses the interrupt vector to find the appropriate *interrupt gate* in the interrupt-descriptor table.(The gate points to the interrupt-handler code segment and entry point).
2. Transfers control to that location.
3. Saves information required to return to the interrupted program.
4. Invoke the interrupt handler.

The following figure shows the supported interrupts and exceptions, ordered by their vector number.
![[image/amd64/vol2/chap-01/interrupt-table.png]]


## Additional System-Programming Facilities
### Hardware Multi-tasking

>[!Definition]
> task: any program that the processor can execute, suspend, and later resume executing at the point of suspension.

>[!tip]
> Each task has its own execution space, consisting of a code segment, data segment, and **a stack segment for each privilege level**. Task can also have their own virtual-memory environment managed by the page-translation mechanism. The state defining this execution space is stored in the <span style="color:#FB8500">task-state segment(TSS)</span>. maintained for each task.
> 

>[!tip]
> Support for hardware multitasking is provided by implementations of the AMD64 arch when software is running in **legacy mode**. Hardware multitasking provides automated mechanisms for switching tasks, saving the execution state of the suspended task, and restoring the execution state of the resumed task. When hardware multitasking is used to switch tasks, the processor takes the following actions:
> - The processor automatically suspends execution of the task, allowing any executing instructions to complete and save their results.
> - The execution state of a task is saved in the task <span style="color:#FB8500">TSS</span>.
> - The execution state of a new task is loaded into the processor from its <span style="color:#FB8500">TSS</span>.
> - The processor begins executing the new task at the location specified in the new task <span style="color:#FB8500">TSS</span>.

>[!tip]
>Use of hardware-multitasking features is optional in legacy mode. Generally, modern operating systems do not use the hardware-multitasking features, and instead perform task management entirely in software. **Long mode does not support hardware multitasking at all.**

>[!tip]
>System software must create and initialize at least one task-state segment data-structure(holds for both long-mode and legacy-mode software). The single <span style="color:#FB8500">TSS</span> holds critical pieces of the task execution environment and is referenced during certain control transfers.

### Machine Check
>[!error]
> The exception allows specialized system-software utilities to report hardware errors that generally severe and unrecoverable.

### Software Debugging
>[!Definition]
> A software-debugging mechanism is provided in hardware to help software developers quickly isolate programming errors. This capability can be used to debug system software & application software alike. <span style="color:#D0F4DE">Only privileged software can access the debugging facilities. Generally, software-debug support is provided by a privileged application program rather than by the operating system itself.</span>

The facilities supported by the AMD64 arch allow debugging software to perform the following:
- Set breakpoints on specific instructions within a program.
- Set breakpoints on an instruction-address match.
- Set breakpoints on a data-address match.
- Set breakpoints on specific I/O-port addresses.
- Set breakpoints to occur on task switches when hardware multitasking is used.
- Single step an application instruction-by-instruction.
- Single step only branches and interrupts.
- Record a history of branches and interrupts taken by a program.

### Performance Monitoring
>[!tip]
> Non-privileged software can access the performance monitoring facilities, but only if privileged software grants that access.

>[!tip]
>The performance-monitoring facilities allow the counting of events, or the duration of events. Performance-analysis software can use the data to calculate the frequency of certain events, or the time spent performing specific activities.
