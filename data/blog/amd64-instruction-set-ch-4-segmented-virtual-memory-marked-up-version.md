---
title: AMD64 Instruction Set Ch-4 Segmented Virtual Memory (marked-up version)
date: '2026-03-08'
excerpt: >-
  The legacy x86 arch supports a segmentation-translation mechanism that allows
  system software to relocate and isolate instructions and data anywhere in the
  virtual-memory space.
tags:
  - instruction set
  - system programming
category: system-programming
order: 2
---
>[!abstract] 
> The *legacy x86* arch supports a segmentation-translation mechanism that allows *system software* to relocate and isolate instructions and data anywhere in the *virtual-memory space*.

>[!definition]
> A segment is a contiguous block of memory within the *linear address space*.

>[!note]
> - The size and location of a segment within *the linear address space* is arbitrary.
> - Instructions and data can be assigned to one or more memory segments, each with its own *protection characteristics*.
> - The processor hardware enforces the rules dictating whether one segment can access another segment.

<span style="color:#FFD60A">The segmentation mechanism provides ten segment registers, each of which defines a single segment.</span> 
- Six of these registers(*CS*, *DS*, *ES*, *FS*, *GS* and *SS*) define user segments.(*User segments hold software, data, and the stack and can be used by both application software and system software.*).
- The remaining four segments registers(*GDT*, *LDT*, *IDT*, *TR*) define system segments.(*System segments contain data structures initialized and used only by system software*).
>[!important]
> Segment registers contain a *base address* pointing to the starting location of a segment, a *limit* defining the segment size, and *attributes* defining the segment-protection characteristics.

| base address | limit | attributes |
| ------------ | ----- | ---------- |

>[!tip]
> Although segmentation provides a great deal of flexibility in relocating and protecting software and data, it is often more efficient to handle memory isolation and relocation with a combination of software and hardware paging support. For this reason, most modern system software bypasses the segmentation features. <span style="color:#FB8500">However, segmentation cannot be completely disabled, and an understanding of the segmentation mechanism is important to implementing long-mode system software.</span>

In *long* mode, the effects of segmentation depend on whether the processor is running in *compatibility* mode / *64-bit* mode:
- In *compatibility* mode, segmentation functions just as it does in legacy mode, using legacy 16-bit / 32-bit protected semantics.
- *64-bit* mode, segmentation is disabled, creating a *flat 64-bit virtual-address space*. As will be seen, certain functions of some segment registers, particularly the system-segment registers, continue to be used in 64-bit mode.

## Real Mode Segmentation

<span style="color:#FFD60A">After reset / power-up, the processor always initially enters real mode. Protected modes are entered from real mode.</span>


>[!definition]
> Real mode(real-address mode), provides a physical-memory space of 1MB. In this mode, a *20-bit physical address* is determined by shifting a *16-bit* *segment selector* to the left four bits adding the *16-bit* effective address.

>[!info]
> - Each 64K segment(*CS*, *DS*, *ES*, *FS*, *GS*, *SS*) is aligned on 16-byte boundaries.
> - The *segment base* is the *lowest address* in a given segment, and is equal to the *segment selector* \* 16.
> - The *POP* and *MOV* instructions can be used to load a new *segment selector* into one of the segment registers.(When this occurs, the selector is updated and the selector base is set to *selector* \* 16. <span style="color:#D0F4DE">The segment limit and segment attributes are unchanged, but are normally 64K(the maximum allowable limit) and read / write data, respectively</span>)

>[!attention]
> The *GDT*, *LDT*, and *TSS* are not used in real mode.


## Virtual-8086 Mode Segmentation

>[!definition]
> <span style="color:#FFD60A">Virtual-8086 mode supports 16-bit real mode programs running under protected mode</span>. It uses a simple form of memory segmentation, optional paging, and limited protection checking. *Programs running in virtual-8086 mode can access up to 1MB of memory space*.

