---
title: AMD64 Instruction Set Ch-3 System-Resources (marked-up version)
date: '2026-03-08'
excerpt: >-
  The operating system manages the software-execution environment and general
  system operation through the use of system resources. System resources consist
  of system registers(control registers and model-specific registers) and
  system-data structures(memory-management and protection tables).
tags:
  - instruction set
  - system programming
category: system-programming
order: 1
---

>[!abstract]
> The operating system manages the software-execution environment and general system operation through the use of system resources. System resources consist of *system registers(control registers and model-specific registers)* and *system-data structures(memory-management and protection tables)*.

## System-Control Registers
The register that control the AMD64 arch operating environment include:
- @ **CR0**: Provides operating-mode controls and some processor-feature controls.
- @ **CR2**: This register is used by the page-translation mechanism. It is loaded by the processor with the *page-fault* virtual address when a *page-fault exception* occurs.
- @ **CR3**: This register is also used by the page-translation mechanism. It contains the base address of the *highest-level* page-translation table, and also contains cache controls for the specified table.
- @ **CR4**: This register contains additional controls for various operating-mode features.
- @ **CR8**: This new register, accessible in 64-bit mode using the *REX* prefix, is introduced by the AMD64 arch. *CR8* is used to prioritize interrupts and is referred to as the *task-priority register*(TPR).
- @ **RFLAGS**: the register contains processor-status and processor-control fields. The status and control fields are used primarily in the management of virtual-8086 mode, hardware multitasking, and interrupts.
- @ **EFER**: The model-specific register contains status and controls for additional features not managed by the *CR0* and *CR4* registers. Included in this register are the *long-mode* enable and activation controls introduced by the AMD64 arch.
- % Additional:
	- % Control registers *CR1*, *CR5-CR7*, and *CR9-CR15* are reserved.
	
>[!info]
> - In legacy mode, all control registers and RFLAGS are <span style="color:#FB8500">32-bit</span>.
> - The **EFER** register is <span style="color:#FB8500">64-bit</span> in all modes.
> - The AMD64 arch expands all 32-bit system-control registers to 64-bit.

>[!important]
> - In 64-bit mode, the *MOVE CRn* instructions read/write all 64-bit of these registers(operand-size prefixes are ignored).
> - The high 32-bit of *CR0* & *CR4* are reserved and must be written with zeros. <span style="color:#FB8500">Writing a 1 to any of the high 32-bit results in a general-protection exception, \#GP(0).</span>
> - All 64 bits of CR2 are writable.
> - <span style="color:#FB8500">The MOV CRn instructions do not check that addresses written to CR2 are within the virtual-address limitation of the processor implementation.</span>

>[!info]
> - In compatibility and legacy modes, control-register writes fill the low 32-bit with data and the high 32-bit with zeros, and control-register reads return only the low 32-bit.

>[!info]
> - All CR3 bits are writable, except for unimplemented physical address bits, which must be cleared to 0.
> - The upper 32-bit of RFLAGS are always read as zero by the processor. Attempt to load the upper 32-bit of RFLAGS with anything other than zero are ignored by the processor.

### CR0 register

>[!important]
> The legacy CR0 register is identical to the low 32-bit of this register(CR0 bits 31:0).

![[image/amd64/vol2/chap-03/cr0.png]]

Functions of the *CR0* control bits are(*unless otherwise noted, all bits are read/write*):
- & **Protected-Mode Enable(PE) Bit**\[*bit 0*\]: enable -> 1; disable -> 0;
	- When the processor is running in protected mode, segment-protection mechanisms are enabled.
	