>[!info]
> - Each 64K segment(*CS*, *DS*, *ES*, *FS*, *GS*, *SS*) is aligned on 16-byte boundaries.
> - The *segment base* is the *lowest address* in a given segment, and is equal to the *segment selector* \* 16.
> - The *POP* and *MOV* instructions can be used to load a new *segment selector* into one of the segment registers.(When this occurs, the selector is updated and the selector base is set to *selector* \* 16. <span style="color:#D0F4DE">The segment limit and segment attributes are unchanged, but are normally 64K(the maximum allowable limit) and read / write data, respectively</span>.

>[!exception]
> Interrupts and exceptions switch the processor to *protected mode*.


## Protected Mode Segmented-Memory Models

>[!summary]
> System software can use the segmentation mechanism to support one of two basic segmented-memory models: a *flat-memory model* / a *multi-segmented model*. These segmentation models are supported in *legacy mode* and in *compatibility mode*.

### Multi-Segmented Model

>[!definition]
> In the multi-segmented memory model, each segment register can reference a *unique base address* with a *unique segment size*.

>[!tip]
> - Segments can be range in \[1B, 4GB\].
> - When page translation is used, multiple segments can be mapped to a single page and multiple pages can be mapped to a single segment.

*Compatibility* mode allows the multi-segmented model to be used in support of legacy software. <span style="color:#FFD60A">However, in compatibility mode, the multi-segmented memory model is restricted to the first 4 GB of virtual-memory space</span>. Access to virtual memory above 4GB requires the use of 64-bit mode, which does not support segmentation.

### Flat-Memory Model

<span style="color:#FFD60A">Although segmentation cannot be disabled, the flat-memory model allows system software to bypass most of the segmentation mechanism</span>.

>[!note]
> - In the *flat-memory* model, all segment-base address have a value of 0 and the segment limits are fixed at 4GB.

>[!important]
> - Clearing the segment-base value to 0 effectively disables segment translation , resulting in single segment spanning the entire virtual-address space.
> - All segment descriptors reference this single flat segment.


### Segmentation in 64-Bit Mode

<span style="color:#FFD60A">In 64-bit mode, segmentation is disabled. The segment-base value is ignored and treated as 0 by the segmentation hardware. Likewise, segment limits and most attributes are ignored</span>. 

There are a few exceptions.
- & **The CS-segment DPL**:

*D*, and *L* attributes(respectively) to establish the *privilege level* for a program, the *default operand size*, and whether the program is running in 64-bit mode or compatibility mode.

- & **The FS and GS segments**:

can be used as additional *base registers* in address calculations, and those segments can have non-zero base-address values. (This facilitates addressing thread-local data and certain system-software data structures).

## Segmentation Data Structures and Registers

There are the data structures used by the segmentation mechanism:
![[image/amd64/vol2/chap-04/segmentation-data-structure.png]]

- @ **Segment Descriptors**: 

Describes a segment, including its location in virtual-address space, its space, protection characteristics, and other attributes.


- @ **Descriptor Tables**:

<span style="color:#FFD60A">Segment descriptors are stored in memory in one of three tables.</span>
- **GDT(global descriptor table)**: Holds segment descriptors that can be shared among all *tasks*.
- **LDT(multiple local-descriptor tables)**: can be defined to hold descriptors that are used by specific *tasks* and are not shared globally.
- **IDT(interrupt-descriptor table)**: holds gate descriptors that are used to access the segments where interrupts handlers are located.


- @ **Task-State Segment**: 

a <span style="color:#FB8500">task-state segment(TSS)</span> is a special type of system segment that contains *task-state information* and *data structures* for each *task*. e.g. 
- a <span style="color:#FB8500">TSS</span> holds a copy of the *GPRs* and *EFLAGS* register when a task is suspended.
- a <span style="color:#FB8500">TSS</span> holds the pointers to privileged-software stacks.


- @ **Segment Selectors**: 

Contains an index into either the *GDT* / *LDT*. <span style="color:#FFD60A">The IDT is indexed using an interrupt vector</span>.


- @ **Segment Registers**: 

The six segments registers(*CS*, *DS*, *ES*, *FS*, *GS*, and *SS*)  are used to point to the user segments. <span style="color:#FFD60A">A segment selectors selects a descriptor when it is loaded into one of the segment registers</span>. *This causes the processor to automatically load the selected descriptor into a software-invisible portion of the segment register.*


- @ **Descriptor-Table Registers**: 

The three descriptor-table registers(*GDTR*, *LDTR*, *IDTR*) are used to point to the system segments. The *descriptor-table registers* identify the virtual-memory location and size of the descriptor tables.

- @ **Task Register(TR)**: 

Describes the location and limit of the current <span style="color:#FB8500">task-state segment(TSS)</span>. *A fourth system-segment register, The TR, points to the TSS*.

![[image/amd64/vol2/chap-04/segment-and-description-table.png]]



## Segment Selectors and Registers

### Segment Selectors

>[!definition]
> Segment selectors are *pointers* to specific entries in the *global* and *local descriptor tables*. The following figure shows the segment selector format.

![[image/amd64/vol2/chap-04/segment-selector.png]]

The selector format consists of the following fields:
- & **Selector Index field.** \[*bit 15:3*\]. The selector-index field specifies an entry in the *descriptor table*.

>[!note]
> 1. Descriptor-table entries are *8B* long, so the selector index is scaled by 8 to form a *byte offset* into the descriptor table.
> 2. The *offset* is then added to either the global / local descriptor-table base address (as indicated by the *table-index bit*) to form the descriptor-entry address in virtual-address space.

>[!tip]
> - Some descriptor entries in long mode are *16B* long rather than *8B*. These expanded descriptors consume *two entries* in the descriptor table. *Long mode, however, continues to scale the selector index by 8 to form the descriptor-table offset*.
> - It is the responsibility of system software to assign selectors such that they correctly point to the start of an expanded entry.


- & **Table Indicator(TI) Bit**. \[*bit 2*\]. indicates which table holds the descriptor referenced by the selector index.
	- When *TI* = 0, the *GDT* is used.
	- When *TI* = 1, the *LDT* is used.

>[!note]
> The descriptor-table base address is read from the appropriate *descriptor-table register* and added to the scaled selector index as described above.

- & **Requestor Privilege-Level(RPL) Field.** \[*bit 1:0*\]. 

the *RPL* represents the privilege level (*CPL*) the processor is operating under at the time the selector is created. (*used in segment privilege-checks to prevent software running at lesser privilege levels from accessing privileged data.*)

- & **Null Selector**. 

<span style="color:#FFD60A">have a selector index of 0 and TI=0, corresponding to the first entry in the GDT</span>. However, *null selectors* do not reference the first *GDT* entry but are instead used to *invalidate unused segment registers*. 

>[!exception]
> - A *general-protection exception(\#GP)* occurs if a reference is made to use a segment register containing a *null selector* in *non-64-bit mode*.
> - By initializing unused segment registers with *null selector* software can trap references to unused segments.

>[!warning]
> - *Null selectors* can only be loaded into the *DS*, *ES*, *FS*, and *GS* data-segment registers, and into the *LDTR* descriptor-table register. 
> - A *\#GP* occurs if software attempts to load the *CS* register with a null selector
> - A *\#GP* occurs If software attempts to load the *SS* register with a null selector in non 64-bit mode or at *CPL* 3.

>[!note]
> - If *CPUID Fn 8000_0021_EAX\[NullSelectorClearBase\](bit 6)=1*, loading a segment register with a null selector clears the base address and limit of the segment register in all cases except a load of *DS*, *ES*, *FS*, or *GS* by an *IRET*, *IRETQ*, or *RETF* instruction that changes the current privilege level, in which case these fields are left untouched.
> 
> - If *CPUID Fn 8000_0021_EAX\[NullSelectorClearBase\](bit 6)=0*, loading a segment register with a null selector makes the base address and limit of the segment register undefined. Because references to segment registers containing a null selector causes a *\#GP* exception, the segment base and limit values have not effect. However, OS management of segment state may be simplified for processors supporting this clearing functionality.



### Segment Registers

Six 16-bit segment registers are provided for referencing up to six segments at one time. <span style="color:#FFD60A">All software tasks require segment selectors to be loaded in the CS and SS registers.</span> Use of the *DS*, *ES*, *FS*, *GS* segments is optional, but nearly all software accesses data and therefore requires a selector in the *DS* register.

The following figure lists the supported segment registers and their functions.
![[image/amd64/vol2/chap-04/segment-register-function.png]]

>[!note]
> The processor maintains a *hidden portion* of the segment register in addition to the selector value loaded by software.
> - This hidden portion contains the values found in the descriptor-table entry referenced by the segment selector.
> - The processor loads the descriptor-table entry into the hidden portion when the segment register is loaded.
> - <span style="color:#D0F4DE">By keeping the corresponding descriptor-table entry in hardware, performance is optimized for the majority of memory references.</span>

The following figure shows the format of the visible and hidden portions of the segment register. Except for the *FS* and *GS* segment base, software cannot directly read / write the hidden portion(*shown as gray-shaded boxes*).
![[image/amd64/vol2/chap-04/segment-register-layout.png]]

- @ **CS Register**. Contains the segment selector referencing the *current code-segment descriptor entry*. 
	- <span style="color:#FFD60A">All instruction fetches reference the CS descriptor</span>.
	- <span style="color:#FFD60A">When a new selector loaded into the CS register, the current-privilege level(CPL) of the processor is set to that of the CS-segment descriptor-privilege level(DPL)</span>.

- **Data-Segment Registers.** 
	- @ *DS* register contains the segment selector referencing the *default data-segment descriptor entry*.
	- @ *SS* register contains the stack-segment selector.
	- @ *ES*, *FS*, and *GS* registers are optionally loaded with segment selectors referencing other data segments.
	- Data accesses default to referencing the *DS* descriptor except in the following two cases:
		- The *ES* descriptor is referenced for *string-instruction destinations*.
		- The *SS* descriptor is referenced for *stack operation*.

### Segment Registers in 64-Bit Mode

- @ **CS Register in 64-Bit Mode**. 

In *64-bit* mode, most of the hidden portion of the *CS* register is ignored. Only the *L*(long), *D*(default operation size), and *DPL*(descriptor privilege-level) attributes are recognized by *64-bit* mode.

>[!note]
> - Address calculation assume a *CS.base* value of 0.
> - CS references do not check the *CS.limit* value, <span style="color:#D0F4DE">but instead check that the effective address is in canonical form</span>.


- @ **DS, ES and SS Registers in 64-bit Mode**. 

In *64-bit* mode, the contents of the *ES*, *DS*, and *SS* segment registers are ignored. All fields (base, limit and attribute) in the hidden portion of the segment register are ignored.

>[!note]
> - Address calculations in 64-bit mode that reference the *ES*, *DS* or *SS* segments are treated as if the *segment base is 0*.
> - Instead of performing limit checks, <span style="color:#D0F4DE">the processor checks that all virtual-address references are in canonical form</span>.

>[!important]
> Neither enabling and activating *long mode* nor switching between *64-bit* and *compatibility* modes changes the contents of the visible / hidden portions of the segment registers. These register remain unchanged during *64-bit* mode execution unless explicit segment loads are performed.


- @ **FS and GS Registers in 64-Bit Mode**. 

Unlike the *CS*, *DS*, *ES*, *SS* segments, the *FS* and *GS* segment overrides can be used in *64-bit* mode.

>[!tip]
> When *FS* and *GS* segment overrides are used in *64-bit* mode, their respective base addresses are used in the *effective-address(EA)* calculation. The complete *EA* calculation then becomes <span style="color:#FB8500">(FS / GS).base + (scale \* index) + displacement</span>. *The FS.base and GS.base values are also expanded to the full 64-bit virtual-address size*, as shown below. <span style="color:#FB8500">The resulting EA calculation is allowed to wrap across positive and negative addresses</span>.

![[image/amd64/vol2/chap-04/fs-gs-64bit-layout.png]]

>[!note]
> Instead of performing limit / attributes checks, <span style="color:#D0F4DE">the processor checks that all virtual-address references are in canonical form</span>.

Segment register-load instructions(*MOV to Sreg* and *POP Sreg*) load only a 32-bit base-address value into the *hidden portion* of the *FS* and *GS* segment registers. The base-address bits above the *low 32-bit* are cleared to 0 as a result of a segment-register load.

These are two methods to update the contents of the *FS.base* and *GS.base* hidden descriptor fields. 
- The first is available exclusively to privileged software(*CPL = 0*). <span style="color:#FFD60A">The FS.base and GS.base hidden descriptor-register fields are mapped to MSRs</span>. Privileged software can load a *64-bit* base in canonical form into *FS.base* / *GS.base* using a single *WRMSR* instruction. The *FS.base MSR* address is *C000_0100h* while *GS.base MSR* address is *C000_0101h*.
- The second method of updating the *FS* and *GS* base fields is available to software running at any privilege level(when supported by the implementation and enabled by setting [[chap-03-System Resources#CR4 Register|CR4[FSGBASE] ]]). The *WRFBASE* and *WRGBASE* instructions copy the contents of *GPR* to the *FS.base* and *GS.base* fields respectively.

>[!info]
> When the operand size is 32-bit, the upper doubleword of the base is cleared. *WRFSBASE* and *WRGSBASE*  are only supported in the *64-bit* mode.

>[!exception]
> The addresses written into the expanded *FS.base* and *GS.base* registers must be in canonical form. Any instruction that attempts to write a non-canonical address to these registers causes a *general-protection exception(\#GP)* to occur.

>[!note]
> When in *compatibility mode*, the *FS* and *GS* overrides operate as defined by the *legacy x86 arch* regardless of the value loaded into the high 32-bit of the hidden descriptor-register base-address field. *Compatibility* mode ignores the high 32-bit when calculating an *effective address*.


## Descriptor Tables

>[!definition]
> <span style="color:#FFD60A">Descriptor tables are used by the segmentation mechanism when protected mode is enabled</span>([CR0.PE=1](chap-03-System%20Resources#CR0%20register)). These tables hold descriptor entries that describe the *location*, *size*, and *privilege* attributes of a segment. <span style="color:#FFD60A">All memory references in protected mode access a descriptor-table entry</span>.

As previously mentioned, there are 3-type of *descriptor tables* supported by the *x86* segmentation mechanism:
- *Global descriptor table(GDT)*
- *Local descriptor table(LDT)*
- *Interrupt descriptor table(IDT)*

>[!note]
> Software establishes the location of a descriptor table in *memory* by initializing its *corresponding descriptor register*.

### Global Descriptor Table

>[!warning]
> - Protected-mode software must create a global descriptor table(*GDT*).
> 
> - The *GDT* contains *code-segment* and *data-segment* descriptor entries(user segments) for segments that can be shared by all tasks.
> 
> - In addition to the user segments, The *GDT* can also hold gate descriptors and other system-segment descriptors.
> 
> - System software can store the GDT *anywhere* in memory and should protect the segment containing the *GDT* from non-privilege software.

 [[chap-04-Segmented Virtual Memory#Segment Selectors|Segment selectors]] point to the *GDT* when the *table-index(TI)* bit in the selector is cleared to 0.
 - The selector index portion of the segment selector references a specific entry in the *GDT*.
The following figure shows the how the segment selector indexes into the *GDT*.
 ![[global-and-local-descriptor-table-access.png]]
>[!imprtant]
> One special form is the [[chap-04-Segmented Virtual Memory#Segment Selectors|null selector]].
> - A *null selector* points to the first entry in the *GDT*(the selector index is 0 and *TI* = 0)
> - However, null selectors do not reference memory, so the first *GDT* entry cannot be used to describe a segment.
> - <span style="color:#FB8500">The first usable *GDT* entry is referenced with a selector index of 1</span>.

### Global Descriptor-Table Register

>[!definition]
> The *global descriptor-table register(GDTR)* points to the location of the *GDT* in memory and defines its size. This register is loaded from memory using the *LGDT* instruction. 

Figure 4-7 shows the format of the GDTR in *legacy mode* and *compatibility mode*.

![[gdtr-ldtr-format.legacy-mode.png]]

Figure 4-8 shows the format of the *GDTR* in *64-bit* mode.
![[gdtr-ldtr-format.64bit-mode.png]]

The *GDTR* contains 2 fields:
- & **Limit**. 2 bytes. 

Defines the *16-bit* limit, or size, of the *GDT* in bytes. The limit value is added to the base address to yield the *ending byte address* of the *GDT*.

>[!exception]
> A *general-protection exception(\#GP)* occurs if software attempts to access a descriptor beyond the *GDT* limit.

>[!note]
> The offsets into the descriptor tables are not extended by the *AMD64* arch in support of *long mode*. Therefore, the *GDTR* and *IDTR* limit-field sizes are **unchanged** from the legacy sizes. The processor does not check the limit in *long mode* during *GDT* and *IDT* accesses.

- & **Base Address**. 8 bytes. 

Holds the starting byte address of the *GDT* in virtual-memory space.

>[!important]
> The *GDT* can be located at any byte address in virtual memory, but system software should align the *GDT* on a *double-word boundary* to avoid the potential performance penalties associated with accessing unaligned data.

The AMD64 architecture increases the base-address field of the *GDTR* to 64-bit so that system software running in long mode can locate the *GDT* anywhere in the *64-bit* virtual-address space. 

The processor ignores the *high-order 4 bytes* of base address when running in *legacy mode*.

### Local Descriptor Table

>[!definition]
> Protected-mode system software can optionally create a *local descriptor table(LDT)* to hold segment descriptors belonging to a single task / multiple tasks.

>[!note]
> - The *LDT* typically contains *code-segment* and *data-segment* descriptors as well as gate descriptors referenced by the specified task.
> - Like the *GDT*, system software can store the *LDT* anywhere in *memory* and should protect the segment containing the *LDT* from non-privileged software.

 [[chap-04-Segmented Virtual Memory#Segment Selectors|Segment selectors]] point to the *LDT* when the *table-index(TI)* bit in the selector is set to 1.
 - The selector index portion of the segment selector references a specific entry in the *LDT*.(see Figure 4-6)
>[!important]
> Unlike the *GDT*, however, a selector index of 0 references the first entry in the *LDT*(when *TI* = 1, the selector is not a null selector).

>[!note]
> - <span style="color:#D0F4DE">*LDTs* are described by system-segment descriptor entries located in the *GDT*</span>.
> - The *LDT* system-segment descriptor defines the *location*, *size* and *privilege rights* for the LDT.

Figure 4-9 shows the relationship between the *LDT* and *GDT* data structures.

![[gdt-ldt-relationship.png]]

>[!exception]
> Loading a *null selector* into the *LDTR* is useful if software does not use an *LDT*. This causes a \#GP if the erroneous reference is made to the *LDT*.

### Local Descriptor-Table Register

>[!definition]
> The *local descriptor-table register(LDTR)* points to the location of the *LDT* in memory, defines its *size*, and specific its *attributes*.

The *LDTR* has two portions.
- A *visible* portion holds the *LDT* selector.
- A *hidden* portion holds the *LDT* descriptor.

>[!procedure]
> When the LDT selectors is loaded into the *LDTR*, the processor automatically loads the *LDT* descriptor from the *GDT* into the *hidden portion* of the *LDTR*.

The *LDTR* is loaded in one of two ways:
- Using the *LLDT* instruction.
- Performing a task switch.

Figure 4-10 shows the format of the *LDTR* in *legacy mode*.
![[ldtr-layout.legacy.png]]

Figure 4-11 shows the format of the *LDTR* in *long mode*(both *compatibility mode* and *64-bit mode*)
![[ldtr-layout.long.png]]

The *LDTR* contains 4 fields:
- & **LDT Selector**. 2bytes. 

<span style="color:#FFD60A">These bits are loaded explicitly from the <span style="color:#FB8500">TSS</span> during a task switch, or by using the LLDT instruction</span>.

>[!exception]
> The *LDT* selector must point to an *LDT* system-segment descriptor entry in the *GDT*. If it does not, a *general-protection exception(\#GP)* occurs.

The following three fields are loaded automatically from the *LDT descriptor* in the *GDT* as result of loading the *LDT* selector. The register fields are shown as shaded boxes in Figure 4-10 and Figure 4-11.

- & **Base Address**. 

Holds the starting bytes address of the *LDT* in virtual-memory space. 

>[!warning]
> The *LDT* can be located at any byte address in virtual memory, but system software should align the *LDT* on a *double-word boundary* to avoid the potential performance penalties associated with accessing unaligned data.

The AMD64 architecture increases the base-address field of the *LDTR* to 64-bit so that system software running in long mode can locate the *LDT* anywhere in the *64-bit* virtual-address space. 

The processor ignores the *high-order 4 bytes* of base address when running in *legacy mode*.

>[!tip]
> - Because the *LDTR* is loaded from the *GDT*, the system-segment descriptor format(*LDTs* are system segments) has been expanded by the AMD64 arch in support of *64-bit* mode.
> - The high-order base-address bits are only loaded from *64-bit* mode using the *LLDT* instruction.

- & **Limit**. 

Defines the limit, or size, of the LDT in bytes. <span style="color:#FFD60A">The LDT limit as stored in the LDTR is 32 bits.</span>

>[!tip]
> When the *LDT* limit is loaded from the *GDT* descriptor entry, the 20-bit limit field in the descriptor is expanded to 32 bits and scaled based on the value of *descriptor granularity(G) bit*.

>[!exception]
> If an attempt is made to access a descriptor beyond the *LDT* limit, a *general-protection exception(\#GP)* occurs.

>[!note]
> The *offsets* into the descriptor tables are not extended by the AMD64 arch in support of *long* mode. Therefore, the *LDTR* limit-field size is unchanged from the legacy size. *The processor does check the LDT limit in long mode during LDT accesses*.

- & **Attributes**. 

This field holds the descriptor attributes, such as *privilege rights*, *segment presence* and *segment granularity*.

### Interrupt Descriptor Table

- Multiple *IDTs* can be maintained by system software. 
- System software selects a specific *IDT* by loading the *interrupt descriptor table register(IDTR)* with a pointer to the *IDT*.
- As with *GDT* and *LDT*. system software can store the *IDT* anywhere in memory and should protect the segment containing the *IDT* from non-privileged software.

The *IDT* can contain only the following types of *gate descriptors*:
- Interrupt gates
- Trap gates
- Task gates

>[!exception]
> A general-protection exception(*\#GP*) occurs if the IDT descriptor referenced by an interrupt / exception is not one of the types listed above.

>[!note]
> *IDT* entries are selected using the *interrupt vector number* rather than a selector value. The interrupt vector number is scaled by the interrupt-descriptor entry size to form an offset to form an offset into the *IDT*. The interrupt-descriptor entry size depends on the processor operating mode as follows:
> - In *long mode*, interrupt descriptor-table entries are 16 bytes.
> - In *legacy mode*, interrupt descriptor-table entries are 8 bytes.

Figure 4-12 shows how the interrupt vector number indexes the *IDT*.
![[indexing-idt.png]]


### Interrupt Descriptor-Table Register

The *interrupt descriptor-table register (IDTR)* points to the *IDT* in memory and defines its size. This register is loaded from memory using the *LIDT* instruction.

The format of the *IDTR* is identical to that of *GDTR* in all modes.

- The *offsets* into the descriptor tables are not extended by the AMD64 arch in support of *long mode*. Therefore, the *IDTR* limit-field size is unchanged from the *legacy* size. 
- The processor does check the *IDT* limit in *long mode* during *IDT* accesses.

## Legacy Segment Descriptors

### Descriptor Format

*Segment descriptor* define, protect, and isolate segments from each other.

There are two basic types of descriptors, each of which used to describe different segment(or gate) types:
- **User Segments**: These include code segments and data segments. *Stack segments are a type of data segment.*
- **System Segments**: System segments consist of *LDT* segments and <span style="color:#FB8500">task-state segment(TSS)</span>. *Gate descriptor* are another type of system-segment descriptor. *Rather than describing segments, gate descriptors point to program entry points*.

Figure 4-13 shows the generic format for user-segment and system-segment descriptors. 

>[!tip]
> User and system segments are differentiated using the *S* bit.
> - *S* = 1 indicates a user segment.
> - *S* = 0 indicates a system segment.

Gray shading indicates the field / bit is reserved. *The format for a gate descriptor differs from the generic descriptor.*

![[generic-descriptor-layout.legacy.png]]

Figure 4-13 shows the fields in a generic, *legacy-mode*, 8-byte(two double-word) *segment descriptor*. In this figure, the upper double-word(located at byte offset +4) is shown on top and the lower-double(located at byte offset +0) is shown on the bottom.

The fields are defined as follows:

- & **Segment Limit**. 

<span style="color:#FFD60A">The 20-bit segment limit is formed by concatenating [19:16] of the upper double-word with bits [15:0] of lower double-word</span>. 
- The segment limit defines the segment size, in *bytes*.
- The *Granularity(G)* bit controls how the *segment-limit* field is scaled.
- For data segments, the *expand-down(E)* bit determines whether the segment limit defines the lower / upper segment-boundary.

>[!exception]
> If software references a segment descriptor with an address beyond the segment limit, a *general-protection exception(\#GP)* occurs.The *\#GP* occurs if any part of the memory reference falls outside the segment limit(*e.g. a double-word(4-byte) address reference causes a \#GP if one / more bytes are located beyond the segment limit.*)

- & **Base Address**. 

<span style="color:#FFD60A">The 32-bit base address is formed by concatenating bits [31:24] of the upper double-word with bits [7:0] of the same double-word and bits [15:0] of the lower double-word</span>. The segment-base address field locates the start of a segment in virtual-address space.

- & **S Bit and Type Field**. 

<span style="color:#FFD60A">Bit 12 and bits [11:8] of the upper double-word</span>. The *S* and *Type* fields, together, specify the descriptor type and its access characteristics. Table 4-2 summarizes the descriptor types by *S-field* encoding and gives a cross reference to descriptions of the *Type-field* encodings.
![[descriptor-types.png]]

- & **Descriptor Privilege-Level(DPL) Field**.

<span style="color:#FFD60A">Bits [14:13] of the upper double-word</span>. The *DPL* field indicates the descriptor-privilege level of the segment. *DPL* can be set to any value from 0 to 3, with 0 specifying the most privilege and 3 the least privilege.

- & **Present(P) Bit**.

<span style="color:#FFD60A">Bit 15 of the upper double-word</span>. The *segment-present bit* indicates that the segment referenced by the descriptor is loaded in memory.

>[!exception]
> If a reference is made to a descriptor entry when *P* = 0, a *segment-not-present exception(\#NP)* occurs. This bit is set & cleared by system software and is *never altered by the processor*.

- & **Available To Software(AVL) Bit**.

<span style="color:#FFD60A">Bit 20 of the upper double-word</span>. This field indicates whether the segment is available to software, which can write *any* value to it. *The processor does not set / clear this field*.

- & **Default Operand Size(D/B) Bit.** 

<span style="color:#FFD60A">Bit 22 of the upper double-word</span>. 
	- When *D/B* = 1, indicates a 32-bit default operand size.
	- When *D/B* = 0, indicates a 16-bit default operand size.
	
>[!tip]
> The default operand-size bit is found in *code-segment* & *data-segment descriptors* but not in *system-segment descriptors*.

The effect this bit has on a segment depends on the segment-descriptor type.

- & **Granularity(G) Bit**. <span style="color:#FFD60A">Bit 23 of the upper double-word</span>. 

The granularity bit specifies how the segment-limit field is scaled.
	- When *G* = 0, indicates that the limit field is not scaled. *In this case, the limit equals the number of bytes available in the segment*.
	- When *G* = 1, indicates that the limit field is scaled by *4KB(4096 bytes)*. Here, the limit field equals the number of 4-KB blocks available in the segment.
	
>[!tip]
> Setting a limit of 0 indicates 1-byte segment limit when *G* = 0. Setting the same limit of 0 when *G* = 1 indicates a segment limit 4095.

- % **Reserved Bits**. Generally, software should clear all reserved bits to 0, so they can be defined in future revisions to AMD64.


### Code-Segment Descriptors

Figure 4-14 shows the code-segment descriptor format(*gray shading indicates the bit is reserved*).

>[!important]
> All software tasks require that a segment selector, referencing a valid code-segment descriptor, is loaded into the *CS* register.

Code segments establish the processor *operating mode* and *execution privilege-level*. The segments generally contain only instructions and are *execute-only*, or *execute and read-only*. 

>[!Caution]
> Software cannot write into a segment whose selector references a code-segment descriptor.

![[code-segment-descriptor-layout.legacy.png]]

>[!note]
> Code-segment descriptors have the *S* bit set to 1, identifying the segments as user segments. *Type-field* bit 11 differentiates code-segment descriptors(bit 11 set to 1) from data-segment descriptors(bit 11 cleared to 0). 

The remaining *type-field* bits\[10:8\] define the access characteristics for the code-segment as follows:

- & **Conforming(C) Bit**.

<span style="color:#FFD60A">Bit 10 of the upper double-word</span>. Setting this bit to 1 identifies the code segment as *conforming*.
- When control is transferred to a higher-privilege conforming code-segment(*C* = 1) from a lower-privilege code segment, the processor *CPL* does not change.
- Transfers to non-conforming code-segments(*C* = 0) with a higher privilege-level than the *CPL* can occur through *gate descriptors*.


- & **Readable(R) Bit**.

<span style="color:#FFD60A">Bit 9 of the upper double-word</span>. Setting this bit to 1 indicates the code segment is both executable and readable as data. 

>[!exception]
> When this bit is cleared to 0, the code segment is executable, but attempt to read data from the code segment cause a *general-protection exception(\#GP)* to occur.
> 


- & **Accessed(A) Bit**.

<span style="color:#FFD60A">Bit 8 of the upper double-word</span>. The accessed bit is set to 1 by the *processor* when the descriptor is copied from the *GDT* / *LDT* into the *CS* register. *This bit is only cleared by software*.

Table 4-3 summarizes the code-segment type-field encodings.
![[code-segment-descriptor-types.png]]


- & **Code-Segment Default-Operand Size(D) Bit**. <span style="color:#FFD60A">Bit 22 of byte + 4</span>. 

In code-segment descriptors, the *D* bit selects the *default operand size* and *address sizes*. In *legacy mode*, 
- When *D* = 0, the default operand size and address size is 16 bits.
- When *D* = 1, the default operand size and address size is 32 bits.

>[!tip]
> Instruction prefixes can be used to override the operand size / address size, or both.

### Data-Segment Descriptors

Figure 4-15 shows the data-segment descriptor format. Data segments contain non-executable information and can be accessed as read-only or read/write.

They are referenced using the *DS*, *ES*, *FS*, *GS*, or *SS* data-segment registers.
- The *DS* data-segment register holds the segment selectors for default data segment.
- The *ES*, *FS*, and *GS* data-segment registers hold segment selectors for additional data segments usable by the current software task.

>[!caution]
> The stack segment is a special form of data-segment register. It is referenced using the *SS* segment register and must be *read/write*. 
> When loading the *SS* register, the processor requires that the selector reference a valid, writable data-segment descriptor.
> 

![[data-segment-descriptor-layout.legacy.png]]

 - Data-segment descriptors have the *S* bit set to 1, identifying them as user segments.
 - Type-field bit 11 differentiates data-segment descriptors(bit 11 cleared to 0) from code-segment descriptors(bit 11 to 1).
The remaining type-field bits\[10:8\] define the data-segment access characteristics, as follows:

- & **Expand-Down(E) Bit**. <span style="color:#FFD60A">Bit 10 of the upper double-word</span>. Setting this bit identifies the data segment as *expand-down*.

>[!note]
> - In expand-down segments, the segment limit defines the *lower* segment boundary while the *base* is the *upper* boundary.
> - Valid segment offsets in expand-down segments lie in <span style="color:#D0F4DE">\[byte range limit + 1, FFFFh / FFFF_FFFFh\]</span>, depending on the value of the *data segment default operand size(D/B) bit*.

>[!tip]
> Expand-down segments are useful for stacks, <span style="color:#FB8500">which grow in the downward direction as elements are pushed onto the stack. The stack pointer, *ESP*, is *decremented* by an equal to the operand size as a result of executing a *PUSH* instruction</span>.

Clearing the *E* bit to 0 identifies the data segment as *expand-up*. Valid segment offsets in expand-up segment lie in <span style="color:#FFD60A">[byte 0, segment limit]</span>.


- & **Writable (W) Bit**. <span style="color:#FFD60A">Bit 9 of the upper double-word</span>. Setting this bit to 1 identifies the data segment as read/write.
	- When this bit is cleared to 0, the segment is read-only.
	
>[!exception]
> A *general-protection exception(\#GP)* occurs if software attempts to write into a data segment when *W* = 0.


- & **Accessed(A) Bit**. <span style="color:#FFD60A">Bit 8 of the upper double-word</span>. 

The accessed bit is set to 1 by the *processor* when the descriptor is copied from the *GDT* / *LDT* into the *CS* register. *This bit is only cleared by software*.

Table 4-4 summarize the data-segment type-field encodings.
![[data-segment-descriptor-types.png]]


- & **Data-Segment Default Operand Size(D/B) Bit**. <span style="color:#FFD60A">Bit 22 of the upper double-word</span>. 
	- For expand-down data segments(*E* = 1), setting *D* = 1 sets the upper bound of the segment at *0_FFFF_FFFFh*. Clearing *D* = 0 sets the upper bound of the segment at *0_FFFFh*.
	
>[!tip]
> In the case where a data segment is referenced by the *stack selector(SS)*, the *D* bit is referred to as the *B* bit. For stack segments, the *B* bit sets the default stack size, 
> - Setting *B* = 1 establishes a 32-bit stack referenced by the 32-bit *ESP* register.
> - Clearing *B* = 0 establishes a 16-bit stack referenced by the 16-bit *SP*  register.


### System Descriptors

>[!definition]
> There are two general types of system descriptors: *system-segment descriptors* and *gate descriptors*.
> - System-segment descriptors are used to describe the *LDT* and <span style="color:#FB8500">TSS</span> segments.
> - Gate descriptors do not describe segments, but instead hold <span style="color:#FFD60A">pointers to code-segment descriptors</span>. *Gate descriptors are used for protected-mode control transfers between less-privileged and more-privileged software*.


>[!note]
> System-segment descriptors have the *S* bit cleared to 0. The type field is used to differentiate the various *LDT*, *TSS*, and *gate descriptor* from one another.

[[chap-04-Segmented Virtual Memory#^9196bc|Table 4-5]] summarizes the system-segment type-field encodings.
![[system-descriptor-types.legacy.png]]

Figure 4-16 shows the legacy-mode system-segment descriptor format used for referencing *LDT* and *TSS* segments(gray shading indicates the bit is reserved). This format is also used in *compatibility mode*. The system-segments are used as follows:
- The *LDT* typically holds segment descriptors belonging to a single task.
- The <span style="color:#FB8500">TSS</span> is a data structure for holding processor-state information. Processor state is saved in a <span style="color:#FB8500">TSS</span> when a task is suspended, and state is restored from the <span style="color:#FB8500">TSS</span> when a task is restarted. System software must create at least one <span style="color:#FB8500">TSS</span> referenced by the task register, *TR*.
![[ldt-tss-descriptor-layout.legacy.png]]

### Gate Descriptors

*Gate descriptors* hold *pointers* to code segments and are used to control access between code segments with different privilege levels. There are four types of *gate descriptors*:
- @ **Call Gates**: These gates are located in the *GDT* / *LDT* and are used to control access between code segments <span style="color:#FFD60A">in the same task / in different tasks</span>. 
![[call-gate-descriptor-layout.legacy.png]]
 ^af2f7a

- @ **Interrupt Gates and Trap Gates**: These gates are located in the *IDT* and are used to control access to *interrupt-service routine*.
![[interrupt-gate-and-trap-gate-descriptor-layout.legacy.png]]


- @ **Task Gates**: These gates are used to control access between different tasks. They are also used to transfer control to interrupt-service routines if those routines are themselves a separate task.
![[task-gate-descriptor-layout.legacy.png]]


There are several differences between the *gate-descriptor* format and the *system-segment descriptor* format. These differences are described as follows, from least-significant to most-significant bit positions:

- & **Target Code-Segment Offset**.

<span style="color:#FFD60A">The 32-bit segment offset is formed by concatenating bits [31:16] of byte +4 with bits [15:0] of byte +0. The segment-offset field specifies the target-procedure entry point(offset) into the segment</span>. 

>[!note]
> This field is loaded into the *EIP* register as a result of a control transfer using the gate descriptor.

- & **Target Code-Segment Selector**. 

<span style="color:#FFD60A">Bits [31:16] of bytes +0</span>. The segment-selector field identifies the *target-procedure segment descriptor*, located in either *GDT* or *LDT*. 

>[!note]
> The segment selector is loaded into the *CS* segment register as a result of a control transfer using the gate descriptor.


- & **TSS Selector**. 

<span style="color:#FFD60A">Bits [31:16] of byte +0(task gate only)</span>. This field identifies the target-task <span style="color:#FB8500">TSS</span> descriptor, located in any of the three *descriptor tables*(*GDT*, *LDT* and *IDT*).

- & **Parameter Count(Call Gates Only)**.

<span style="color:#FFD60A">Bits [4:0] of byte +4</span>. *Legacy-mode* *call-gate descriptors* contain a 5-bit *parameter-count* field. 

>[!note]
> This fields specifies the number of parameters to be copied from the *currently-executing program stack* to the *target program stack* during an automatic stack switch. ^2f411f

>[!tip]
> - Automatic stack switches are performed by the processor during a control transfer through a call gate to a *greater* privilege-level.
> - The parameter size depends on the call-gate size as specified in the type field. 32-bit call gates copy 4-byte parameters, and 16-bit call gates copy 2-byte parameters.


## Long-Mode Segment Descriptors

>[!summary]
> The interpretation of descriptor fields is changed in *long mode*, and in some cases the format is expanded. <span style="color:#FFD60A">The changes depends on the operating mode (compatibility mode / 64-bit mode) and on the descriptor type.</span>

### Code-Segment Descriptors

Code segments continue to exist in long mode. Code segments and their associated descriptors and selectors are needed to establish the *processor operating mode* as well as *execution privilege-level*. 
 - The new *L* attributes specifies whether processor is running in *compatibility mode* / *64-bit mode*.
 
Figure 4-20 shows the *long-mode* *code-segment descriptor* format. In *compatibility mode*, the code-segment descriptor is interpreted and behaves just as it does in *legacy mode*.

In Figure 4-20, *gray shading* indicates the code-segment descriptor fields that are *ignored* in *64-bit mode* when the descriptor is used during a memory reference. <span style="color:#FFD60A">However, the fields are loaded whenever the segment register is loaded in 64-bit mode</span>.

![[code-segment-descriptor-layout.long.png]]

- **Fields Ignored in 64-Bit Mode**. 
>[!caution]
> Segmentation is disabled in *64-bit* mode, and code segments span all of virtual memory.
> - In this mode, code-segment base address is ignored. For the purpose of virtual-address calculations, the base address is treated as if it has a value of zero.
> - Segment-limit checking is not performed, and both the *segment limit field* and *granularity(G)* bit are ignored. Instead, the virtual address is checked to see if it is in *canonical-address* form.
> - The *readable(R)* and *accessed(A)* attributes in the type field are also ignored.

- & **Long(L) Attribute Bit**. 

<span style="color:#FFD60A">Bit 21 of bytes + 4</span>. The bit specifies that the processor is running in *64-bit mode*(*L* = 1) / *compatibility mode*(*L* = 0). When the processor is running in legacy mode, this bit is reserved.
>[!note]
> - Compatibility mode maintains binary compatibility with *legacy 16-bit* and *32-bit* applications.
> - *Compatibility mode* is selected on a *code-segment* basis, and it allows *legacy* applications to coexist under the same *64-bit* system software along with *64-bit* applications running *64-bit* mode.
> - System software running in long mode can execute existing *16*-bit and *32*-bit applications by clearing the *L* bit of the code-segment descriptor to 0.

 When *L* = 0, the legacy meaning of the code-segment *D* bit -- and the *address-size* and *operand-size* prefixes -- are observed.
 
 Segmentation is enabled when *L* = 0. From an application viewpoint, the processor is in a legacy 16-bit / 32-bit operating environment(depending on the *D* bit), even though *long mode* is activated.
 
 If the processor is running *64*-bit mode(*L* = 1), the only valid setting of *D* bit is 0. <span style="color:#FFD60A">This setting produces a default operand size of 32-bit and a default address size of 64 bits</span>. *The combination L = 1 and D = 1 is reserved for future use*.

### Data-Segment Descriptors

Data segments continue to exist in long mode. 

Figure 4-21 shows the *long-mode* *data-segment descriptor* format. In *compatibility mode*, the data-segment descriptor is interpreted and behaves just as it does in *legacy mode*.

In Figure 4-20, *gray shading* indicates the data-segment descriptor fields that are *ignored* in *64-bit mode* when the descriptor is used during a memory reference. <span style="color:#FFD60A">However, the fields are loaded whenever the segment register is loaded in 64-bit mode</span>.
![[data-segment-descriptor-layout.long.png]]

- **Field Ignored in 64-Bit Mode**. Segmentation is disabled in *64*-bit mode. The interpretation of the segment-base address depends on the segment register used:
	- In data-segment descriptors referenced by the *DS*, *ES*, *SS* segment registers, the *base-address* field is ignored. For the purpose of virtual-address calculations, the base address is treated as if it has a value of zero.
	- <span style="color:#FFD60A">Data segments referenced by the FS and GS segment registers receive special treatment in 64-bit mode. For these segments, the base address field is not ignored, and a non-zero value can be used in virtual-address calculations</span>. [[chap-04-Segmented Virtual Memory#Segment Registers in 64-Bit Mode|A 64-bit segment-base address can be specified using mode-specific registers]].

>[!note]
> - Segment-limit checking is not performed on any data segments in *64*-bit mode.
> - The segment-limit field and *granularity(G)* bit are ignored. 
> - The *D/B* bit is unused in *64*-bit mode.
> - The *expand-down(E)*, *writable(W)*, and *accessed(A)* type-field attributes are ignored.
> - A *data-segment-descriptor DPL* field is ignored in 64-bit mode, and segment-privilege checks are not performed on data segments. <span style="color:#FB8500">System software can use the page-protection mechanisms to isolate and protect data from unauthorized access</span>.

### System Descriptors

In *long mode*, the allowable system-descriptor types encoded by the type field are changed. Some descriptor types are modified, and others are illegal. The changes are summarized in Table 4-6.  ^339424

>[!exception]
> An attempt to use an illegal descriptor type causes a *general-protection exception(\#GP)*.

![[system-segment-descriptor-types.long.png]]
![[system-segment-descriptor-types.long.continue.png]]

In *long mode*, the modified system-segment descriptor types are:
- The *32-bit* *LDT*(02h), which is redefined as the *64-bit* *LDT*.
- The available *32-bit* <span style="color:#FB8500">TSS</span>(09h), which is redefined as the available *64-bit* <span style="color:#FB8500">TSS</span>.
- The busy *32-bit* <span style="color:#FB8500">TSS</span>, which is redefined as the busy *64-bit* <span style="color:#FB8500">TSS</span>.

In *64-bit* mode, the *LDT* and <span style="color:#FB8500">TSS</span> system-segment descriptors are expanded by *64-bits*, as shown in Figure 4-22. In this figure, *gray shading* indicates the fields that are *ignored in 64-bit mode*. <span style="color:#FFD60A">Expanding the descriptors allows them to hold 64-bit base addresses, so their segments can be located anywhere in the virtual-address space. The expanded descriptor can be loaded into the corresponding descriptor-table register(LDTR / TR) only from 64-bit mode</span>.

![[system-segment-descriptor-layout.long.png]] ^e19ea6

>[!exception]
> The 64-bit system-segment base address must be in *canonical form*. Otherwise, a *general-protection exception* occurs with a selector error-code, \#GP(selector), when the system segment is loaded.

>[!info]
> System-segment limit values are checked by the processor in both 64-bit and compatibility modes, under the control of the granularity(*G*) bit.

>[!exception]
> Figure 4-22 shows that bits \[12:8\] of double-word + 12 must be cleared to 0. These bits correspond to the *S* and *Type fields* in a legacy descriptor. 
>
> Clearing these bits to 0 corresponds to an illegal type in legacy mode and cause *\#GP* if an attempt is made to access the upper half of a 64-bit mode system-segment descriptor as a legacy descriptor or as the lower half of a 64-bit mode system-segment descriptor.
>

### Gate Descriptors

As shown in [[chap-04-Segmented Virtual Memory#^e19ea6|Table 4-6]], the allowable *gate-descriptor* types are changed in *long mode*. Some gate-descriptor types are modified and other are illegal. The modified *gate-descriptor* types in *long mode* are:
- The 32-bit call gate(0Ch), which is redefined as the 64-bit call gate.
- The 32-bit interrupt gate(0Eh), which is redefined as the 64-bit interrupt gate.
- The 32-bit trap gate(0FH), which redefined as the 64-bit gate.

>[!exception]
> In *long mode*, several gate-descriptor types are illegal. An attempt to use these gates causes a *general protection exception(\#GP)* to occur. The illegal gate types are:
> - The 16-bit call gate (04h).
> - The task gate (05h).
> - The 16-bit interrupt gate (06h).
> - The 16-bit trap gate(07h).

In *long mode*, *gate descriptors* are expanded by *64* bits, allowing them to hold *64-bit* offsets. 

The 64-bit *call-gate descriptor* is shown in Figure [[chap-04-Segmented Virtual Memory#^a6abe5|4-23]] and the 64-bit interrupt gate and trap gate are shown in Figure [[chap-04-Segmented Virtual Memory#^09fc2c|4-24]]. In these figures, *gray* shading indicates the fields that are ignored in *long mode*. <span style="color:#FFD60A">The interrupt and trap gates contain an addition field, The IST, that is not present in the call gate</span>.

![[call-gate-layout-descriptor.long.png]] ^a6abe5

![[trap-gate-and-interrupt-gate-layout-descriptor.long.png]] ^09fc2c

>[!exception]
> The target code segment referenced by a *long-mode* gate descriptor must be a 64-bit code segment(*CS.L = 1*, *CS.D = 0*). If the target is not *64-bit* code segment, a *general-protection exception*, \#GP, occurs. The error code reported depends on the gate type:
> - Call gates report the target code-segment selectors as the error code.
> - Interrupt and trap gates report the interrupt vector number as the error code.

>[!exception]
> A *general-protection exception*, \#GP(0), occurs if software attempts to reference a long-mode gate descriptor with a target-segment offset that is not in *cannonical* form.

>[!tip]
> It is possible for software to store legacy and long mode gate descriptors in the same descriptor table.

>[!warning]
> [[chap-04-Segmented Virtual Memory#^a6abe5|Figure 4-23]] shows that bits \[12:8\] of bytes + 12 in long-mode call gate must be cleared to 0. These bits correspond to the S and Type field in a legacy call gate.
> 
> Clearing these bits to 0 corresponds to an illegal type in legacy mode and cause \#GP if an attempt is made to access the upper half of a 64-bit mode system-segment descriptor as a legacy descriptor or as the lower half of a 64-bit mode system-segment descriptor.


It is not necessary to clear these same bits in *long-mode* interrupt gate / trap gate.

>[!warning]
> - In *long mode*, the interrupt-descriptor table(IDT) must contain 64-bit interrupt gate / trap gates.
> - The processor automatically indexes the IDT by scaling the interrupt vector by 16. <span style="color:#EDAFB8">This makes it impossible to access the upper half of a long-mode interrupt gate, or trap gate, as a legacy gate when the processor is running in long mode</span>.


- & **IST Field(Interrupt and Trap Gates)**.

bits\[2:0\] of byte + 4. *Long-mode* interrupt gate and trap gate descriptors contain a new, 3-bit *interrupt-stack-table(IST)* field not present in legacy gate descriptors. The *IST* field is used as an index into the *IST* portion of a *long-mode* <span style="color:#FB8500">TSS</span>.
- If the *IST* field is not 0, the index references an *IST* pointer in the <span style="color:#FB8500">TSS</span>, which the processor loads into the *RSP* register when an interrupt occurs.
- If the *IST* index is 0, the processor uses the legacy stack-switching mechanism(with some modifications) when the interrupt occurs.

- & **Count Field(Call Gates)**. 
-
The count field found in legacy call-gate descriptors is not supported in *long-mode* call gates. In *long mode*, the field is reserved and should be cleared to zero.


### Long Mode Descriptor Summary

>[!summary]
> System descriptors and gate-descriptors expanded by 64-bits to handle 64-bit base address in *long mode* or *64-bit* mode. The mode in which expansion occurs depends on the purpose served by the descriptor, as follows:
> - **Expansion Only In 64-Bit Mode**: The system descriptors and pseudo-descriptors that are loaded into the *GDTR*, *IDTR*, and *TR* registers are expanded only in 64-bit mode. *They are not expanded in compatibility mode*.
> - **Expansion In Long Mode**: Gate descriptors (call gates, interrupt gates, and trap gates) are expanded in *long mode*(both *64-bit* mode and *compatibility* mode). Task gates and 16-bit gate descriptors are illegal in *long mode*.

The AMD64 arch redefines several of the descriptor-entry fields in support of *long mode*. The specific change depends on whether the processor in *64-bit* mode / *compatibility* mode. [[chap-04-Segmented Virtual Memory#^28df5f|Table 4-7]] summarized the changes in the descriptor entry field when the descriptor entry is loaded into a segment register(as opposed to when the segment register is subsequently used to access memory).

![[descriptor-entry-field-changes-in-long-mode.png]]![[descriptor-entry-field-changes-in-long-mode.continue.png]] ^28df5f



## Segment-Protection Overview

>[!summary]
> The AMD64 arch is designed to fully support the legacy segment-protection mechanism. The segment-protection mechanism provides system software with the ability to restrict program access into other software routines and data.

Segment-level protection remains *enabled* in compatibility mode. *64-bit* mode eliminates most type checking, and limit checking is not performed, except on accesses to <span style="color:#FFD60A">system-descriptor tables</span>.

>[!tip]
> - The preferred method of implementing memory protection in a *long-mode* operating system is to rely on the *page-protection mechanism* as described in "Page-Protection Checks".
> - System software still needs to create basic segment-protection structures for *64-bit* mode. These structures are simplified, however, <span style="color:#FB8500">by the use of *flat-memory* model in *64-bit* mode, and the limited segmentation checks performed when executing in *64-bit* mode</span>.

### Privilege-Level Concept

<span style="color:#FFD60A">Segment protection is used to isolate and protect programs and data from each other</span>. The segment-protection mechanism supports *4* privilege levels in protected mode. The privilege levels are designated with a numerical value from *0* to *3*, with *0* being the most privileged and *3* being the least privileged.

System software typically assigns the privilege levels in the following manner:
- **Privilege-level 0(most privilege)**: This level is used by critical system-software components that require direct access to, and control over, all processor and system resources. This can include *BIOS*, *memory management function* and *interrupt handlers*.
- **Privilege-level 1 and 2(moderate privilege)**: These levels are used by less-critical system-software services that can access and control a limited scope of processor and system resources. Software running at these privilege levels might include some *device drivers* and *library routines*. These software routines can call more-privileged system software services to perform functions such as memory garbage-collection and file allocation.
- **Privilege-level 3(least privilege)**: This level is used by application software. Software running at privilege-level 3 is normally prevented from directly accessing most processor and system resources. Instead, applications request access to the protected processor and system resources by calling more-privileged service routines to perform the accesses.

[[chap-04-Segmented Virtual Memory#^e97da0|Figure 4-25]] shows the relationship of the four privilege levels to each other.
![[privilege-level-relationships.png]]

### Privilege-Level Types

These are the three types of privilege levels the processor users to control access to segments. These are *CPL*, *DPL*, and *RPL*.

- **Current Privileged-Level**. The *current privilege-level(CPL)* is the privilege level at which processor is currently executing. <span style="color:#FFD60A">The CPL is stored in an internal processor register that is invisible to software. Software changes the CPL by performing a control transfer to a different code segment with a new privilege level</span>.

- **Descriptor Privilege-Level**. The *descriptor privilege-level(DPL)* is the privilege level that system software assigns to individual segments. <span style="color:#FFD60A">The DPL is used in privileged checks to determine whether software can access the segment referenced by the descriptor</span>. In the case of *gate descriptors*, the *DPL* determines whether software can access the descriptor reference by the gate. The *DPL* is stored in the *segment(or gate) descriptor*. 

- **Requestor Privilege-Level**. The *requestor privilege-level(RPL)* reflects the privilege level of the program that created the selector. The *RPL* can be used to let a called program know the privilege level of the program that initiated the call.

>[!exception]
> Failure to pass a protection check generally causes an exception to occur.

## Data-Access Privilege Checks

### Accessing Data Segments

<span style="color:#FFD60A">Before loading  a data-segment register(DS, ES, FS, GS) with a segment selector, the processor checks the privilege levels as follows to see if access is allowed</span>:
1. The processor compares the *CPL* with the *RPL* in *data-segment selector* and determines the *effective privilege level* for the data access. The processor sets the *effective privilege level* to <span style="color:#FFD60A">the lowest privilege(numerically-higher value)</span> indicated by the comparison.
2. The processor compares the *effective privilege level* with the *DPL* in the descriptor-table entry referenced by the *segment selector*.
	- If the *effective privilege level* is **greater than or equal to (numerically lower-than / equal-to)** the *DPL*, then the processor loads the *segment register* with the *data-segment selector*. <span style="color:#FFD60A">The processor automatically loads the corresponding descriptor-table entry into the hidden portion of the segment register</span>.
	
>[!exception]
> - If the *effective privilege level* is lower than (numerically greater-than) the *DPL*, a *general-protection exception(\#GP)* occurs and the segment register is not loaded.

[[chap-04-Segmented Virtual Memory#^b73d85|Figure 4-26]] shows 2 examples of data-access privilege checks.
![[privilege-check-examples.png]]

Example 1 in [[chap-04-Segmented Virtual Memory#^b73d85|Figure 4-26]] shows a failing data-access privilege check. The *effective privilege level* is 3 because *CPL = 3*. This value is greater than the *descriptor DPL*, so access to the data segment is denied.

Example 2 in [[chap-04-Segmented Virtual Memory#^b73d85|Figure 4-26]] shows a passing data-access privilege check. Here, the *effective privilege level* is 0 because both *CPL* and *RPL* have values of 0. This value is less than the descriptor *DPL*, so access to the data segment is allowed, and the data-segment register is successfully loaded.

### Accessing Stack Segments

<span style="color:#FFD60A">Before loading  a stack segment register(SS) with a segment selector, the processor checks the privilege levels as follows to see if access is allowed</span>:
1. The processor checks that the *CPL* and the *stack-selector RPL* are *equal*.

>[!exception]
> If they are. not equal, a *general-protection exception(\#GP)* occurs and the SS register is not loaded.


2. The processor compares the *CPL* with the *DPL* in the descriptor-table entry referenced by the segment selector. The two values must be *equal*.

>[!exception]
> If they are. not equal, a *general-protection exception(\#GP)* occurs and the SS register is not loaded.

[[chap-04-Segmented Virtual Memory#^4c7608|Figure 4-27]] shows 2 examples of stack-access privilege checks.
- In Example 1, the *CPL*, *stack selector RPL*, and *segment-descriptor DPL* are all equal, so access to the stack segment using the *SS* register is allowed.
- In Example 2, the *stack-selector RPL* and *stack segment-descriptor DPL* are both equal. However, the *CPL* is not equal to the *stack segment-descriptor DPL*, and access to the stack segment through the *SS* register is denied.
![[stack-access-privilege-check-examples.png]]
^4c7608


## Control-Transfer Privilege Checks

Control transfer between *code segments*(also called *far control transfers*) causes the processor to perform privilege checks to determine whether the source program is allowed to transfer control to the target program.
- If the privilege checks pass, access to the target *code-segment* is granted. When access is granted, 
	- <span style="color:#FFD60A">The target code-segment selector is loaded into the CS register</span>.
	- <span style="color:#FFD60A">The RIP register is updated with the target CS offset taken from either the far-pointer operand or the gate descriptor</span>.
	
>[!note]
> Privilege checks are not performed during *near control transfers* because such transfer do not change segments.

The following mechanisms can be used by software to perform *far control transfer*:
- System-software control   transfers using *system-call* and *system-return* instructions. *SYSENTER* and *SYSEXIT* are not supported in long mode.
- Direct control            transfers using *CALL* and *JMP* instructions.
- Call-gate control         transfers using *CALL* and *JMP* instructions.
- Return control            transfer using the *RET* instruction.
- Interrupts and exceptions, including the *INTn* and *IRET* instructions.
- Task switches initiated by *CALL* and *JMP* instructions.

### Direct Control Transfers

>[!definition]
> A *direct control transfer* occurs when software executes a *far-CALL* / *far-JMP* instruction without using a call gate. 

The privilege checks and type of access allowed as a result of a direct control transfer depends on whether the target code segment is *conforming* / *nonconforming*.

>[!note]
> The code-segment-descriptor *conforming(C)* bit indicates whether or not the target code-segment is conforming.

<span style="color:#FFD60A">Privilege levels are not changed as a result of direct control transfer. Program stacks are not automatically  switched by the processor as they are with privilege-changing control through call gates</span>.

- **Nonconforming Code Segments.** Software can perform a direct control transfer to a nonconforming code segment only if <span style="color:#FFD60A">the target  descriptor DPL and the CPL are equal and the RPL is less than or equal to the CPL</span>.

>[!warning]
> Software must be use a *call gate* to transfer control a more-privileged, nonconforming code segment.

In far calls and jumps, the far pointer(*CS:rIP*) references the *target code-segment descriptor*. Before loading the *CS* register with a nonconforming code-segment selector, the processor checks as follows to see if access is allowed:
1. *DPL* = *CPL* *Check* -- The processor compares the target code-segment descriptor *DPL* with the currently executing program *CPL*. If they are equal, the processor performs the next check.

>[!exception]
> If they are not equal, a *general-protection exception(\#GP)* occurs.

2. *RPL* <= *CPL* *Check* -- The processor compares the target code-segment selector *RPL* with the currently executing program *CPL*. If the *RPL* is less than or equal to the *CPL*, access is allowed.

>[!exception]
> If the *RPL* is greater than the *CPL*, a *\#GP exception* occurs.

If access is allowed, the processor loads the *CS* and *rIP* registers with their new values and begins executing from the target location.

>[!important]
> The *CPL* is not *changed* -- the target-CS selector *RPL* value is *diregarded* when the selector is loaded into the *CS* register.

[[chap-04-Segmented Virtual Memory#^b09e8b|Figure 4-28]] shows 3 examples of privilege checks performed as a result of a *far control transfer* to a nonconforming code-segment.
- In Example 1, access is allowed because *CPL* = *DPL* and *RPL* < *CPL*.
- In Example 2, access is denied because *CPL* :LiEqualNot: *DPL*.
- In Example 3, access is denied because *RPL* > *CPL*.

![[non-conforming-code-segment-access-privilege-check-examples.png]]


- **Conforming Code Segments**: On a *direct control transfer* to a conforming code segment, <span style="color:#FFD60A">the target code-segment descriptor DPL can be lower than(at a greater privilege) the CPL</span>.
	- Before loading the *CS* register with a conforming code-segment selector, the processor compares the target code-segment descriptor *DPL* with the currently-executing program *CPL*. If the *DPL* is less than or equal to the *CPL* access is allowed. 

>[!exception]
> If the *DPL* is greater than the *CPL*, a *\#GP* exception occurs.

>[!tip]
> On an access to a conforming code segment, the *RPL* is ignored and not involved in the privilege check.

When access is allowed, the processor loads the *CS* and *rIP* register with their new values and begins executing from the target location.

>[!important]
> The *CPL* is not *changed* -- the target-CS descriptor *DPL* value is *diregarded* when the selector is loaded into the *CS* register. The target program runs at the same privilege as the program that called it.

[[chap-04-Segmented Virtual Memory#Control-Transfer Privilege Checks|Figure 4-29]] shows 2 examples of privilege checks performed as a result of a *direct control transfer* to a conforming code segment.
- In Example 1, access is allowed because the *CPL* of 3 is greater than the *DPL* of 0. <span style="color:#FFD60A">As the target code selector is loaded into the CS register, the old CPL value of 3 replaces the target-code selector RPL value, and the target program executes with CPL=3</span>.
- In Example 2, access is denied because *CPL* < *DPL*.

![[conforming-code-segment-access-privilege-check-examples.png]]

### Control Transfer Through Call Gates

Control transfers to more-privileged code segments are accomplished through the use of *call gates*.

>[!definition]
> Call gates are a type of *descriptor* that contain *pointers to code-segment descriptors* and *control access to these descriptors*. System software uses call gates to establish protected entry points into system-service routines.

- **Transfer Mechanism**. <span style="color:#FFD60A">The pointer operand of a far-CALL / far-JMP instruction consists of two pieces: a code-segment selector(CS) and a code-segment offset(rIP)</span>. *In a call-gate transfer, the CS selector points to a call-gate descriptor rather than a code-segment descriptor, and the rIP is ignored(but required by the instruction)*.

[[chap-04-Segmented Virtual Memory#^aacafb|Figure 4-30]] shows a call-gate control transfer in *legacy mode*. The call gate descriptor contains segment-selector and segment offset fields(see [[chap-04-Segmented Virtual Memory#^af2f7a|Gate Descriptor]] for detailed). <span style="color:#FFD60A">These two fields perform the same function as the pointer operand in a direct control-transfer instruction. The segment-selector field points to the target code-segment descriptor, and the segment-offset field is the instruction-pointer offset into the target code-segment. The code-segment base taken from the  code-segment descriptor is added to the offset field in the call-gate descriptor to create the target virtual address(linear address)</span>.

![[call-gate-transfer-mechanism.png]] ^aacafb

[[chap-04-Segmented Virtual Memory#^a6abe5|Figure 4-31]] shows a call-gate control transfer in *long mode*.The *long-mode* *call-gate* descriptor format is expanded by 64-bits to hold a full 64-bit offset into the virtual-address space. <span style="color:#FFD60A">Only long-mode call gates can be referenced in long mode(64-bit mode and compatibility mode)</span>. *The legacy-mode 32-bit call-gate types are redefined in long mode as 64-bit types, and 16-bit call-gate types are illegal*.
![[call-gate-transfer-mechanism.long.png]]

>[!warning]
> A *long-mode* call gate must reference a 64-bit code-segment descriptor. In *64-bit* mode, the code-segment descriptor base-address and limit fields are ignored. The target virtual-address is the 64-bit offset field in the expanded call-gate descriptor.

- **Privilege Checks**. Before loading the *CS* register with the code-segment selector located in the call gate, the processor performs three privilege checks. The following checks are performed when either conforming / nonconforming code segments are referenced:
	1. The processor compares the *CPL* with the call-gate *DPL* from the call-gate descriptor(DPL<sub>G</sub>). The *CPL* must be numerically *less than or equal to* DPL<sub>G</sub> for this check to pass(*CPL* <= DPL<sub>G</sub>).
	2. The processor compares the *RPL* in the *call-gate selector* with DPL<sub>G</sub> The *RPL* must be numerically *less than or equal to* DPL<sub>G</sub> for this check to pass(*RPL* <= DPL<sub>G</sub>).
	3. The processor compares the *CPL* with the target code-segment *DPL* from the code-segment descriptor(DPL<sub>S</sub>). The type of comparison varies depending on the type of control transfer.
		- When a call -- or a jump to *conforming code segment* -- is used to transfer control through a call gate, the *CPL* must be numerically *greater than or equal to* DPL<sub>S</sub> for this check to pass(*CPL* >= DPL<sub>S</sub>).
		- When a *JMP* instruction is used to transfer control through a call gate to a *nonconforming code segment*, the *CPL* must be numerically *equal to* DPL<sub>S</sub> for this check to pass(*CPL* = DPL<sub>S</sub>).
		
>[!important]
> *JMP* instructions cannot change *CPL*.

[[chap-04-Segmented Virtual Memory#^935492|Figure 4-32]] shows 2 examples of call-gate privilege checks.
- In Example 1, all privilege checks pass as follows:
	1. The *call-gate DPL*(DPL<sub>G</sub>) is at the *lowest* privilege(3), specifying that software running at any privilege level(*CPL*) can access the gate.
	2. The selector referencing the call gate passes its privilege check because *RPL* is numerically less than or equal to DPL<sub>G</sub>.
	3. The target code segment is at the highest privilege level(DPL<sub>S</sub> = 0). <span style="color:#FFD60A">This means software running at any privilege level can access the target code segment through the call gate</span>.

- In Example 2, all privilege checks fail as follows:
	1. The *call-gate DPL*(DPL<sub>G</sub>) specifies that only software privilege-level 0 can access the gate. The current program does not have enough privilege to access the call gate because is *CPL* is 2.
	2. The selector referencing the *call-gate descriptor* does not have enough privilege to complete the reference. Its *RPL* is numerically greater than DPL<sub>G</sub>.
	3. The target code segment is at a lower privilege(DPL<sub>S</sub> = 3) than the currently running software(*CPL* = 2). Transition from more-privileged software to less-privileged software are not allowed, so this privilege check fails as well.

>[!note]
> Although all three privilege checks failed in Example 2, failing only one check is sufficient to deny access into the target code segment.

![[call-gate-transfer-privilege-checks.png]]
^935492

- **Stack Switching**. The processor performs an automatic stack switch when a control transfer causes a change in privilege levels to occur. <span style="color:#FFD60A">Switching stacks isolates more-privileged software stacks from less-privileged software stacks and provides a mechanism for saving the return pointer back to the program that initiated the call</span>.

	- When switching to more-privileged software, as is done when transferring control using a *call gate*, the processor uses the corresponding stack pointer(privilege-level 0, 1 or 2) stored in the <span style="color:#FB8500">task-state segment(TSS)</span>. The format of the stack pointer stored in the <span style="color:#FB8500">TSS</span> depends on the system-software operating mode:
		- *Legacy-mode* system software stores a 32-bit *ESP* value(stack offset) and *16-bit* *SS* selector register value <span style="color:#FB8500">TSS</span> for each of three privilege levels 0, 1, and 2.
		- *Long-mode* system software stores a 64-bit *RSP* value in the <span style="color:#FB8500">TSS</span> for privilege levels 0, 1, and 2. <span style="color:#FFD60A">No SS register value is stored in the TSS because in long mode a call gate must reference a 64-bit code-segment descriptor. 64-bit mode does not use segmentation, and the stack pointer consists solely of the 64-bit RSP. Any value loaded in the SS register is ignored</span>.

[[chap-04-Segmented Virtual Memory#^5ca1e5|Figure 4-33]] shows a 32-bit stack in legacy mode before and after the automatic stack switch. This particular example assumes that parameter are passed from the current program to the target program.


>[!procedure]
> The process followed by legacy mode in switching stacks and copying parameters is:
> 1. The target *code-segment DPL* is read by the processor and used as an index into the <span style="color:#FB8500">TSS</span> for selecting the new stack pointer(*SS*:*ESP*). For example, if *DPL* = 1 the processor selects the *SS*:*ESP* for privileged-level 1 from the <span style="color:#FB8500">TSS</span>.
> 2. The *SS* and *ESP* registers are loaded with the new *SS*:*ESP* values read from the <span style="color:#FB8500">TSS</span>.
> 3. <span style="color:#FFD60A">The old values of the SS and ESP registers are pushed onto the stack pointed to by the new SS:ESP</span>.
> 4. The 5-bit *count* field is read from the [[chap-04-Segmented Virtual Memory#Gate Descriptors|call-gate descriptor]].
> 5. The number of parameters specified in the *count* field(up to 31) are copied from the old stack to the new stack. The size of the parameters copied by the processor depends on the call-gate size: *32-bit call gates copy 4-byte parameters and 16-bit gates copy 2-byte parameters*.
> 6. The return pointer is pushed onto the stack. The return pointer consists of the <span style="color:#FFD60A">current CS-register value and the EIP of the instruction following the calling instruction</span>.
> 7. The *CS* register is loaded from the segment-selector field in the call-gate descriptor, and the *EIP* is loaded from the offset field in the *call-gate descriptor*.
> 8. The target program begins executing with the instruction referenced by new *CS*:*EIP*.


![[stack-switch-with-parameters.32-bit.legacy.png]] ^5ca1e5

[[chap-04-Segmented Virtual Memory#^49c966|Figure 4-34]] shows a 32-bit stack in *legacy mode* before and after the automatic switch when no parameters are passed(*count* = 0). *Most software does not use the call-gate descriptor count-field to pass parameters*. <span style="color:#FFD60A">System software typically defines linkage mechanisms that do not rely on automatic parameter copying</span>. 
![[stack-switch-no-parameters.32-bit.legacy.png]]
^49c966

[[chap-04-Segmented Virtual Memory#^cb46d8|Figure 4-35]] shows a *long-mode* stack switch. 

>[!warning]
> In long mode, all call gates *must* reference *64-bit* code-segment descriptors, so a *long-mode* stack switch uses a 64-bit stack.

>[!procedure]
> The process of switching stacks in long mode is similar to switching in *legacy mode* when no parameters are passed. The process is as follows:
> 1. The target code-segment *DPL* is read by the processor and used as index into the 64-bit <span style="color:#FB8500">TSS</span> for selecting the new stack pointer(*RSP*).
> 2. The *RSP* register is loaded with the new *RSP* value read from the <span style="color:#FB8500">TSS</span>. The *SS* register is loaded with a *null selector*(*SS* = 0). <span style="color:#FFD60A">Setting the new SS selector to null allows proper handling of nested control transfers in 64-bit mode</span>.
> 3. The old values of the *SS* and *RSP* registers are pushed onto the stack pointed by the new *RSP*. The old *SS* value is popped on a subsequent far return. This allows system software to set up the *SS* selector for a compatibility-mode process by executing a *RET*(or *IRET*) that changes the privilege level.
> 4. The return pointer is pushed on the stack. The return pointer consists of the current *CS*-register value and *RIP* of the instruction following the calling instruction.
> 5. The *CS* register is loaded from the segment-selector field in the *long-mode* *call-gate* descriptor, and the *RIP* is loaded from the offset field in the *long-mode* *call-gate* descriptor.

The target program begins execution with the instruction referenced by the new *RIP*.
![[stack-switch.long.png]] ^cb46d8
>[!important]
> - All *long-mode* stack pushes resulting from a privilege-level-changing far call are *8-bytes* wide and increment the *RSP* by 8.
> - *Long mode* ignores the call-gate count field and does not support the automatic parameter-copy feature in *legacy mode*.
> - Software can access parameters on the old stack, if necessary, by referencing the old stack *segment selector* and *stack pointer* saved on the new process stack.


### Returning Control Transfer

Returns to calling programs can be performed by using the *RET* instruction. The following types of returns are possible:
- **Near Return**: Near returns perform control transfers within the same code segment, so the *CS* register is unchanged.  <span style="color:#FFD60A">The new offset is popped off the stack and into the rIP register</span>. No privilege checks are performed.

- **Far Return, Same Privilege**: A far transfers control from one code segment to another.
	- When the original code segment is at the same privilege as the target code segment, a far pointer(*CS:rIP*) is popped off the stack and the *RPL* of the new code segment(*CS*) is checked.  <span style="color:#FFD60A">If the requested privileged level(RPL) matches the current privilege level(CPL), then a return is made to the same privilege level</span>. This prevent software from changing the *CS* value on the stack in an attempt to return to high-privilege software.

- **Far Return, Less Privilege**: 

>[!attention]
> Far returns can change privilege levels, but only to *lower*-privilege. In this case a stack switch is performed between the current, higher-privilege program and the lower-privilege return program.

   <span style="color:#FFD60A">The CS register and rIP register values are popped off the stack. The lower-privilege stack pointer is also popped off the stack and into the SS register and rSP register</span>. The processor checks both the *CS* and *SS* privilege levels to ensure they are equal and at a lesser privilege than the current *CS*.
>[!tip]
> In the case of nested returns to 64-bit mode, a null selector can be popped into the SS register. See "Nested Returns to 64-Bit Mode Procedures".
> 

   Far returns also check the privilege levels of *DS*, *ES*, *FS* and *GS* selector registers. If any of these segment registers have a selector with a higher privilege than the return program, the segment register is loaded with *null selector*.

#### Stack Switching

The stack switch performed by a far return to a lower-privilege level reverses the stack switch of a call gate to higher-privilege level, <span style="color:#FFD60A">except that parameters are never automatically copied as part of a return</span>.

The process followed by a far-return stack switch in *long mode* and *legacy mode* is:
1. The return-program instruction *RPL* is read by the processor from the *CS* value stored on the stack to determine that a lower-privilege transfer is occurring.
2. The return-program instruction pointer is popped off the current-program(higher privilege) stack and loaded into the *CS* and *rIP* registers.
3. <span style="color:#FFD60A">The return instruction can include an immediate operand that specifies the number of additional bytes to be popped off of the stack</span>. These bytes may corresponding to the parameters pushed onto the stack previously by a call through a call gate containing a non-zero parameter-count field.

>[!tip]
> If the return includes the immediate operand, then the stack pointer is adjusted *upward* by adding the specified number of bytes to the *rSP*.

4. The return-program stack pointer is popped off the current-program(higher privilege) stack and loaded into the *SS* and *rSP* registers. 
>[!tip]
> In the case of nested returns to 64-bit mode, a null selector can be popped into the *SS* register.

>[!warning]
> The operand size of a far return determines the size of stack pops when switching stacks. If a far return is used in *64-bit* mode to return from a prior call through a long-mode call gate, the far return must use a *64-bit* operand size. *The 64-bit operand size allows the far return to properly read the stack established previously by the far call*.

#### Nested Returns to 64-Bit Mode Procedures

In long mode, a far call that changes privilege levels causes the *SS* register to be loaded with a *null selector*(this is the same action taken by an interrupt in long mode).

>[!note]
> If the called procedure performs another far call to a higher-privileged procedure, or is interrupted, the *null SS selector* is pushed onto the stack frame, and another *null selector* is loaded into the *SS* register. Using a *null selector* in this way allows the processor to properly handle returns nested within *64-bit-mode* procedures and interrupt handlers.

>[!exception]
> Normally, a *RET* that pops a *null selector* into the *SS* register causes a *general-protection exception(\#GP)* to occur.
> 
> However, in *long* mode, the *null selector* acts as a flag indicating the existence of nested interrupt handlers or other privileged software in *64-bit* mode. *Long* mode allows *RET* to pop a *null selector* into *SS* from the stack under the following conditions:
> - The target mode is *64-bit* mode.
> - The target *CPL* is less than 3.
> 
> In this case, the processor does not load an *SS* descriptor, and the null selector is loaded into *SS* without causing a *\#GP* exception.

## Limit Checks

>[!important]
> Except in *64-bit* mode, limit checks are performed by all instructions that reference memory.

Limit checks detect attempts to access memory outside the current segment boundary, attempts at executing instructions outside the current code segment, and indexing outside the current descriptor table.

>[!exception]
> If an instruction fails a limit check, either:
> 1. a *general-protection exception* occurs for all other segment-limit violations.
> 2. a *stack-fault exception* occurs for stack-segment limit violations.

In *64-bit* mode, segment limits are *not checked* during accesses to any segment referenced by the *CS*, *DS*, *ES*, *FS*, *GS*, and *SS* selector registers. Instead, the processor checks that virtual addresses used to reference memory are in <span style="color:#A9DEF9">canonical-address form</span>. <span style="color:#FFD60A">In 64-bit mode, as with legacy mode and compatibility mode, descriptor-table limits are checked</span>.

### Determining Limit Violations

To determine segment-limit violations, the processor checks a virtual(linear) address to see if it falls outside the valid range of segment offsets determined by the the *segment-limit* field in the descriptor.

>[!exception]
> If any part of an operand or instruction falls outside the segment-offset range, a limit violation occurs.

3 bits from the descriptor entry are used to control how the segment-limit field is interpreted: The granularity(*G*) bit, the default operand-size(*D*) bit, and for data segments, the expand-down(*E*) bit. See [[chap-04-Segmented Virtual Memory#Legacy Segment Descriptors|Legacy Segment Descriptors]] for a detailed description of each bit.  

For all segments other than *expand-down* segments, the minimum segment-offset is 0. The maximum segment-offset depends on the value of the *G* bit:
- If *G = 0*(byte granularity), the maximum allowable segment-offset is equal to the value of the segment-limit field.
- if *G = 1*(4096-byte granularity), the segment-limit field is first scaled by 4096(1000h). Then 4095(0FFFh) is added to the scaled value to arrive at the maximum allowable segment-offset, as shown in the following equation:
	- maximum segment-offset = (limit x 1000h) + 0FFFh
	
>[!example]
> For example, if the segment-limit field is 0100h, then the maximum allowable segment-offset is *(0100h x 1000h) + 0FFFh = 10_1FFFh*.

In both cases, the maximum segment-size is specified when the descriptor segment-limit field is *0F_FFFh*.

#### Expand-Down Segments

Expand-down data segments are supported in *legacy* mode and *compatibility mode* but not in *64-bit* mode. 

With *expand-down* data segments, the maximum segment offset depends on the value of the *D* bit in the data-segment descriptor:
- If *D = 0* the maximum segment-offset is *0_FFFFh*.
- If *D = 1* the maximum segment-offset is *0_FFFF_FFFFh*.

The minimum allowable segment offset in expand-down segments depends on the value of the *G* bit:
- If *G = 0*(byte granularity), the minimum allowable segment offset is the segment-limit value plus 1. 

>[!example]
> If the segment-limit field is *0100h*, then the minimum allowable segment-offset is *0101h*.

- If *G = 1*(4096-byte granularity), the segment-limit value in the descriptors is first scaled by 4096(1000h), and then 4095(0FFFh) is added to the value to arrive at a scaled segment-limit value. The minimum allowable segment-offset is scaled segment-limit value plus 1, as shown in the following equation:
	- minimum segment-offset = (limit x 1000) + 0FFFh + 1
	
>[!expample]
> For example, if the segment-limit field is *0100h*, then the minimum allowable segment-offset is *(0100h x 1000h) + 0FFFh + 1 = 10_1000h*

>[!attention]
> For expand-down segments, the maximum segment size is specified when the segment-limit value is 0.


### Data Limit Checks in 64-bit Mode

In *64-bit* mode, data reads and writes are normally checked for segment-limit violations. When *EFER.LMSLE = 1*, reads and writes in *64-bit* mode at *CPL > 0*, using the *DS*, *ES*, *FS*, or *SS* segments, have a segment-limit check applied.

The limit-check uses the *32-bit* segment-limit to find the maximum allowable address in the top *4GB* of the *64-bit* virtual(linear) address space.

![[segment_limit_checks.long.png]]

This segment-limit check does not apply to access through the *GS* segment, or to code reads. If the *DS*, *ES*, *FS* or *SS* segment is null / expand-down, the effect of the limit check is undefined.

## Type Checks

>[!exception]
> Type checks prevent software from using descriptors in invalid ways. Failing a type check results in an exception.

Type checks are performed using 5 bits from the descriptor entry: the *S* bit and the *4-bit* Type field. Together, these 5 bits from the descriptor type(code, data, segment, or gate) and its access characteristics. See [[chap-04-Segmented Virtual Memory#Legacy Segment Descriptors|Legacy Segment Descriptors]] for detailed description of the *S* bit and *Type field* encodings.

>[!note]
> Type checks are performed by the processor in *compatibility* mode as well as *legacy* mode. Limited type checks are performed in *64-bit* mode.
> 

### Type Checks in Legacy and Compatibility Modes

The type checks performed in *legacy* mode and *compatibility* mode are listed in the following sections.

- **Descriptor-Table Register Loads**: Loads into the *LDTR* and *TR* registers are checked for the appropriate system-segment type.

>[!warning]
> - The *LDTR* can only be loaded with an *LDT* descriptor.
> - The *TR* can only be loaded with a *<span style="color:#FB8500">TSS</span>* descriptor.
> 
> The checks are performed during any action that causes these registers to be loaded.*(This includes execution of the LLDT and LTR instructions and during task switches)*.


- **Segment Register Loads**: The following restrictions are placed on the segment-descriptor types that can be loaded into the 6 user segment registers:

>[!warning]
> - Only code segments can be loaded into the *CS* register.
> - Only writable data segments can be loaded into the *SS* register.
> - Only the following segment types can be loaded into the *DS*, *ES*, *FS*, or *GS* registers:
> 	- Read-only or read/write data segments.
> 	- Readable code segments.
> 
> These checks are performed during any action that causes the segment registers to be loaded. *This includes execution of the MOV segment-register instructions, control transfers, and task switches*.


- **Control Transfers**: Control transfer(branches and interrupts) place additional restrictions on the segment types that can be referenced during the transfer:

>[!warning]
> - The segment-descriptor type referenced by *far CALLs* and *far JMPs* must be one of the following:
> 	- A code segment
> 	- A call gate / a task gate
> 	- An available <span style="color:#FB8500">TSS</span> (only allowed in *legacy* mode)
> 	- A task gate (only allowed in *legacy* mode)
> - Only code-segment descriptors can be referenced by *call-gate*, *interrupt-gate*, and *trap-gate* descriptors.
> - Only <span style="color:#FB8500">TSS</span> descriptors can be referenced by task-gate descriptors.
> - The link field(selector) in the <span style="color:#FB8500">TSS</span> can only reference code-segment descriptors.
> - The *far RET* and *far IRET* instructions can only reference code-segment descriptors.
> - The *interrupt-descriptor table(IDT)*, which is referenced during interrupt control transfers, can only contain *interrupt gates*, *trap gates*, and *task gates*.


- **Segment Access**: After a segment descriptor is successfully loaded into one of the segment registers, read and writes into the segments are restricted in the following ways:

>[!exception]
> - Writes are not allowed into read-only data-segment types.
> - Writes are not allowed into code-segment types(executable segments).
> - Reads from code-segment types are not allowed if the readable(R) type bit is cleared to 0.
> 
> These checks are generally performed during execution of instructions that access memory.


### Long Mode Type Check Differences

#### Compatibility Mode and 64-Bit Mode
The following type checks differ in *long* mode (*64-bit* mode and *compatibility* mode) as compared to *legacy* mode:

- **System Segments**: System-segment types are checked, but the following types that valid in *legacy* mode are illegal in *long* mode:
	- 16-bit available <span style="color:#FB8500">TSS</span>.
	- 16-bit busy <span style="color:#FB8500">TSS</span>
	- Type-field encoding of 00h in the upper half of a system-segment descriptors to indicate an illegal type and prevent access as a legacy descriptor.

- **Gates**: Gate-descriptor types are checked, but the following types that are valid in *legacy* mode are illegal in *long* mode:
	- 16-bit call gate.
	- 16-bit interrupt gate.
	- 16-bit trap gate.
	- Task gate.

#### 64-Bit Mode

*64-bit* mode disables segmentation, and most of the segment-descriptor fields are ignored. The following list identifies where type checks in *64-bit* mode differ from those in *compatibility* mode and *legacy* mode.
- **Code Segments**: The readable(R) type bit is ignored in *64-bit* mode. None of the legacy type-checks that prevent reads from / writes into code segments are performed in 64-bit mode.
- **Data Segments**: Data-segment type attributes are ignored in *64-bit* mode. The writable(*W*) and expand-down(*E*) type bits are ignored. <span style="color:#FFD60A">All data segments are treated as writable</span>.