- & **Monitor Coprocessor(MP) Bit**\[*bit 1*\]: uses with the task-switched control bit(*CR0.TS*) to control whether execution of WAIT/FWAIT instruction causes a *device-not-available exception*(#NM) to occur, as follows:
	- If both the monitor-coprocessor and task-switched bits are set(*CR0.MP=1* and *CR0.TS=1*), then executing the WAIT/FWAIT instruction causes a *device-not-available exception*(\#NM).
	- If either the monitor-coprocessor or task-switched bits are clear(*CR0.MP=0* or *CR0.TS=0*), then executing the WAIT/FWAIT instruction proceeds normally.
 
 >[!attention]
 > Software typically should set *MP* to 1 if the processor implementation supports x87 instructions. This allows *CR0.TS* to completely control when the x87-instruction context is saved as a result of a task switch.
 
 - & **Emulate Coprocessor(EM) Bit**\[*bit 2*\]: 
	 - Software forces all *x87* instructions to cause a *device-not-available exception(#NM)* by setting EM to 1.
	 - Setting *EM* to 1 forces an *invalid-opcode exception(#UD)* when an attempt is made to execute any of the 64-bit/128-bit media instructions except the FXSAVE and FXRSTOR instructions.(Attempting to execute these instructions when EM is set results in an \#NM exception instead).
	 - The exception handlers can emulate these instruction types if desired.
	 - <span style="color:#FFD60A">Setting the EM bit to 1 does not cause an #NM exception when the WAIT/FWAIT instruction is executed</span>.
	 
- & **Task Switched(TS) Bit**\[*bit 3*\]:
	- When an attempt is made to execute an x87 / media instruction while TS=1, a *device-not-available exception(\#NM)* occurs.
	- When a hardware task switch occurs, TS is automatically set to 1. 
	- System software that implements software task-switch mechanism rather than using the hardware task-switch mechanism can still use the *TS* bit to control x87 and media instruction-unit context saves. <span style="color:#FFD60A">In this case, the task-management software uses a MOV CR0 instruction to explicitly set the TS bit to 1 during a task switch. Software can clear the TS bit by either executing the CLTS instruction or by writing to the CR0 register directly. Long-mode system software can use this approach even though the hardware task-switch mechanism is not supported in long mode</span>.
	
>[!tip]
> Software can use this mechanism -- sometimes referred to as *"lazy context-switching"* -- to save the unit contexts before executing the next instruction of those type. <span style="color:#FB8500">As a result, the x87 and media instruction-unit contexts are saved only when necessary as a result of a task switch</span>.

>[!exception]
> The *CR0.MP* bit controls whether the WAIT/FWAIT instruction causes \#NM exception when *TS* = 1

- & **Extension Type(ET) Bit** \[*bit 4*\]: read-only. 

In some early x86 processors, software set ET to 1 to indicate support of the *387DX* math-coprocessor instruction set. This bit is now reserved and forced to 1 by the processor. <span style="color:#FFD60A">Software cannot clear this bit to 0</span>.

- & **Numeric Error(NE) Bit** \[*bit 5*\]: 

*Clearing* the *NE* bit to 0 disables internal control of x87 floating-point exceptions and enables external control.
- When *NE* is cleared to 0, the <span style="color:#FFD60A">IGNNE#</span> input signal controls whether x87 floating-point exceptions are ignored:
	- <span style="color:#FFD60A">IGNNE#</span> = 1, x87 floating-point exceptions are ignored.
	- <span style="color:#FFD60A">IGNNE#</span> = 0, x87 floating-point exceptions are reported by setting the <span style="color:#FFD60A">FERR#</span> = 1. External logic can use the <span style="color:#FFD60A">FERR#</span> as an external interrupt.
 
>[!exception]
> When *NE* = 1, internal control over x87 floating-point exception reporting is enabled and the external reporting mechanism is disabled. It is recommended that software set *NE* = 1. This enables optimal performance in handling x87 floating-point exceptions.

- & **Write Protect(WP) Bit** \[*bit 16*\]. 

<span style="color:#FFD60A">read-only pages are protected from supervisor-level writes when the WP bit is set to 1. When WP us cleared to 0, supervisor software can write into read-only pages</span>.


- & **Alignment Mask(AM) Bit** \[*bit 18*\]. 

Software enables automatic alignment checking by setting the *AM* = 1 when *RFLAGS.AC* = 1. Alignment checking can be disabled by clearing either *AM* or *RFLAGS.AC* to 0. 

>[!exception]
> When automatic alignment checking is enabled and CPL = 3, a memory reference to an unaligned operand causes an *alignment-check exception(\#AC)*. 


- & **Not Write through(NW) Bit** \[*bit 29*\]. Ignored.

This bit can be set to 1/ cleared to 0, but its value is ignored. The *NW* bit exists only for legacy purposes.


- & **Cache Disable(CD) Bit** \[*bit 30*\]. 

When *CD* = 1, no new data/instructions are brought into the internal caches. <span style="color:#FFD60A">However, The processor still accesses the internal caches when CD = 1 under the following situations</span>:
 - Reads that hit in an internal cache cause the data to be read from the internal cache that *reported* the hit.
  - Writes that hit in internal cache cause the cache line that reported the hit to be *written back* to memory and *invaliding the cache*.
Cache misses do not affect the *internal caches* when *CD* = 1. Software can prevent cache access by setting *CD* to 1 and invalidating the caches.

>[!note]
> Setting *CD* to 1 also causes the processor to ignore the page-level cache-control bits(*PWT* and *PCD*) when paging is enabled. **These bits are located in the page-translation tables and CR3 register**.


- & **Paging Enable(PG) Bit** \[*bit 31*\]. Enable Page transition: *PG* = 1; Disable: *PG* = 0;

>[!caution]
> Page translation cannot be enabled *unless* the processor is in protected mode(*CR0.PE*=1). If software attempts to set *PG* = 1 when *PE* = 0, the processor causes a *general-protection exception(\#GP)*


- % **Reserved Bits** \[*bit 28:19, 17, 15:6, 63:32*\]

>[!caution]
> - When writing the *CR0* register, software should set the values of reserved bits to the values found during the previous *CR0* read.
> - No attempt should be made to change reserved bits.
> - Software should never rely on the values of reserved bits.
> - In *long mode*, bits 63:32 are reserved and *must* be written with zero, otherwise \#GP occurs.


### CR2 and CR3 register

<span style="color:#FFD60A">CR2(page-fault linear address) register</span>:
![[image/amd64/vol2/chap-03/cr2.png]]


<span style="color:#FFD60A">CR3 register is used to point to the base address of the highest-level page-translation table</span>.
![[image/amd64/vol2/chap-03/cr3.1.png]]
![[image/amd64/vol2/chap-03/cr3.2.png]]


### CR4 Register

>[!important]
> - In legacy mode, the *CR4* register is identical to the low 32-bit of the register(*CR4* bits \[31:0\])
> - The features controlled by the bits in the *CR4* register are *model-specific* extensions.(except for the performance-counter extensions(PCE) feature, <span style="color:#FB8500">software can use the CPUID instruction to verify that each feature is supported before using that feature.</span>)

![[image/amd64/vol2/chap-03/cr4.png]]

The function of the CR4 control bits are(*all bits are read/write*):
- & **Virtual-8086 Mode Extensions (VME) Bit**. \[*bit 0*\]. 

Enables hardware-supported performance enhancements for software running in *virtual-8086 mode*. 
	1. Virtualized, maskable, external-interrupt control and notification using *VIF* and *VIP* bits in the *RFLAGS* register.(*Virtualizing affects the operation of several instructions that manipulate the RFLAGS.IF bit*).
	2. Selective intercept of software interrupts (*INTn* instruction) using the <span style="color:#A8DADC">interrupt-redirection bitmap</span> in the <span style="color:#FB8500">TSS</span>.



- & **Protected-Mode Virtual Interrupts(PVI) Bit**. \[*bit 1*\].
	1. When *PVI* = 1, hardware support of two bits in the *RFLAGS* register, *VIF* and *VIP*, is enabled.
	2. Only the *STI* and *CLI* instructions are affected by enabling *PVI*.
	3. *Unlike the case when CR4.VME=1*, the <span style="color:#A8DADC">interrupt-redirection bitmap</span> in the <span style="color:#FB8500">TSS</span> cannot be used for selective *INTn* interception.
	- Additional:
		1. Also supported in long mode.



- & **Time-Stamp Disable(TSD) Bit**. \[*bit 2*\]. 

Allows software to control the privilege level at which the time-stamp counter can be read.
 - When *TSD* = 0, software running at any privilege level can read the time-stamp counter using the *RDTSC*/*RDTSCP* instructions.
 - When *TSD* = 1, is set to 1, only software running at privilege-level 0 can execute the *RDTSC*/*RDTSCP* instructions.



- & **Debugging Extensions(DE) Bit.** \[*bit 3*\]. 

Enables the I/O breakpoint capability and enforces treatment of the *DR4* and *DR5* registers as reserved.
 - When *DE* = 0, I/O breakpoint capabilities are disabled. Software references to the *DR4* and *DR5* registers are aliased to the *DR6* and *DR7* registers, respectively.
	
>[!exception]
> When *TSD* = 1, software that accesses *DR4* or *DR5* causes a *invalid opcode exception(\#UD)*



- & **Page-Size Extensions(PSE) Bit**. \[*bit 4*\]. 
Enables the use of 4MB physical pages.
- With *PSE* = 1, the physical-page size is selected \[4KB, 4MB\] using the *page-directory entry page-size field(PS)*.
- With *PSE* = 0, disables the use of 4MB physical pages and restricts all physical pages to 4KB.

>[!info]
> The *PSE* bit has no effect when the *physical-address extensions* are enabled(*CR4.PAE=1*). Because long mode requires *CR4.PAE* = 1, the *PSE* bit is ignored when the processor is running in long mode.



- & **Physical-Address Extension(PAE) Bit**. \[*bit 5*\]. 

Enables the use of physical-address extensions and 2MB physical pages. Disables PAE = 0.
- With *PAE* = 1,
	1. The page-translation data structure are expanded from 32-bit to 64-bit, allowing the translation of up to 52-bit physical address.
	2. The physical-page size is selectable \[4KB, 2MB\] using the *page-directory entry page-size field(PS)*

>[!caution]
> *Long mode* requires *PAE* to be enabled in order to use the 64-bit page-translation data structures to translate 64-bit virtual addresses to 52-bit physical addresses.



- & **Machine-Check Enable(MCE) Bit**. \[*bit 6*\] 

Enables *machine-check exception mechanism*. Disables *MCE* = 0.

>[!exception]
> When enabled, a *machine-check exception(\#MC)* occurs when an uncorrectable machine-check error is encountered.

>[!note]
> - Regardless of whether *machine-check exceptions* are enabled, the processor records enabled-errors when they occur.
> - Error reporting is performed by the machine-check error-reporting <span style="color:#D0F4DE">register banks</span>.
> - Each <span style="color:#D0F4DE">bank</span> includes a control register for enabling *error reporting* and a *status register* for capturing errors.
> - Correctable machine-check error are also reported, but they do not cause a machine-check exception.



- & **Page-Global Enable(PGE) Bit**. \[*bit 7*\]

>[!tip]
> When page translation is enabled, system-software performance can often be improved by making some page translations *global* to all tasks and procedures. Setting *PGE* = 1 enables the global-page mechanism. Disables *PGE* = 0.

>[!note]
> - When *PGE* = 1, system software can set the global-page(G) bit in the *lowest level* of the page translation hierarchy to 1(indicating that the page translation is global).
> - Page translations marked as global are not invalidated in the TLB when the *page-translation-table base address(CR3)* is updated.
> - When the *G* bit is cleared, the page translation is not global.

>[!info]
> All supported physical-page sizes also support the global-page mechanism.




- & **Performance-Monitoring Counter Enable(PCE) Bit**. \[*bit 8*\].

>[!note]
> - When *PCE* = 1 allows software running at any privilege level to use the *RDPMC* instruction.
> - When *PCE* = 0, allows only the most-privileged software(CPL=0) to use the RDPMC instruction.

>[!info]
> - Software uses the *RDPMC* instruction to read the performance-monitoring counter MSRs, *PerfCtrn*.




- & **FXSAVE/FXSTOR Support(OSFXSR) Bit** \[*bit 9*\]. System software *must* set the *OSFXSR* bit to 1 to enable use of the legacy <span style="color:#FFD60A">SSE</span> instructions.

>[!note]
> - When OSFXSR = 1, it also indicates that system software use the *FXSAVE* & *FXSAVE* instructions to save the restore the processor state for x87, 64-bit media, and 128-bit media instructions.

>[!exception]
> - When OSFXSR = 0, indicates that legacy SSE instructions cannot be used. Attempts to use those instructions result in an *invalid-opcode exception(\#UD)*.(Software can continue to use the *FXSAVE/FXSTORE* instructions for saving an restore the processor state for the x87 and 64-bit media instructions).



- & **Unmasked Exception Support(OSXMMEXCPT) Bit**. \[*bit 10*\].

>[!exception]
> - System software must set the *OSXMMEXCPT* bit to 1 when it supports the <span style="color:#F9A620">SIMD floating exception(#XF)</span> for handling unmasked 256-bit and 128-bit media floating-point errors.
> - When *OSXMMEXCPT* = 0, unmasked 128-bit media floating-point exceptions cause an <span style="color:#F9A620">invalid-opcode exception(#UD)</span>.



- & **User Mode Instruction Prevention(UMIP) Bit**. \[*bit 11*\]. 

Setting *UMIP* to 1 enables a security mode to restrict certain instructions executing at *CPL* > 0 so that they do not reveal information about structures that are controlled by the processor when it is at *CPL* = 0.

>[!exception]
> When *UNIP* is enabled, execution of *SGDT*, *SIDT*, *SLDT*, *SMSW*, and *STR* instructions become available only at *CPL* = 0 and any attempt to execute them with *CPL* > 0 result in a *\#GP* fault with error code 0.



- & **5-Level Paging Enable(LA57) Bit**. \[*bit 12*\]. 

Setting this bit to 1 while *EFER\[LMA\]=1* enables 5-level paging.

>[!important]
> 5-level paging allows for the translation of up to 57 virtual address bits. See [[chap-05-Page Translation and Protection#Long-Mode Page Translation|Long-Mode Page Translation]] for description of 4-Level and 5-Level paging.



- & **FSGBASE Bit**. \[*bit 16*\]. 


System software must set this bit to 1 to enable the execution of *RDFSBASE*, *RDGSBASE*, *WRFSBASE*, *WRGSBASE* instructions when supported. 

>[!note]
> When enabled, these instructions allow software running in 64-bit mode at any privilege level to read and write the *FS.base* and *GS.base* hidden segment register state.



- & **Processor Context Identifier Enable(PCIDE) Bit**. \[*bit 17*\]. 

Enable support for Process Context Identifiers(*PCIDs*).

>[!warning]
> - System software must set this bit to 1 to enable execution of the *INVPCID* instruction when supported.
> - Can only be set in *long* mode (*EFER.LMA=1*), See [[chap-05-Page Translation and Protection#Process Context Identifier|Process Context Identifier]] for more information.



- & **XSAVE and Extended States(OSXSAVE) Bit**. \[*bit 18*\]. 

>[!procedure]
> After verifying hardware support for the extended processor state management instructions, operating system sets this bit to indicate support for the *XGETBV*, *XSAVE*, and *XRSTOR* instructions.

>[!note]
> Setting this bit also:
> - allows the execution of the *XGETBV* and *XSETBV* instructions.
> - enables the *XSAVE* and *XRSTOR* instructions to save and restore the x86 FPU state(including MMX registers), along with other processor extended states enabled in *XCR0*.

After initializing the *XSAVE/XRSTOR* save area, *XSAVEOPT* (if supported) may be used to save x87 FPU and other enabled extended processor state.

>[!warning]
> legacy SSE instruction execution must be enabled prior to enabling extended processor state management.


- & **Supervisor Mode Execution Prevention(SMEP) Bit**. \[*bit 20*\]. 

Setting this bit enables the supervisor mode execution prevention feature, if supported. The feature prevents the execution of instructions that reside in pages accessibly by user-mode software when the processor is in supervisor-mode. See [[chap-05-Page Translation and Protection#Page-Protection Checks|Page-Protection Checks]] for more information.



- & **Supervisor Mode Access Prevention(SMAP) Bit**. \[*bit 21*\]. 

Setting this bit enables the supervisor mode access prevention feature, if supported. This feature prevents certain data accesses to page accessible by user-mode software when the processor is in supervisor mode. See [[chap-05-Page Translation and Protection#|Supervisor-Mode Access Prevention(CR4.SMAP) Bit]] for more information.



- & **Protection Key Enable(PKE) Bit***. \[*bit 22*\]. 

Enable support for memory Protection Keys. Also enables support for *RDPKRU* and *WRPKRU* instructions. A *MOV* to *CR4* that changes *CR4.PKE* from 0 to 1 causes all cached entries in *TLB* for the logical processor to be invalidated.



- & **Control-flow Enforcement Technology(CET) Bit**. \[*but 23*\]. 

Setting this bit enables the shadow stack feature.

>[!caution]
> This feature ensures that return addresses read from the stack by *RET* and *IRET* instructions originated from a *CALL* instruction or similar control transfer.

>[!exception]
> Before setting this bit, *CR0.WP* must be set to 1, otherwise a *\#GP* fault is generated.



### CR1 and CR5-CR15 Registers

>[!exception]
> Control registers *CR1*, *CR5-CR7*, and *CR9-CR15* are reserved. Attempts by software to use the these registers result in an *undefined-opcode exception(\#UD)*

### Additional Control Registers in 64-Bit-Mode

>[!important]
> In *64-bit mode*, additional encodings are available to address up 8 additional control registers. The *REX.R* bit, in *REX* prefix, is used to modify the *ModRM* reg field when that field encodes a control register. as shown in *"REX Prefixes"*. These additional encodings enable the processor to address *CR8-CR15*.

- @ **CR8**: defined in 64-bit mode for all hardware implementations, described in *"CR8(Task Priority Register, TPR)"*.
- @ **CR9-CR15**: access is implementation-dependent.

>[!exception]
> Any attempt to access an unimplemented register results in an *invalid-opcode exception(\#UD)*.



### RFLAGS REGISTER

The **RFLAGS** register contains two different types of information:
- & **Control bits**: provide system-software controls and directional information for string operations. *Some of these bits can have privilege-level restrictions*.
- & **Status bits**: provide information resulting from *logical* & *arithmetic* operations. *These are written by the processor and can be read by software running at any privilege level*.
![[image/amd64/vol2/chap-03/rflags.png]]


The functions of *RFLAGS* system bits are(*unless otherwise noted, all bits are read/write*):
- & **Trap Flag(TF) Bit.** \[*bit 8*\]. 

Software sets the *TF* bit to 1 to enable single-step mode during software debug.

>[!exception]
> - When single-step mode is enabled, *a debug exception(\#DB)* occurs after each instruction completes execution.
> - Single stepping begins with the instruction following the instruction sets *TF*.
> - Single stepping is disabled(TF = 0) when *\#DB exception* occurs or when any exception/interrupt occurs.



- & **Interrupt Flag(IF) Bit**. \[*bit 9*\]. 

Software sets the *IF* = 1 to enable *maskable interrupts*. Clearing *IF* = 0 causes the processor to ignore maskable interrupts.

>[!note]
> The state of the *IF* bit does not affect the response of a processor to *non-markable interrupts*, *software-interrupt instructions*, or *exceptions*.

 The ability to modify the *IF* bit depends on several factors:
 - The current privilege-level (*CPL*)
 - The I/O privilege level(*RFLAGS.IOPL*)
 - Whether or not virtual-8086 mode extensions are enabled(*CR4.VME=1*)
 - Whether or not protected mode virtual interrupts are enabled(*CR4.PVI=1*)



- & **I/O Privilege Level(IOPL) Field**. \[*bit 13:12*\] 

specifies the privilege level required to execute I/O address-space instructions(*i.e. instruction that address the I/O space rather than memory-mapped I/O, such as IN, OUT, INS, OUTS, etc.*)
- The current privilege-level(*CPL*) must be equal to or higher than(lower numerical than) that specified by *IOPL*(*CPL* <= *IOPL*).

>[!exception]
> If the *CPL* is lower than (higher numerical value than) that specified by the *IOPL* (*CPL* > *IOPL*), the processor causes a *general-protection exception (\#GP)* when software attempts to execute an I/O instruction.

>[!important]
> - In *virtual-8086 mode*, processor uses *IOPL* to control virtual interrupts and the IF bit (triggered with *CR4.VME = 1*).
> - In *protected-mode*, *virtual-interrupt mechanism(PVI)* also uses *IOPL* to control virtual interrupts and *IF* bit when *PVI* is enabled (*CR4.PVI=1*).



- & **Nested Task(NT) Bit**.\[*bit 14*\] 

*IRET* reads the *NT* bit to determine whether the current task is nested within another task.
- When *NT* = 1, the current task is nested within another task.
- When *NT* = 0, the current task is at the top level(not nested).

>[!note]
> The processor sets the *NT* bit during a task switch resulting from a CALL, interrupt, or exception through a task gate.
> - When an *IRET* is executed from legacy mode while the *NT* bit is set, a task switch occurs.



- & **Resume Flag(RF) Bit**. \[*bit 16*\]. 

The RF bit allows an instruction to be restarted following an instruction breakpoint resulting in a *debug exception(#DB)*. <span style="color:#FFD60A">This bit prevents multiple debug exceptions from occurring on the same instruction</span>.

>[!note]
> The processor clears the *RF* bit after every instruction is successfully executed, except when the instruction is:
> - An *IRET* that sets the *RF* bit.
> - *JMP*, *CALL*, or *INTn* through a task gate.
> 
> In both of the above cases, *RF* is not cleared to 0 until the *next* instruction successfully executes.

>[!exception]
> - When an exception occurs(or when a string instruction is interrupted), the processor normally sets *RF*=1 in the RFLAGS image saved on the interrupt stack.
> - When a *\#DB exception* occurs as a result of an instruction breakpoint, the processor clears the *RF=0* in the interrupt-stack RFLAGS image.

>[!procedure]
> - For instruction restart to work properly following an instruction breakpoint, The *\#DB* exception handler must set *RF* to 1 in the interrupt-stack *RFLAGS* image.
> - When an *IRET* is later executed to return to the instruction that caused the *instruction-breakpoint\#DB exception*, the set *RF* bit(*RF*=1) is loaded from the interrupt-stack *RFLAGS* image.
> - *RF* is not cleared by the processor until the instruction causing the *\#DB* exception successfully executes.



- & **Virtual-8086 Mode(VM) Bit**. \[*bit 17*\]. Enable: 1; Disable: 0;

>[!attention]
> - System software can only change this bit using a task switch/ an *IRET*.
> - It cannot modify the bit using the *POPFD* instruction.



- & **Alignment Check(AC) Bit** \[*bit 18*\].

>[!note]
> - Software enables automatic alignment checking by setting the *AC* = 1, when *CR0.AM* = 1.
> - Alignment checking can be disabled by clearing either *AC* = 0/ *CR0.AM* = 0.

>[!exception]
> When automatic alignment checking is enabled and the current privilege-level(CPL) is 3(least privileged), a memory reference to an unaligned operand causes an *alignment-check exception(#AC)*.



- & **Virtual Interrupt(VIF) Bit**. \[*bit 19*\]. The *VIF* bit is a virtual image of the *RFLAGS.IF* bit.

>[!note]
> When either virtual-8086 mode extensions are enabled(*CR4.VME* = 1)/ protected-mode virtual interrupts are enabled(*CR4.PVI* = 1), and the *RFLAGS.IOPL* < 3.

>[!important]
> When enabled, instructions that ordinarily would modify the *IF* bit actually modify the *VIF* bit with no effect on the *RFLAGS.IF* bit.

>[!exception]
> - System software that supports *virtual-8086* mode should enable the *VIF* bit using *CR4.VME*. This allows 8086 software to execute instructions that set and clear RFLAGS.IF bit without causing an exception.
> - Software reads the VIF bit to determine whether or not to take the action desired by the 8086 software(enabling or disabling interrupts by setting/clearing the *RFLAGS.IF* bit)

>[!note]
> In long mode, the use of *VIF* bit is supported when *CR4.PVI* = 1.



- & **Virtual Interrupt Pending(VIP) Bit**. \[*bit 20*\]. 

provides an extension to both *virtual-8086* mode and *protected* mode. It is used by system software to indicate that an *external, maskable interrupt* is pending(awaiting) execution by either a *virtual-8086* mode / *protected-mode* interrupt-service routine. 

>[!warning]
> Software *must* enable *virtual-8086* mode extensions(*CR4.VME* = 1) / *protected*-mode virtual interrupts(*CR4.PVI* = 1) before using *VIP*.

>[!note]
> - *VIP* is normally set to 1 by a *protected-mode* <span style="color:#D0F4DE">interrupt-service routine</span> that was entered from *virtual-8086* mode, as a result of external, maskable interrupt.
> - Before returning to the *virtual-8086* mode application, the <span style="color:#D0F4DE">service routine</span> sets *VIP* = 1 if *EFLAGS.VIF* = 1.

>[!exception]
> - When the virtual-8086 mode application attempts to enable interrupts by clearing *EFLAGS.VIF* = 0 while *VIP* = 1, a *general-protection exception(\#GP)* occurs.
> - The *\#GP* service routine can then decide whether to allow the *virtual-8086* mode service routine to handle the *pending external, maskable interrupt*.(*EFLAGS* is specifically referred to in this case because *virtual-8086* mode is supported only from legacy mode.)

>[!note]
> In long mode, the use of *VIP* bit is supported when *CR4.PVI* = 1.



- & **Processor Feature Identification(ID) Bit**. \[*bit 21*\] 

The ability of software to modify this bit indicates that the processor implementation supports the *CPUID* instruction.

### Extended Feature Enable Register(EFER)

>[!summary]
>- The extended-feature-enable register(EFER) contains control bits that enable additional processor features not controlled by the legacy control registers.
> - The *EFER* is model-specific register(MSR) with an address of <span style="color:#FFD60A">C000_0080h</span>.
> - It can be read and written only by privileged software.


![[image/amd64/vol2/chap-03/efer.png]]

The defined EFER bits shown above are described below:
- & **System-Call Extension(SCE) Bit**. \[*bit 0*\]. read/write. Enables *SYSCALL* and *SYSRET* instructions.

>[!tip]
> Application software can use these instructions for low-latency *system calls* and returns in a non-segmented(flat) address space.



- & **Long Mode Enabled(LME) Bit**. \[*bit 8*\], read/write. Enables the processor to activate *long mode*.

>[!caution]
> - *Long mode* is not activated until software enables paging some time later.
> - When paging is enabled after *LME* = 1, the processor sets the *EFER.LMA* = 1, indicating that long mode is not only enabled but also active.



- & **Long Mode Active(LMA) Bit**. \[*bit 10*\]. read/write. Indicates that long mode is active.

>[!note]
> - When *LMA* = 1, the processor is running either in *compatibility mode* / *64-bit mode*, depending on the value of *L* bit in a code-segment descriptor in Figure 1-6.
> - When *LMA* = 0, the processor is running in *legacy mode*. In this mode, the processor behaves like a standard 32-bit x86 processor, with none of the new 64-bit features enabled.

>[!warning]
> - When writing the *EFER* register the value of this bit *must* be preserved.
> - Software *must* read the *EFER* register to determine the value of *LMA*, change any other bits are requires and then write the *EFER* register.

>[!exception]
> An attempt to write a value that differs from the state determined by hardware results in a *\#GP fault*.



- & **No-Execute Enable(NXE) Bit**. \[*bit 11*\]. read/write. Enables the no-execute page-protection feature. Disables \*=0.

>[!warning]
> Before setting *NXE*, system software should verify the processor supports the feature by examining the feature flag <span style="color:#EDAFB8">CPUIDFn8000_0001_EDX[NX]</span>.



- & **Secure Virtual Machine Enable(SVME) Bit**. \[*bit 12*\]. read/write. Enables the *SVM* extensions.

>[!exception]
> When this bit is zero, the *SVM* instructions cause *\#UD exceptions*.

>[!info]
> - *EFER.SVME* defaults to a reset value of zero.
> - The effect of turning off *EFER.SVME* while a guest is running is *undefined*. Therefore, the *VMM* should always prevent guests from writing *EFER.SVM* extensions can be disabled by setting *VM_CR.SVME_DISABLE*.



- & **Long Mode Segment Limit Enable(LMSLE) Bit**. \[*bit 13*\]. read/write. Enables certain limit check in *64-bit mode*.



- & **Fast FXSAVE/FXSTOR(FFXSR) Bit**. \[*bit 14*\]. read/write. Enables the *FXSAVE* & *FXRSTOR* instructions to execute faster in *64-bit mode* at *CPL 0*.

>[!important]
> - This is accomplished by not saving / restoring the *XMM* registers(*XMM0*-*XMM15*)
> - The FFXSR bit has not effect when the *FXSAVE*/*FXRSTOR* instructions are executed in non *64-bit* mode/ when *CPL* > 0.
> - The *FFXSR* bit does not affect the save/restore of the *legacy x87 floating-point state*, or the *save/restore* of *MXCSR*.

>[!attention]
> Before setting *FFXSR*, system software should verify the processor supports the feature by examining the feature flag <span style="color:#EDAFB8">CPUIDFn8000_0001_EDX[FFXSR]</span>.



- & **Translation Cache Extension(TCE) Bit**. \[*bit 15*\]. read/write. Changes how the *INVLPG* instruction operates on TLB entries.

>[!procedure]
> - When this bit is 0, *INVLPG* will remove the target *PTE(page table entry)* from the *TLB* as well as *all* upper level table entries that are cached in the *TLB*, whether or not they are associated with the target *PTE*.
> - When this bit is set, *INVLPG* will remove the target *PTE* and only those upper-level entries that lead to the target *PTE* in the page table hierarchy, leaving unrelated upper-level entries intact. This may a performance benefit.

>[!warning]
> - Page table management software must be written in a way that takes this behavior into account.
> - when *TCE* = 1, Software that was written for a processor that does not cache upper-level table entries may result in *stale entries* being incorrectly used for translations.
> - Software that is compatible with *TCE* mode will operate in either mode.

>[!attention]
> Before setting *TCE*, system software should verify the processor supports the feature by examining the feature flag <span style="color:#EDAFB8">CPUIDFn8000_0001_EDX[TCE]</span>.



- & **Mcommit Enable(MCOMMIT) Bit**. \[*bit 17*\]. read/write. 

Setting this bit to 1 enables the *MCOMMIT* instruction.

>[!exception]
> When clear, attempting to execute *MCOMMIT* causes a *\#UD* exception.



- & **Interruptible Wbinvd Bit**. \[*bit 18*\]. 

Setting this bit to 1 allows the *WBINVD* and *WBNOINVD* instruction to be interruptible.



- & **Upper Address Ignore(UAIE) Bit**. \[*bit 20*\]. 

Setting this bit to 1 excludes bits\[63:57\] of an address from the <span style="color:#A9DEF9">canonical</span> check for some memory references.



- & **Automatic IBRS Enable(AIBRSE) Bit**. \[*bit 21*\]. read/write. 

Setting this bit to 1 enables Automatic IBRS(*Indirect Branch Restricted Speculation*). When Automatic IBRS is enabled, the following processes have IBRS protection even when *SPEC_CTRL\[IBRS\]* is not set:
- Process running at *CPL=0*.
- Process running at host when Secure Nested Paging(*SEV-SNP*) is enabled.
When Automatic IBRS is enabled, the internal return address stack used for return address predictions is cleared on *VMEXIT*.

### Extended Control Registers (XCRn)
Extended control registers(*XCRn*) form a new register space that is available for managing processor architecture features and capabilities. Currently only *XCR0* is defined. All other *XCR* registers are reserved.
## Model-Specific Register(MSRs)

>[!summary]
> Processor implementations provide *model-specific registers(MSRs)* for software control over the unique features supported by that implementation. 

<span style="color:#FFD60A">Software reads and writes MSRs using the privileged RDMSR and WRMSR instructions.</span> Implementations of the AMD64 arch can contain a mixture of two basic MSR types:
- @ *Legacy MSRs*. The AMD family of processors often share model-specific features with other x86 processor implementations. Where possible, AMD implementations use the same *MSRs* for the same functions.

>[!info]
> The memory-typing an debug-extension *MSRs* are implemented on many AMD and non-AMD processors.

- @ *AMD model-specific MSRs*. There are many *MSRs* common to the AMD family of processors but not to legacy x86 processors. Where possible, AMD implementations use the same AMD-specific *MSRs* for the same functions.
![[image/amd64/vol2/chap-03/msr-list.png]] ^a9283a


### System Configuration Register(SYSCFG)

>[!summary]
> <span style="color:#FFD60A">The system-configuration register(SYSCFG) contains control bits for enabling and configuring system bus feature</span>. *SYSCFG* is model-specific register(MSR) with an address of <span style="color:#FFD60A">C001_0010h</span>.


![[image/amd64/vol2/chap-03/syscfg-register.png]]

The function of the *SYSCFG* bits are (*all bits are read/write unless otherwise noted*):
- & **MtrrFixDramEn Bit**. \[*bit 18*\].

Enables use of the *RdMem* and *WrMem* attributes in the fixed-range *MTRR* registers.

>[!tip]
> The *RdMem* & *WrMem* attributes allow system software to define fixed-range *IORRs* using the fixed-range *MTRRs*.



- & **MtrrVarDramModEn Bit**. \[*bit 19*\]. 

Allows software to read & write the *RdMem* and *WrMem* bits. <span style="color:#FFD60A">When cleared, writes do not modify the RdMem and WrMem bits, and reads return 0</span>.


- & **MtrrVarDramEn Bit.** \[*bit 20*\]. 

Enables the *TOP_MEM* register and the variable-range *IORRs*.

- & **MtrrTom2En Bit**. \[*bit 21*\]. 

Enables the *TOP_MEM2* register.


- & **Tom2ForceMemtypeWB Bit**. \[*bit 22*\]. 

Enables the default memory type to be memory between *4GB* and address specified by *TOP_MEM2*.

>[!attention]
> - It is write back instead of the memory type defined by *MSR0000_02FF\[MTRR Default Memory Type(MTRRdefType)\]\[MemType\]*. 
> - For this bit to have any effect, *MSR0000_02FF\[MtrrDefTypeEn\]* must be 1.
> - *MTRRs* and *PAT* can be used to override this memory type.



- & **MemoryEncryptionModeEn Bit.** \[*bit 23*\]. 

Setting this bit to 1 enables the *SME*(Secure Memory Encryption) and *SEV*(Secure Encrypted Virtualization) memory encryption features. When cleared, these features are disabled.

>[!warning]
> Once this bit or *HostMultiKeyMemEnrModeEn* is set to 1, it cannot be changed.



- & **SecureNestedPagingEn Bit**. \[*bit 24*\]. 

Setting this bit to 1 enables *SEV-SNP*(Secure-Nested Paging). When cleared, this feature is disabled.

>[!warning]
> - Once this bit is set to 1, it cannot be changed.
> - This bit can only be set if *MemEncryptionModeEn* is already set or is simultaneously also set to 1.

>[!procedure]
> After *SecureNestedPagingEn* is set to 1, certain *MSRs* may no longer be written.



- & **VMPLEN Bit**. \[*bit 25*\]. 

Setting this bit to 1 enables the *VMPL* feature(Virtual Machine Privilege Levels).

>[!warning]
> - Software should set this bit to 1 when *SecureNestedPagingEn* is being set to 1.
> - Once *SecureNestedPagingEn* is set to 1, *VMPLEn* cannot be changed.


- & **HostMultiKeyMemEncrModeEn Bit**. \[*bit 26*\]. 

Setting this bit to 1 enables the *SME-MK* memory encryption feature(Secure Memory Encryption). When cleared, this feature is disabled.

>[!warning]
> Once this bit or *MemEncryptionModeEn* is set to 1, it cannot be changed.


### System-Linkage Registers

>[!summary]
> <span style="color:#FFD60A">System-linkage MSRs are used by system software to allow fast control transfers between applications and operating system</span>. 

The functions of these registers are:

- @ **STAR, LSTAR, CSTAR, and SFMARK Registers**: used to provide mode-dependent linkage information for the *SYSCALL* and *SYSRET* instructions.
	- @ *STAR*   is used in *legacy* mode.
	- @ *LSTAR*  is used in *64-bit* mode.
	- @ *CSTAR*  is used in *compatibility* mode.
	- @ *SFMASK* is used by the *SYSCALL* instruction for *RFLAGS* in long mode.

- @ **FS.base and GS.base Registers**: allow 64-bit base-address values to be specified for the *FS* and *GS* segments, for use in *64-bit* mode.

- @ **KernelGSbase Register**: used by the *SWAPGS* instruction. <span style="color:#FFD60A">This instruction exchanges the value located in KernlGSbase with the value located in GS.base</span>.

- @ **SYSENTERx Registers**: the *SYSENTER_CS*, *SYSENTER_ESP*, and *SYSENTER_EIP* registers are used to provide linkage information for *SYSENTER* and *SYSEXIT* instructions. <span style="color:#FFD60A">These instructions are only used in legacy mode</span>.


### Memory-Typing Registers

>[!summary]
> - *Memory-typing MSRs* are used to characterize, or type, memory.
> - Memory typing allows software to control the cacheability of memory, and determine how accesses to memory are ordered.

The *memory-typing registers* perform the following functions:
- @ **MTRRcap Register**. 

This register contains information describing the level of *MTRR* support provided by the processor.


- @ **MTRRdefType Register**. 

This register establishes the default memory type to be used for physical memory that is not specifically characterized using the fixed-range and variable-range *MTRRs*.


- @ **MTRphysBasen and MTRRphysMaskn Registers.** 

These registers form a register pair that can be used to characterize any address range within the physical-memory space, *including all of physical memory*. Up to eight address ranges of varying sizes can be characterized using these registers.

- @ **MTRRfixn Registers.** 

These registers are used to characterize fixed-size memory ranges in the first 1MB of physical-memory space.


- @ **PAT Register.** 

This register allow memory-type characterization based on the virtual(linear) address.
- It is an extension to the *PCD* and *PWT* memory types supported by the *legacy paging mechanism*.
- Provides the same memory-typing capabilities as the *MTRRs*, but with the added flexibility provided by the paging mechanism.


- @ **TOP_MEM and TOP_MEM2 Registers**. 

These top-of-memory registers allow system software to specify physical address ranges as memory-mapped I/O locations.

### Debug-Extension Registers
The *debug-extension MSRs* provide software-debug capability not available in the legacy debug registers(*DR0*-*DR7*).

>[!tip]
> These MSRs allow *single stepping* and *recording of control transfers* to take place.

The debug-extension registers perform the following functions:

- @ **DebugCtl Register.** 

This *MSR register* provides control-transfer recording and single stepping, and external-breakpoint reporting and trace messages.


- @ **LastBranchx and LastIntx Registers.** 

The four registers, *LastBranchToIP*, *LastBranchFromIP*, *LastIntToIP*, and *LastIntFromIP*, are all used to record the source and target of control transfers when branch recording is enabled.

### Performance-Monitoring Registers

The *time-stamp counter* and *performance-monitoring registers* are useful in identifying performance bottlenecks.

- @ **TCS Register.** This register is used to count processor-clock cycles.

>[!note]
> - It can be read using the *RDMSR* instruction.
> - It can be read using the either of the *read time-stamp counter* instructions, *RDTSC* / *RDTSCP*.

>[!tip]
> System software can make *RDTSC* / *RDTSCP* available for use by non-privileged software by clearing the time-stamp disable bit(*CR4.TSD*) to 0.


- @ **\*PerfEvtSeln Registers**. 

These registers are used to specify the events counted by the corresponding performance counter, and to control other aspects of its operation.


- @ **\*PerfCtrn Registers**.

These registers are performance counters that hold a count of *processor*, *northbridge*, or *L2 cache* events or the duration of events, <span style="color:#FFD60A">under the control of the corresponding *PerfEvtSeln register</span>.


>[!note]
> - Each *\*PerfCtrn* register can be read using the *RDMSR* instruction.
> - They can read using the *read performance-monitor counter* instruction, *RDPMC*.

>[!tip]
> System software can make *RDTSC* / *RDTSCP* available for use by non-privileged software by setting the performance-monitoring counter enable bit(*CR4.PCE*) to 1.


### Machine-Check Registers

>[!exception]
> The *machine-check registers* control the detection and reporting of hardware machine-check errors. The types of errors that can be reported include *cache-access errors*, *load-data* and *store-data* errors, *bus-parity errors*, *ECC errors*.

3 types of *machine-check MSRs* are shown in [[chap-03-System Resources#^a9283a|Figure 3-1]].

1. The first type is global machine-check registers, which perform the following functions:
	- @ **MCG_CAP Register.** This register identifies the machine-check capabilities supported by the processor.

	- @ **MCG_CTL Register.** This register provides control over machine-check-error reporting.

	- @ **MCG_STATUS Register.** This register reports global status on detected machine-check errors.

2. The second type is error-reporting <span style="color:#D0F4DE">register banks</span>, which report on machine-check errors associated with a specific processor unit(or group of processor units). There can be different numbers of <span style="color:#D0F4DE">register banks</span> for each processor implementation, and each bank is number from 0 to i. The registers in each bank perform the following functions:
	- @ **MCi_CTL Registers.** These registers control error-reporting.

	- @ **MCi_STATUS Registers.** These registers report machine-check errors.

	- @ **MCi_ADDR Registers.** These registers report the machine check error address.

	- @ **MCi_MISC Registers.** These registers report miscellaneous-error information.

3. 
- The third type is MCA Extension(*MCAX*) <span style="color:#D0F4DE">register banks</span>, which report on machine-check errors associated with a specific processor unit(or group of processor units). <span style="color:#FFD60A">There can be different numbers of register banks for each register banks for each processor implementation, and each bank is numbered from 0 to i.</span> Legacy MCA supports up to 32 banks.
>[!tip]
> *MCAX* bank 0 will alias to Legacy bank 0 registers. Similarly, *MCAX* bank n will alias to Legacy bank n registers.

- The register in each bank perform the following functions:
	- @ **MCA_CTL Register**. This register is an alias to *MCi_CTL* for banks 0 to 31. <span style="color:#FFD60A">For backs 32 and above, this register controls error-reporting</span>.
	
	- @ **MCA_STATUS Register**.    This register is an alias to *MCi_Status*.

	- @ **MCA_ADDR Register**.      This register is an alias to *MCi_ADDR*.

	- @ **MCA_MISC0 Register**.     This register is an alias to *MCiMISC0*.

	- @ **MCA_CONFIG Register**.    This register holds configuration information for the *MCA* bank.

	- @ **MCA_IPID Register**.      This register holds information which identifiers the specific *MCA* bank.

	- @ **MCA_SYND Register**.      This register stores information associated with the error in *MCA_STATUS* / *MCA_DESTAT*.

	- @ **MCA_DESTAT Register**.    This register reports deferred machine check errors.

	- @ **MCA_DEADDR Register**.     This register provides the address associated with the deferred machine check error.

	- @ **MCA_MISC\[4:1\] Registers**. Extended miscellaneous error-information registers.

	- @ **MCA_SYND\[2:1\] Registers**. This register contains information associated with the error in *MCA_STATUS* / *MCA_DESTAT*.


### Shadow Stack Registers

These registers are defined if the shadow stack feature is supported as indicated by *CPUID Fn0000_0007_0ECX\[CET_SS\](bit 7)=1*.

- @ **PL0_SSP, PL1_SSP, PL2_SSP Registers**. These registers specify the linear address to be loaded into *SSP* on the next transition *CPLn*, where *n=0, 1, 2*.

>[!warning]
> The linear address must be in <span style="color:#A9DEF9">canonical format</span> and aligned to 4 bytes.


- @ **PL3_SSP Register**. The user mode *SSP* is saved to and restored from this register.

>[!warning]
> The linear address must be in <span style="color:#A9DEF9">canonical format</span> and aligned to 4 bytes.


- @ **ISST_ADDR Register**. This register specifies the linear address of the *Interrupt SSP Table(ISST)*.

>[!warning]
> The linear address must be in <span style="color:#A9DEF9">canonical format</span>.

- @ **U_CET Register**. This register specifies the user mode shadow stack controls.

- @ **S_CET Register**. This register specifies the supervisor mode shadow stack controls.


### Extended State Save MSRs

- @ **XSS Register**. This register contains a *bitmap* of supervisor-level state components.

>[!note]
> System software sets bits in the *XSS* register *bitmap* to enable management of corresponding state component by the *Fn0000_000D_EAX\[XSAVES\]_x1=1*.

The *XSS bitmap* is defined as follows:
![[xss-register.png]]

### Speculation Control MSRs

>[!summary]
> Modern processors implement hardware technique such as branch prediction, speculative execution and out-of-order processing to significantly improve performance. 

<span style="color:#FFD60A">If the processor incorrectly predicts / speculates on an outcome, this is detected and any speculative results are discarded</span>. The processor then supplies the architecturally correct, in-order response to the program's instructions. <span style="color:#FFD60A">Even though the speculative results are discarded, micro-architectural side effects may remain which can be detected by software, and which in some cases may lead to side-channel vulnerabilities</span>.

The two speculation control *MSRs*, *SPEC_CTRL(MSR 048h)* and *PRED_CMD(MSR 049h)*, enable hardware features that are designed to limit certain types of speculation. Support for these feature is indicated by *CPUIDFn8000_0008_EBX* as described in [[chap-03-System Resources#^34a005|Table 3-1]] below. The presence of a given speculation control feature also implies support for its associated *MSR*.

![[speculation-control-registers.png]] ^34a005

#### SPEC_CTRL(MSR 048h)
>[!exception]
> *SPEC_CTRL(MSR 48h)* is read-write register. Attempts to write to 1 into any reserved bit cause a *\#GP* fault.

>[!procedure]
> Unlike most *MSRs*, a *WRMSR* to *SPEC_CTRL* does not serialize memory operations. However, a write to this register is dispatch serializing and prevents execution of younger instructions until the *WRMSR* has completed.

The format of *SPEC_CTRL* is shown in 
![[spec-ctrl.png]] ^fa2c90

The *SPEC_CTRL* bits defined in [[chap-03-System Resources#^fa2c90|Figure 3-13]] and are described below:

##### Indirect Branch Restricted Speculation(IBRS)
\[*bit 0*\].

Setting this bit to 1 prevents indirect branches that occurred in a less privileged prediction mode before this bit was set from influencing predictions of future indirect branches in a more privileged prediction mode that occur after this bit is set. <span style="color:#FFD60A">A lesser privileged prediction mode is defined as CPL3 / Guest mode, and a more privileged prediction mode is defined as CPL 0-2 / Host mode</span>.


After setting *IBRS* to 1, if software subsequently
- clear *IBRS* to 0: The processor may allow order indirect branches that occurred when *IBRS* was previously 0 to influence future indirect branch predictions.
- write another 1 to *IBRS*: The processor starts a new window where older indirect branches do not influence future indirect branch predictions.

<span style="color:#FFD60A">Only indirect branches that occurred to setting IBRS are prevented from influencing future indirect branches</span>. Therefore, if *IBRS* were already set on a transition to a more privileged mode, software at the more privileged mode must write a 1 to *IBRS* if it requires indirect branch predictions in the new mode to not be influenced by those from the previous mode.

>[!important]
> On processors with a shared indirect branch predictor, setting *IBRS* also prevents indirect branch predictions of one thread from influencing the predictions of its *sibling threads*, as if *SPEC_CTRL\[STIBP\]* was also set, see [[chap-03-System Resources#Single Thread Indirect Branch Prediction mode(STIBP)|Single Thread Indirect Branch Predictor]].

>[!info]
> Some processors, identified by *CPUIDFn8000_0008_EBX\[IbersSameMode\](bit 19)=1*, provide additional speculation limits. For these processors, when *IBRS* is set, indirect branch predictions are not influenced by any prior indirect branches, <span style="color:#D0F4DE">regardless of mode (CPL and guest/host) and regardless of whether the prior indirect branches before / after the setting of IBRS</span>. This is referred to as Same Mode IBRS.

>[!attention]
> Although return instructions can be considered as a type of indirect branch, *IBRS* does not affect them. <span style="color:#EDAFB8">Software requiring *IBRS*-style indirect branch speculation limits for *RET* instructions should clear out any return address predictions by executing 32 *CALL* instructions having a non-zero displacement.</span>
> 
> Processors implementing more than 32 return predictions include hardware to clear the additional entries when software writes a 1 to IBRS.
> 
> If the kernel and user virtual address spaces are disjoint with at least one unmapped 4K page separating them, and *SMEP* is enabled, then there is not need to clear out the return address predictions.


Some processors, identified by *CPUID Fn8000_0021_EAX\[AutomaticIBRS\](bit 8)=1*, support Automatic IBRS. Refer to the description of *EFER\[AIBASE\]*.

##### Single Thread Indirect Branch Prediction mode(STIBP)
\[*bit 1*\]

Setting this bit to 1 prevents indirect branch predictions of one thread from influencing the predictions of any *sibling threads*, on processors where branch prediction resources are shared. 
>[!important]
> *RET*(return) instructions are not influenced by *sibling threads*. Therefore, setting *STIBP* is not required to prevent one thread's *RET* predictions from influencing the prediction of a *sibling thread*.

>[!note]
> Note that *STIBP* mode is automatically enabled when *SPEC_CTRL\[IBRS\]* is set, regardless of value of *SPEC_CTRL\[STIBP\]*.

##### Speculative Store Bypass Disable(SSBD)
\[*bit 2*\]

Setting this bit to 1 prevents load-type instructions from speculatively bypassing older store instructions whose final address have not yet been resolved.

>[!important]
> As specified in [[chap-07-Memory System#Read Ordering|Section 7.1.1]] "Read Ordering", loads from memory marked with the proper memory type can read memory out-of-order, speculatively and before older stores have completed. 
> 
> This means it is possible for a load to read and pass forward, in a speculative manner, previous values of the memory location.
> 
> <span style="color:#FB8B24">The processor has logic to correct this occurrence and provide the proper in-order load response to the program</span>.

>[!attention]
> However, this mis-speculation may have resulted in micro-architectural side effects. When **SSBD** is set to 1, the processor can return speculative load data only if there are no older stores with unknown addresses.

Some legacy processors implement **SSBD** in a different *MSR*. On these processors, indicated by *CPUID* function *8000_0008*, *EBX\[25\]=1*, *SSBD* is enabled by setting *VIRT_SPEC_CTRL(MSRC001_011F)* bit 2. On processor support both *SPEC_CTRL* and *VIRT_SPEC_CTRL*, if *SSBD* is enabled in either *MSR*, the processor prevents loads from speculating around old stores. However, it is preferred that software uses *SPEC_CTRL\[SSBD\]* in this scenario.

On some processor models, setting *SSBD* is not needed to prevent speculative loads from bypassing older stores. This is indicated by *CPUIDFn8000_0008_EBX\[SSbdNotRequired\]*(bit 26)=1.

##### Predicted Store Forward Disable(PSFD)
\[*bit 7*\]

Setting this bit disables Predictive Store Forwarding(PSF).

>[!important]
> As specified in [[chap-07-Memory System#Read Ordering|Section 7.1.1]] "Read Ordering", write data for cacheable memory types can be forwarded to read instructions before that data is actually written in memory, via a mechanism called *store-to-load forwarding*.

*PSF* expands on store-to-load forwarding via a mechanism that predicts the relationship between loads and stores based on past behavior, without waiting for their address calculations to complete.

>[!note]
> - Like other forms of speculative store bypass, an incorrect prediction may result in micro-architecture side effects.
> - *PSF* speculation can be disabled by setting *PFSD*.

>[!tip]
> - The *PSF* feature is also disabled when *SPEC_CTRL\[SSBD\]* is set. <span style="color:#FB8B24">However, *SSBD* disables both *PSF* and speculative store bypass, while *PSFD* only disables *PSF*</span>. *PSFD* may be desirable for software which is concerned with the speculative behavior of *PSF* but desires a smaller performance impact than setting *SSBD*


##### PRED_CMD(MSR 049h)

>[!exception]
> *PRED_CMD* is a write-only register. Attempts to read this register or to write a 1 into any reserved bit cause a *\#GP(0)* fault.
> 

>[!procedure]
> Unlike most *MSRs*, a *WRMSR* to *SPEC_CTRL* does not serialize memory operations. However, a write to this register is dispatch serializing and prevents execution of younger instructions until the *WRMSR* has completed.

The format of the *PRED_CMD* register is shown in [[chap-03-System Resources#^044b1c|Figure 3-13]] below.

![[pred_cmd_register.png]] ^044b1c

- & **Indirect Branch Prediction Barrier(IBPB)**. \[*bit 0*\]. write only.

Setting this bit to 1 prevents the processor from using older indirect branch predictions to influence future indirect branches. <span style="color:#FFD60A">This applies to JMP indirect, CALL indirect and to RET(return) instructions</span>.

>[!info]
> In some implementations, setting *IBPB* causes the processor to *flush* all previous indirect branch predictions.
> 

As this restricts the processor from using any previous indirect branch information, *IBPB* is intended to be used by software when switching between contexts that do not trust each other.

>[!example]
> Examples of such contexts include switching from one user context to another, or from one guest to another.

>[!info]
> In some implementations, *IBPB* will only flush the indirect predictions that are accessible to the current thread.


##### Additional CPUID Functions

The following *CPUID* functions provide more information on the speculation control features to aid system software in optimizing processor performance:

- ^ **CPUID Function 8000_0008_EBX\[16\]**(*IBRS* always on).

When set, indicates the processor prefers that *IBRS* is only set once during boot and not changed. 

>[!Attention]
 If *IBRS* is set on a processor supporting *IBRS* always on mode, indirect branches executed in a less privileged prediction mode will not influence branch predictions for indirect branches in a more privileged prediction mode.

This eliminates the need for *WRMSR* instructions to manage speculation effects at elevated-privilege entry and exit points.


- ^ **CPUID Function 8000_0008_EBX\[17\]**(*STIBP* always on)

When set, indicates the processor prefers that *STIBP* is only set once during boot and not changed. 

This eliminates the need for a *WRMSR* at the necessary transition points.

- ^ **CPUID Function 8000_0008_EBX\[18\]**(*IBRS* referred)

When set, indicates that the processor prefers using the *IBRS* feature instead of other software mitigations such as retpoline. This allows software to remove the software mitigation utilize the more performant *IBRS* mechanism.


### Hardware Configuration Register(HWCR)

The *HWCR* register contains control bits that affect the functionality of other features.

>[!note]
> Some *HWCR* bits are implementation specific, and are described in the *BIOS* and *Kernel Developer's Guide*(BKDG) / Processor Programming Reference Manual applicable to your product.

Implementation specific *HWCR* bits are listed below.

- & **SmmLock**. \[*bit 0*\]. Enables SMM code lock.

When set to 1, *SMM* code in the *ASeg* and *TSeg* memory ranges, and the *SMM* register, become read-only and *SMI* interrupts are not intercepted in *SVM*.

- & CpdDis. \[*bit 25*\]. Core performance boot disable.

When set to 1, core performance boost is disabled.

- & IRPerfEn. \[*bit 30*\].

Setting this bit to 1 enables the instructions retired counter.

- & **SmmPgCfgLock**. \[*bit 33*\]

Setting this bit to 1 locks the paging configuration while in *SMM*.

- & **CpuidUserDis.** \[*bit 35*\]

>[!exception]
> Setting this bit to 1 causes *\#GP(0)* when the *CPUID* instruction is executed by non-privileged software(*CPL* is > 0) outside *SMM*.

Support for the CPUID User Disable feature is indicated by *CPUID Fn 8000_0021_EAX\[CpuidUserDis\]=1*.


## Processor Feature Identification

>[!summary]
> The *CPUID* instruction provides information about the processor implementation and its capabilities. <span style="color:#FFD60A">Software operating at any privilege level can execute the CPUID instruction to collect this information</span>.

*CPUID* instruction provide specific information about the processor implementation, including *vendor*, *model number*, *revision*, *features*, *cache organization*, and *name*. <span style="color:#FFD60A">The multifunction approach allows the CPUID instruction to return a detailed picture of the processor implementation and its capabilities -- more detailed information than could be returned by a single function</span>. *This flexibility also allows for the addition of new CPUID functions in future processor generations*.

>[!note]
> The desired function number is loaded into the *EAX* register before executing the *CPUID* instruction. *CPUID* functions are divided into 2 types:
> - Standard functions return information about features common to all x86 implementations, including the earliest features offered in the *x86* arch, as well as information about the presence of features such as support for the *AVX* and *FMA* instruction subsets. <span style="color:#D0F4DE">Standard function numbers are in the range 0000_0000h-0000_FFFFh</span>.
> - Extended functions return information about AMD-specific features such as long mode and the presence of features such as support for the *FMA4* and *XOP* instruction subsets. <span style="color:#D0F4DE">Extended function numbers are in the range 8000_0000h-8000_FFFFh</span>

<span style="color:#FFD60A">Feature information is returned in the EAX, EBX, ECX, EDX registers</span>. *Some functions accept a second input parameter passed to the instruction in the ECX register*.

>[!important]
> The notation *CPUIDFnXXXX_XXXX_RRR\[FieldName\]_xYY* is used to present the input parameters and return value that corresponds to a particular processor capability / feature.
> - *XXXX_XXXX*: represents the 32-bit value placed in the *EAX* register prior to the executing the *CPUID* instruction. This value is the function number.
> - *RRR*: is either *EAX*/ *EBX*/ *ECX*/ *EDX* and represents the register to be examined after the execution of the instruction.
> - *\[FieldName\]*: if the contents of the entire 32-bit register provides the capability information(*not need other constraint*), the notation *\[FieldName\]* is ommitted, otherwise this provides the name of the field within the return value that represents the capability / feature.
> 	- When the field is single bit, this is called a feature flag. <span style="color:#FB8500">Normally, if a feature flag bit is set, the corresponding processor feature is supported and if it is cleared, the feature is not supported</span>.
> - *\_xYY*: the optional input parameter passed to the *CPUID* instruction in the *ECX* register is represented by the notation *_xYY* appended after the return value notation. If a *CPUID* function does not accept this optional input parameter, this notation is ommitted.
