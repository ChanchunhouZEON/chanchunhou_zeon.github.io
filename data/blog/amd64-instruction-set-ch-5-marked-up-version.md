---
title: AMD64 Instruction Set Ch-5 (marked-up version)
date: '2026-03-13'
excerpt: >-
  The x86 page-translation mechanism(or simply page mechanism) enables system
  software to create separate address spaces for each process / application.
  These spaces are known as virtual-address spaces. System software uses the
  paging mechanism to selectively map individual pages of physical memory into
  the virtual-address space using a set of hierarchical address-translation
  tables known collectively as page tables.
tags:
  - instruction set
  - system programming
category: system-programming
order: 3
---

>[!definition]
> The x86 page-translation mechanism(or simply *page mechanism*) enables system software to create separate address spaces for each process / application. These spaces are known as *virtual-address spaces*.

>[!note]
> System software uses the paging mechanism to selectively map individual pages of physical memory into the virtual-address space using a set of hierarchical address-translation tables known collectively as *page tables*.

The paging mechanism and the page tables are used to provide each process with its own private region of physical memory for storing its code and data. Processes can be protected from each other by isolating them within the virtual-address space.

>[!warning]
> A process cannot access physical memory that is not mapped into its virtual-address space by system software.

>[!tip]
> - System software can use the paging mechanism to selectively map physical-memory pages into multiple virtual-address spaces. <span style="color:#FB8500">Mapping physical pages in this manner allows them to be shared by multiple processes and applications</span>.
> - The physical pages can be configured by the page tables to allow *read-only* access. <span style="color:#FB8500">This prevent applications from altering the pages and ensures their integrity for use by all applications</span>.


*Shared mapping* is typically used to allow access of shared-library routines by multiple applications. <span style="color:#FFD60A">A read-only copy of the library routine is mapped to each application virtual address space, but only a single copy of the library routine is present in physical memory</span>. This capability also allows a copy of the operating-system kernel and various device drivers to *reside* within the application address space. Applications are provided with efficient access to system services without requiring costly address-space switches.


>[!warning]
> The system-software portion of the address space necessarily includes system-only data areas that must be protected from accesses by applications. <span style="color:#EDAFB8">System software uses the page tables to protect this memory by designating the pages as *supervisor* pages. Such pages are only accessible by system software</span>.

<span style="color:#FF85A1">When the supervisor mode execution prevention(SMEP) features is supported and enabled, attempted instruction fetches from user-mode accessible pages while in supervisor-mode triggers a page fault(#PF)</span>. This protects the integrity of system software by preventing the execution of instructions at a supervisor privilege level(*CPL* < 3) when these instructions could have been written / modified by user-mode code.

<span style="color:#FF85A1">When the supervisor mode access prevention(SMAP) feature is supported and enabled and RFLAGS.AC = 0, some attempted explicit data access from user-mode accessible pages while in supervisor-mode trigger a page fault(#PF)</span>. This protects the integrity of system software by preventing the use of data at supervisor privilege level(*CPL* < 3) that could have been modified by user-mode code. Supervisor software that requires access to data which is marked as user-mode accessible may temporarily suppress *SMAP* checks by modifying *RFALGS.AC*, such as with the *CLAC/STAC* instructions.


>[!tip]
> Finally, system software can use the paging mechanism to map multiple, large virtual-address spaces into much smaller amount of physical memory.
> - Each application can use the entire *32*-bit / *64*-bit virtual-address space.
> - System software actively maps the most-frequent-used virtual-memory pages into the *available pool* of *physical-memory pages*.
> - <span style="color:#FB8500">The least-frequent-used virtual-memory pages are swapped out to the hard drive. The process is known as *demand-paged virtual memory*</span>.


## Page Translation Overview

>[!summary]
> - The x86 arch provides support for translating 32-bit virtual addresses into 32-bit physical addresses(*larger physical addresses, such as 36-bit or 40-bit addresses, are supported as a special mode*).
> - The AMD64 arch enhances this support to allow translation of 64-bit virtual addresses into 52-bit physical addresses, although processor implementations can support smaller virtual-address and physical-address spaces.

Virtual addresses are translated to physical addresses through hierarchical translation tables created and managed by system software. <span style="color:#FFD60A">Each table contains a set of entries that point to the next-lower table in the translation hierarchy</span>. A single table at one level of the hierarchy can have hundreds of entries, each of which points to a unique table at the next-lower hierarchical level. Each lower-level table can in turn have hundreds of entries pointing to tables further down the hierarchy. <span style="color:#FFD60A">The lowest-level table in the hierarchy points to the translated physical page</span>.

[[chap-05-Page Translation and Protection#^becacf|Figure 5-1]] shows an overview of page-translation hierarchy used in *long* mode.

>[!note]
> - *Legacy* mode uses a subset of this translation hierarchy(the page-map level-4 table does not exist in *legacy* mode and the *PDP* table may or may not be used, depending on which paging mode is enabled).
> - The 5th level of translation, Page Map Level 5, only exist when 5-level paging is enabled.

As this figure shows, a virtual address is divided into fields, each of which is used as an offset into a translation table. The complete translation chain is made up of all table entries referenced by the virtual-address fields. The lowest-order virtual-address bits are used as the byte offset into the physical page.

![[image/amd64/vol2/chap-05/virtual-to-physical-address-translation.long.png]] ^becacf

The following physical-page sizes are supported: *4KB*, *2MB*, *4MB*, and *1GB*.
- In *long*   mode, *4KB*, *2MB*, *1GB* sizes are available.
- In *legacy* mode, *4KB*, *2MB*, *4MB* sizes are available.

>[!important]
> - Virtual addresses are *32-bit* long, and physical-address up to the supported physical-address size can be used.
> - The AMD64 arch enhances the *legacy* translation support by allowing virtual addresses of up to *64-bit* long to be translated into physical addresses of up to *52-bit* long.

Currently, the AMD64 architecture defines a mechanism for translating *48-bit* virtual addresses to *52-bit* physical addresses. The mechanism used to translate a full *64-bit* virtual address is reserved and will be described in a future AMD64 arch specification.

### Page-Translation Options

The form of page-translation support available to software depends on which paging features are enabled. Four controls are available for selecting the various paging alternatives:
- @ Page-Translation Enable(*CR0.PG*)
- @ Physical-Address Extensions(*CR4.PAE*)
- @ Page-Size Extensions(*CR4.PSE*)
- @ Long-Mode Active (*EFER.LMA*)

Not all paging alternatives are available in all modes. Table 5-1 summarizes the paging support available in each mode. 

![[image/amd64/vol2/chap-05/supported-page-translation.png]] ^3e7506

### Page-Translation Enable(PG) Bit

Page translation is controlled by the *PG* bit in *CR0(bit 31)*. Enable -> 1, Disable -> 0.

>[!note]
> The AMD64 arch uses *CR0.PG* to activate and deactivate *long* mode when *long* mode is enabled.

### Physical-Address Extensions(PAE) Bit

Physical-address extensions are controlled by the *PAE* bit in *CR4(bit 5)*. Enable -> 1, Disable -> 0.

<span style="color:#FFD60A">Setting CR4.PAE = 1 enables virtual addresses to translated into physical addresses up to 52-bit long. This is accomplished by doubling the size of paging data-structure entries from 32-bit to 64-bit to accommodate the larger physical base-address for physical-pages</span>.

>[!warning]
> *PAE* must be enabled before activating *long* mode.

### Page-Size Extensions(PSE) Bit

Page-size extensions are controlled by the *PSE* bit in *CR4(bit 4)*. Setting *CR4.PSE* to 1 allows operating system software to use *4MB* physical pages in the translation process. Enable -> 1, Disable -> 0.

>[!important]
> The 4-MB physical pages can be mixed with standard 4-KB physical pages or replace them entirely.

>[!important]
> The selection of physical-page size is made on a page-directory-entry basis.

The choice of 2MB / 4MB as the large physical-page size depends on the value of *CR4.PSE* and *CR4.PAE*, as follows:
- If physical-address extensions are enabled(*CR4.PAE = 1*), the large physical-page size is 2 MB, regardless of the value of *CR4.PSE*.
- If physical-address extensions are disabled(*CR4.PAE = 0*) and *CR4.PSE = 1*, the large physical-page size is 4MB.
- if both *CR4.PAE = 0* and *CR4.PSE = 0*, the only available page size is 4KB.

>[!note]
> <span style="color:#D0F4DE">The value of *CR4.PSE* is ignored when long mode is active</span>. This is because physical-address extensions must be enabled in *long* mode, and the only available page sizes are 4KB, and 2MB.
> 

In *legacy* mode, physical addresses up to *40-bit* long can be translated from *32-bit* virtual addresses using *32-bit* paging data-structure entries when 4MB physical page sizes are selected. <span style="color:#FFD60A">In this special case, CR4.PSE = 1 and CR4.PAE = 0</span>.

>[!tip]
> The 40-bit physical-address capability in an AMD64 arch enhancement over the similar capability available in the *legacy* x86 arch.

### Page-Directory Page Size(PS) Bit

The page directory offset entry(PDE) and page directory pointer offset entry(PDPE) are data structures used in page translation(see [[chap-05-Page Translation and Protection#^becacf|Figure 5-1]]). <span style="color:#FFD60A">The page-size(PS) bit in the PDE(bit 7, referred to as PDE.PS) selects between standard 4-KB physical-page sizes and larger(2MB / 4MB) physical-page sizes. The page-size(also PS) bit in PDPE(bit 7, referred to as PDE.PS) selects between 2MB and 1GB physical-page sizes in long mode</span>.

- When *PDE.PS = 1*, large physical page are used, and the *PDE* becomes the lowest level of the translation hierarchy. The size of the large page is determined by the values of *CR4.PAE* and *CR4.PSE*, as shown in [[chap-05-Page Translation and Protection#^becacf|Figure 5-1]].
- When *PDE.PS = 0*, standard 4KB physical pages are used, and the *PTE* is the lowest level of the translation hierarchy.

>[!important]
> When *PDPE.PS* is set to 1, 1GB physical pages are used, and the PDPE becomes the lowest level of translation hierarchy. Neither the *PDE* nor *PTE* are used for 1GB paging.


## Legacy-Mode Page Translation

>[!summary]
> *Legacy* mode supports 2 forms of translation:
> - **Normal(non-PAE) Paging**: This is used when physical-address extensions are disabled(*CR4.PAE = 0*). Entries in the page translation table are *32-bit* and are used to translate *32-bit* virtual addresses into physical addresses as large as *40-bit*.
> - **PAE Paging**: This is used when physical-address extensions are enabled(*CR4.PAE = 1*). Entries in the page translation table are *64-bit* and are used to translate *32-bit* virtual-address into physical addresses as large as *52-bit*.

*Legacy* paging uses up to three levels of page-translation tables, depending on the paging form used and the physical-page size. Entries within each table are selected using *virtual-address bit fields*. The legacy page-translation tables are:
>[!definition]
> - **Page Table**: Each *page-table entry(PTE)* points to a physical page. If 4B pages are used, the page table is the lowest level of the page-translation hierarchy. *PTEs* are not used when translating 2MB / 4 MB pages.

>[!definition]
> - **Page Directory**: If 4KB pages are used, each *page-directory entry(PDE)* points to a page table. If 2MB / 4MB pages are used, a *PDE* is the lowest level of the page-translation hierarchy and points to a physical page. In non-PAE paging , the page directory is the highest level of the translation hierarchy.

>[!definition]
> - **Page-Directory Pointer**: Each *page-directory pointer entry(PDPE)* points to a page directory. Page-directory pointers are only used in *PAE* paging(*CR4.PAE = 1*), and are the highest level in the legacy page-translation hierarchy.

### CR3 Register

The *CR3* register is used to point to the base address of the highest-level page-translation table. <span style="color:#FFD60A">The base address is either the page-directory pointer table / page directory table</span>.

The *CR3* register format depends on the form of paging being used.
- [[chap-05-Page Translation and Protection#^dff6da|Figure 5-2]] shows the *CR3* format when normal(non-PAE) paging is used(*CR4.PAE = 0*).
- [[chap-05-Page Translation and Protection#^dff6da|Figure 5-3]] shows the *CR3* format when *PAE* paging is used(*CR4.PAR = 1*).
![[image/amd64/vol2/chap-05/cr3.pae-or-non-pae-paging.legacy.png]]

The *CR3* register fields for *legacy* mode paging are:

- & **Table Base Address Field**: 

This field points to the starting physical address of the highest-level page-translation table. The size of this field depends on the form of paging used:
   - **Normal(Non-PAE) Paging(CR4.PAE = 0)**:  <span style="color:#FFD60A">This 20-bit field occupies bits 31:12, and points to the base address of the page-directory table</span>.
   
>[!note]
> The page-directory table is aligned on a 4KB boundary, with the low-order 12 address bits 11:0 assumed to be 0. This yields a total base-address size of *32-bit*.

   - **PAE Paging(CR4.PAE = 1)**: <span style="color:#FFD60A">This field is 27-bit and occupies bits 31:5. The CR3 register points to the base address of the page-directory-pointer table.</span>

>[!note]
> The page-directory-pointer table is aligned on a 32-byte boundary, with the low 5 address bits 4:0 assumed to be 0.


- & **Page-Level WriteThrough(PWT) Bit** *Bit 3*: 

Page-level write-through indicates whether the highest-level page-translation table has a write-back / write-through policy. 
- When *PWT = 0*, the table has a write-back caching policy.
- When *PWT = 1*, the table has a write-through caching policy.

- & **Page-Level Cache Disable(PCD) Bit** *Bit 4*: 

Page-level cache disable indicates whether the *highest-level page-translation table* is cacheable.
- When *PCD = 0*, the table is cacheable.
- When *PCD = 1*, the table is not cacheable.

- % **Reserved Bits**: Reserved fields should be cleared to 0 by software when writing *CR3*.

### Normal (Non-PAE) Paging

Non-PAE paging(*CR4.PAE = 0*) supports 4-KB and 4-MB physical pages, as described in the following sections.

#### 4-KB Page Translation.
4-KB physical-page translation is performed by dividing the *32-bit* virtual address into 3 fields. Each of the upper 2 fields is used as an index into 2-level page-translation hierarchy. The virtual-address fields are used as follows, and are shown in [[chap-05-Page Translation and Protection#^53be37|Figure 5-4]]:
- Bits 31:22 index into the 1024-entry page-directory table.
- Bits 21:12 index into the 1024-entry page table.
- Bits 11:0 provide the byte offset into the physical page.

![[image/amd64/vol2/chap-05/4kb.non-pae-page-translation.png]]
^53be37

[[chap-05-Page Translation and Protection#^885bba|Figure 5-5]] shows the format of the *PDE(page-directory entry)*, and [[chap-05-Page Translation and Protection#^885bba|Figure 5-6]] shows the format of *PTE(page-table entry)*. <span style="color:#FFD60A">Each table occupies 4KB and can hold 1024 of the 32-bit table entries</span>.

>[!attention]
> [[chap-05-Page Translation and Protection#^885bba|Figure 5-5]] shows bit 7 cleared to 0. This bit is the *page-size bit(PS)*, and specifies a 4-KB physical-page translation.

![[image/amd64/vol2/chap-05/4kb-pte-and-pde-format.non-pae-paging.legacy.png]] ^885bba

#### 4-MB Page Translation

4MB translation is only supported when page-size extensions are enabled(*CR4.PSE = 1*) and physical-address extensions are disabled(*CR4.PAE = 0*)

*PSE* defines a page-size bit in the 32-bit *PDE* format(*PDE.PS*). This bit is used by the processor during page translation to support both 4MB and 4KB pages.
- If *PDE.PS = 1*, 4MB pages are selected, and the *PDE* point to a 4MB physical page. <span style="color:#FFD60A">PTEs are not used in a 4MB page translation</span>.
- If *PDE.PS = 0*, or if 4MB page translation is disabled, the *PDE* points to a *PTE*.

4MB page translation is performed by dividing the 32-bit virtual address into 2 fields. Each field is used as an index into a single-level page-translation hierarchy. The virtual-address fields are used as follows, and are shown in [[chap-05-Page Translation and Protection#^77f271|Figure 5-7]]:
- Bits 31:22 index into the 1024-entry page-directory table.
- Bits 21:0 provide the byte offset into the physical page.
![[image/amd64/vol2/chap-05/4mb-page-translation.non-pae-paging.legacy.png]]
^77f271

The AMD64 arch modifies the legacy *32-bit* *PDE* format in *PSE* mode to increase physical-address size support to *40-bit*. <span style="color:#FFD60A">This increase in address size is accomplished by using bits 20:13 to hold eight additional high-order physical-address bits</span>. *Bit 21* is reserved and must be cleared to 0.

[[chap-05-Page Translation and Protection#^1fb2fd|Figure 5-8]] shows the format of the *PDE* when *PSE* mode is enabled. The physical-page base-address bits are contained in a split field. The high-order, physical-page base-address bits 39:32 are located in *PDE\[20:13\]*, and physical-page base-address bits 31:22 are located in *PDE\[31:22\]*.

![[image/amd64/vol2/chap-05/4mb-pde-format.non-pae-paging.legacy.png]] ^1fb2fd

### PAE Paging

*PAE* paging is used when physical-address extensions are enabled(*CR4.PAE = 1*). <span style="color:#FFD60A">PAE paging doubles the size of page-translation table entries to 64-bits so that the table entries can hold larger physical address(up to 52 bits)</span>.

>[!note]
> The size of each table remains 4KB, which means each table can hold 512 of 64-bit entries.

>[!tip]
> *PAE* paging also introduces a third-level page-translation table, known as the *page-directory-pointer table(PDP)*.

>[!note]
> - The size of large pages in *PAE-paging* mode is 2MB rather than 4MB.
> - *PAE* uses the page-directory page-size bit (*PDE.PS*) to allow selection between 4KB and 2MB page sizes.
> - <span style="color:#D0F4DE">*PAE* automatically uses the page-size bit, so the value of *CR4.PSE* is ignored by *PAE* paging</span>.


#### 4KB Page Translation

With *PAE* paging, 4KB physical-page translation is performed by dividing the 32-bit virtual address into 4 fields, each of the upper three fields is used as an index into at *3-level page-translation hierarchy*. The virtual-address fields are described as follows and are shown in [[chap-05-Page Translation and Protection#^c334a3|Figure 5-9]]:
- Bits 31:30 index into a 4-entry *page-directory-pointer table*.
- Bits 29:21 index into the 512-entry *page-directory table*.
- Bits 20:12 index into the 512-entry *page table*.
- Bits 11:0 provide the byte offset into the physical page.

![[image/amd64/vol2/chap-05/4kb-pae-page-translation.legacy.png]] ^c334a3

[[chap-05-Page Translation and Protection#^ceb9f6|Figure 5-10]] through [[chap-05-Page Translation and Protection#^ceb9f6|Figure 5-12]] show the *legacy-mode* 4KB translation-table formats:
- [[chap-05-Page Translation and Protection#^ceb9f6|Figure 5-10]] shows the *PDPE(page-directory-pointer entry)* format.
- [[chap-05-Page Translation and Protection#^ceb9f6|Figure 5-11]] shows the *PDE(page-directory entry)* format.
- [[chap-05-Page Translation and Protection#^ceb9f6|Figure 5-12]] shows the *PTE(page-table entry)* format.

The fields within these table entries are described in "Page-Translation Entry Fields".

[[chap-05-Page Translation and Protection#^ceb9f6|Figure 5-11]] shows the *PDE.PS = 0*(bit 7), specifying a 4KB physical-page translation.

![[image/amd64/vol2/chap-05/4kb-pdpe-pde-pte-format.pae-paging.legacy.png]] ^ceb9f6

#### 2-MB Page Translation

2MB page translation is performed by dividing the 32-bit virtual address into three fields. Each field is used as an index into a 2-level page-translation hierarchy. The virtual-address fields are described as follows and are shown in [[chap-05-Page Translation and Protection#^1bb515|Figure 5-13]]:
- Bits 31:30 index into the 4-entry *page-directory-pointer table*.
- Bits 29:21 index into the 512-entry *page-directory table*.
- Bits 20:0 provide the byte offset into the physical page.
![[image/amd64/vol2/chap-05/2mb-pae-page-translation.legacy.png]] ^1bb515

[[chap-05-Page Translation and Protection#^a1002d|Figure 5-14]] shows the format of the *PDPE(page-directory-pointer entry)* and [[chap-05-Page Translation and Protection#^a1002d|Figure 5-15]] shows the format of the *PDE(page-directory entry)*

>[!note]
> *PTEs* are not used in 2MB page translations.

[[chap-05-Page Translation and Protection#^a1002d|Figure 5-15]] shows the *PDE.PS* bit set to 1(bit 7), specifying a 2MB physical-page translation.

![[image/amd64/vol2/chap-05/2mb-pdpe-format.pae-paging.legacy.png]]![[image/amd64/vol2/chap-05/2mb-pte-format.pae-paging.legacy.png]] ^a1002d

## Long-Mode Page Translation

*Long-mode* page translation requires the use of *physical-address extensions (PAE)*. 

>[!exception]
> Before activating *long* mode, *PAE* must be enabled by setting *CR4.PAE* = 1. Activating *long* mode before enabling *PAE* causes a *general-protection exception(\#GP)* to occur.

>[!note]
> - The PAE-paging data structures support mapping *64-bit* address into *52-bit* physical addresses.
> - *PAE* expands the size of legacy *page-directory entries(PDEs)* and *page-table entries(PTEs)* from *32-bit* to *64-bit*, allowing physical-address sizes of greater than 32 bits.

>[!important]
> - The AMD64 arch enhances the *page-directory-pointer entry(PDPE)* by defining previously <span style="color:#FB8B24">reserved bits for access and protection control</span>.
> - A new translation table is added to *PAE* paging, called the *page-map level-4(PML4)*. The *PML4* table precedes the *PDP* table in the page-translation hierarchy.

Because *PAE* is always enabled in *long* mode, the *PS* bit in the page directory entry(*PDE.PS*) selects between 4KB and 2MB page sizes, and the *CR4.PSE* bit is ignored. When 1GB pages are supported, the *PDPE.PS* bit selects the 1GB page size.

Some processors, identified by *CPUID Fn0000_0007_ECX\[LA57\](bit 16)=1*, support an additional translation table called page-map level-5(*PML5*). The *PML5* table precedes the *PML4* table and allows translation of up to 57-bit of virtual address. 5-level paging is enabled by setting *CR4\[LA57\]=1* when *EFER\[LMA\]=1*. *CR4\[LA57\]=1* is ignored when *long* mode is not active(*EFER\[LMA\]=0*). 
### Canonical Address Form

The AMD64 arch requires implementations supporting fewer than the full 64-bit virtual address to ensure that those addresses are in canonical form. <span style="color:#FFD60A">An address is in canonical form if the address bits from the most-significant implemented up to bit 63 are all ones / all zeros</span>.

>[!exception]
> If the addresses of all bytes in a virtual-memory reference are not in canonical form, the processor generates a *general-protection exception(\#GP)* / *stack fault(\#SS)* as appropriate.


### CR3
In *long* mode, the *CR3* register is used to point to the *PML4* base address when 5-level paging is disabled(*CR4\[LA57\]=0*) or the *PML5* address when 5-level paging is enabled(*CR4\[LA57\]=1*). *CR3* is expanded to *64-bit* in *long* mode, allowing the *PML4/PML5* table to be located anywhere in the *52-bit* physical-address space.

[[chap-05-Page Translation and Protection#^a32563|Figure 5-16]] shows the *long* mode *CR3* format.
![[image/amd64/vol2/chap-05/cr3.long.png]] ^a32563

The *CR3* register fields for *long* mode are:

- & **Table Base Address Field** *Bits\[51:12\]*: 

This *40-bit* points to the *PML4* base address.
- The *PML4* table is aligned on a 4KB boundary with the low-order 12 address bits(11:0) assumed to be 0. This yields a total base-address size of 52 bits.
	
>[!warning]
> System software running on processor implementations supporting less than the full 52-bit physical-address space must clear the unimplemented upper base-address bits to 0.

- & **Page-Level Writingthrough(PWT) Bit** *Bit 3*: 

Page-level write-through indicates whether the highest-level page-translation table has a write-back / write-through caching policy.
- When *PWT = 0*, the table has a write-back caching policy.
- When *PWT = 1*, the table has a write-through caching policy.

- & **Page-Level Cache Disable(PCD) Bit** *Bit 4*: 

Page-level cache disable indicates whether the highest-level page translation table is cacheable.
- When *PCD = 0*, the table is cacheable.
- When *PCD = 1*, the table is not cacheable.

- & **Process Context Identifier** *Bits\[11:0\]*. 

This 12-bit field determines the current Processor Context Identifier(*PCID*) when *CR4.PCIDE=1*.

- % **Reserved Bits**: Reserved fields should be cleared to 0 by software when writing *CR3*.

### 4-KB Page Translation

In *long* mode, 4KB physical-page translation is performed by dividing the virtual address into 6 fields. 4 of field are used as indices into the level page-translation hierarchy. The virtual-address fields are described as follows, and are shown in [[chap-05-Page Translation and Protection#^42695c|Figure 5-17]]:
- Bits \[63:57\] are a sign extension of bit 47, as required for <span style="color:#A9DEF9">canonical-address forms</span>.
- Bits \[56:48\] index into the 512-entry page-map level-5 table(Only when 5-level paging is enabled).
- Bits \[47:39\] index into the 512-entry page-map level-4 table.
- Bits \[38:30\] index into the 512-entry page-directory pointer table.
- Bits \[29:21\] index into the 512-entry page-directory table.
- Bits \[20:12\] index into the 512-entry page table.
- Bits \[11:0\] provide the byte offset into the physical page.

>[!note]
> The sizes of the sign extension and the *PML5* and *PML4* fields depend on the number of virtual address bits supported by the implementation.

![[image/amd64/vol2/chap-05/4kb-page-translation.long.png]]
![[image/amd64/vol2/chap-05/4kb-page-translation.5-level.long.png]]
^42695c

[[chap-05-Page Translation and Protection#^a81ac1|Figure 5-19]] through [[chap-05-Page Translation and Protection#^172272|Figure 5-23]] show the *long-mode* 4KB translation-table formats:
- [[chap-05-Page Translation and Protection#^a81ac1|Figure 5-19]] shows the *PML5E(page-map level-5 entry)* format.
- [[chap-05-Page Translation and Protection#^a81ac1|Figure 5-20]] shows the *PML4E(page-map level-4 entry)* format.
- [[chap-05-Page Translation and Protection#^a81ac1|Figure 5-21]] shows the *PDPE(page-directory-pointer entry)* format.
- [[chap-05-Page Translation and Protection#^a81ac1|Figure 5-22]] shows the *PDE(page-directory entry)* format.
- [[chap-05-Page Translation and Protection#^172272|Figure 5-23]] shows the *PTE(page-table entry)* format.

>[!tip]
> This fields with these table entries are described in [[chap-05-Page Translation and Protection#Page-Translation-Table Entry Fields|Page-Translation-Table Entry Fields]].

>[!attention]
> [[chap-05-Page Translation and Protection#^172272|Figure 5-23]] shows the *PDE.PS* bit (bit 7) cleared to 0, indicating 4KB physical-page translation.

![[image/amd64/vol2/chap-05/4kb-5pml-4pml-pdpe-pde-format.long.png]] ^a81ac1

![[image/amd64/vol2/chap-05/4kb-pte-format.long.png]] ^172272

### 2MB Page Translation

In *long* mode, 2MB physical-page translation is performed by dividing the virtual address into 5 fields. 3 of the fields are used as indices into the level page-translation hierarchy. The virtual-address fields are described as follows, and are shown in [[chap-05-Page Translation and Protection#^8eb35a|Figure 5-24]] and [[chap-05-Page Translation and Protection#^f144b5|Figure 5-25]]:
- Bits \[63:57\] are a sign extension of bit 47, as required for <span style="color:#A9DEF9">canonical-address forms</span>.
- Bits \[56:48\] index into the 512-entry page-map level-5 table(Only when 5-level paging is enabled).
- Bits \[47:39\] index into the 512-entry page-map level-4 table.
- Bits \[38:30\] index into the 512-entry page-directory pointer table.
- Bits \[29:21\] index into the 512-entry page-directory table.
- Bits \[20:0\] provide the byte offset into the physical page.

![[image/amd64/vol2/chap-05/2mb-page-translation.long.png]] ^8eb35a
![[image/amd64/vol2/chap-05/2mb-page-translation.5-level.long.png]] ^f144b5

[[chap-05-Page Translation and Protection#^db4c96|Figure 5-26]] through [[chap-05-Page Translation and Protection#^13f3a0|Figure 5-29]] show the *long-mode* 2MB translation-table formats(the *PML4* and *PDPT* formats are identical to those used for 4KB page translations and are repeated here for clarity):
- [[chap-05-Page Translation and Protection#^db4c96|Figure 5-26]] shows the *PML5E(page-map level-5 entry)* format.
- [[chap-05-Page Translation and Protection#^db4c96|Figure 5-27]] shows the *PML4E(page-map level-4 entry)* format.
- [[chap-05-Page Translation and Protection#^db4c96|Figure 5-28]] shows the *PDPE(page-directory-pointer entry)* format.
- [[chap-05-Page Translation and Protection#^13f3a0|Figure 5-29]] shows the *PDE(page-directory entry)* format.

>[!tip]
> This fields with these table entries are described in [[chap-05-Page Translation and Protection#Page-Translation-Table Entry Fields|Page-Translation-Table Entry Fields]]. *PTEs* is not used in 2MB page translation.

>[!attention]
> [[chap-05-Page Translation and Protection#^13f3a0|Figure 5-29]] shows the *PDE.PS* bit (bit 7) cleared to 1, indicating 2MB physical-page translation.

![[image/amd64/vol2/chap-05/2mb-pml-pdpe-format.long.png]] ^db4c96
![[image/amd64/vol2/chap-05/2mb-pde-format.long.png]] ^13f3a0


### 1GB Page Translation

In *long* mode, 1GB physical-page translation is performed by dividing the virtual address into 4 fields. 2 of the fields are used as indices into the level page-translation hierarchy. The virtual-address fields are described as follows, and are shown in [[chap-05-Page Translation and Protection#^60c4e0|Figure 5-30]] and [[chap-05-Page Translation and Protection#^3a7604|Figure 5-31]]:
- Bits \[63:57\] are a sign extension of bit 47, as required for <span style="color:#A9DEF9">canonical-address forms</span>.
- Bits \[56:48\] index into the 512-entry page-map level-5 table(Only when 5-level paging is enabled).
- Bits \[47:39\] index into the 512-entry page-map level-4 table.
- Bits \[38:30\] index into the 512-entry page-directory pointer table.
- Bits \[29:0\] provide the byte offset into the physical page.

![[image/amd64/vol2/chap-05/1gb-page-translation.long.png]] ^60c4e0
![[image/amd64/vol2/chap-05/1gb-page-translation.5-level.long.png]] ^3a7604

[[chap-05-Page Translation and Protection#^db1fdb|Figure 5-32]] through [[chap-05-Page Translation and Protection#^d33575|Figure 5-34]] show the *long-mode* 1GB translation-table formats(the *PML4* and *PDPT* formats are identical to those used for 4KB page translations and are repeated here for clarity)
- [[chap-05-Page Translation and Protection#^db1fdb|Figure 5-32]] shows the *PML5E(page-map level-5 entry)* format.
- [[chap-05-Page Translation and Protection#^db1fdb|Figure 5-33]] shows the *PML4E(page-map level-4 entry)* format.
- [[chap-05-Page Translation and Protection#^d33575|Figure 5-34]] shows the *PDPE(page-directory-pointer entry)* format.

>[!attention]
> [[chap-05-Page Translation and Protection#^d33575|Figure 5-34]] shows the *PDPE.PS* bit (bit 7) set to 1, indicating a 1GB physical-page translation.
> 

![[image/amd64/vol2/chap-05/1gb-pml.long.png]] ^db1fdb
![[image/amd64/vol2/chap-05/1gb-pdpe.long.png]] ^d33575

>[!note]
> *1GB Page Feature Identification*:
> - *EDX* bit 26 as returned by *CPUID* function *8000_0001h* indicates 1GB page support.
> - *EAX* register as returned by *CPUID* function *8000_0019h* reports the number of *1GB L1 TLB* entries supported and *EBX* reports the number of *1GB L2 TLB* entries.


## Page-Translation-Table Entry Fields

The page-translation-table entries contain control and informational fields used in the management of the virtual-memory environment. Most fields are common across all translation table entries and modes and occupy the same bit locations. However, some fields are located in different bit positions depending on the page translation hierarchical level, and other fields have different sizes depending on which physical-page size, physical-address size, and operating mode are selected. Although these fields can differ in bit position / size, their meaning is consistent across all levels of the page translation hierarchy and in all operating mode.


### Field Definitions

The following sections describe each field within the page-translation table entries.

#### Translation-Table Base Address Field
The translation-table base-address field points to the physical base address of the next-lower-level table in the page-translation hierarchy.

>[!note]
> Page data-structure tables are always aligned on 4KB boundaries, so only the address bits above bit 11 are stored in the translation-table base-address field. *Bits 11:0 are assumed to be 0*. The size of the field depends on the mode:
> - In *normal(non-PAE)* paging(*CR4.PAE = 0*), this field specifies a *32-bit* physical address.
> - In *PAE* paging(*CR4.PAE = 1*), this field specifies a *52-bit* physical address.

52 bits corresponding to the maximum physical-address allowed by the AMD64 arch.

>[!warning]
> If a processor implementation supports fewer than the full 52-bit physical address, software must clear the unimplemented high-order translation-table base-address bits to 0. *e.g.*, if a processor implementation supports a *40-bit* physical-address size, software must clear *bits \[51:40\]* when writing a translation-table base-address field in a page data-structure entry.


#### Physical-Page Base Address Field
The physical-page base-address field points to the base address of the translated physical page. 

>[!tip]
> This field is found only in the lowest level of the page-translation hierarchy. The size of the field depends on the mode:
> - In normal(*non PAE*) paging(*CR4.PAE = 0*) field specifies a 32-bit address for a physical page.
> - In *PAE* paging(*CR4.PAE = 1*), this field specifies a *52-bit* base address for a physical page.

Physical pages can be 4KB, 2MB, 4MB, or 1GB and they are always aligned on address boundary corresponding to the physical-page length. *e.g.*, a 2MB physical page is always aligned on a 2MB address boundary. Because of the alignment, the low-order address bits are assumed to be 0, as follows:
- 4KB pages, bits 11:0 are assumed 0.
- 2MB pages, bits 20:0 are assumed 0.
- 4MB pages, bits 21:0 are assumed 0.
- 1GB pages, bits 29:0 are assumed 0.

#### Present(P) Bit
*Bit 0*. This bit indicates whether the *page-translation table* / *physical page* is loaded in physical memory. P = 1 => loaded, P = 0 => not loaded.

>[!exception]
> Software clears this bit to 0 to indicate a page table / physical page is not loaded in physical memory. A *page-fault exception(\#PF)* occurs if an attempt is made to access a table / page when *P* bit is 0. System software is responsible for loading the missing table or page into memory and setting the *P* bit to 1.

>[!important]
> When the *P* bit is 0, indicating a not-present page, all remaining bits in the page data-structure entry are available to software.

>[!note]
> Entries with *P* cleared to 0 are never cached in *TLB* nor will the processor set the Accessed / Dirty bit for the table entry.

#### Read/Write (R/W) Bit

*Bit 1*. This bit controls read/write access to all physical pages mapped by the table entry. *e.g.*, a page-map level-4 *R/W* bit controls read/write access to all 128M(512 x 512 x 512) physical pages it maps through the lower-level translation tables.
- When the *R/W* bit is cleared to 0, access is restricted to read-only.
- When the *R/W* bit is set to 1, both read and write access is allowed.

#### User/Supervisor(U/S) Bit

*Bit 2*. This bit controls user(*CPL 3*) access to all physical pages mapped by the table entry. *e.g.*, a page-map level-4 *R/W* bit controls read/write access to all 128M(512 x 512 x 512) physical pages it maps through the lower-level translation tables.
- When *U/S* bit is cleared to 0, access is restricted to supervisor level(*CPL 0, 1, 2*).
- When *U/S* bit is set to 1, both user and supervisor access is allowed.

#### Page-Level Writethrough(PWT) Bit
*Bit 3*. This bit indicates whether the page translation table or physical page to which this entry point has a write-back / write-through policy. 
- When the *PWT* bit is cleared to 0, the table / physical page has a write-back caching policy.
- When the *PWT* bit is set to 1, the table / physical page has a write-through caching policy.

#### Page-Level Cache Disable(PCD) Bit
*Bit 4*. This bit indicates whether the page-translation table / physical page to which this entry points is cacheable.
- When the *PCD* bit is cleared to 0, the table / physical page is cacheable.
- When the *PCD* bit is set to 1, the table / physical page is not cacheable.

#### Accessed(A) Bit
*Bit 5*. This bit indicates whether the page-translation table / physical page to which entry points has been accesses.
>[!note]
> - The *A* bit is set to 1 by the processor the first time the table / physical page is either read from / written to.
> - The *A* bit is never cleared by the processor. <span style="color:#D0F4DE">Instead, software must clear this bit to 0 when it needs to track the frequency of table / physical-page accesses</span>.

#### Dirty(D) Bit
*Bit 6*. This bit is only present in the lowest level of the page-translation hierarchy. <span style="color:#FFD60A">It indicates whether the physical page to which this entry points has been written</span>.
>[!note]
> - The *D* bit is set to 1 by processor the first time there is a write to the physical page.
> - The *D* bit is never cleared by the processor. <span style="color:#D0F4DE">Instead, software must clear this bit to 0 when it needs to track the frequency of table / physical-page accesses</span>.

#### Page Size(PS) Bit
*Bit 7*. This bit is present in page-directory entries and *long* mode page-directory-pointer entries.
- <span style="color:#FFD60A">When the PS bit is set in the page-directory-pointer entry(PDPE) / page-directory entry(PDE), that entry is the lowest level of the page-translation hierarchy</span>.
- When the *PS* bit is cleared to 0 in all levels, the lowest level of the page-translation hierarchy is *page-table(PTE)*, and the physical-page size is 4KB. The physical-page size is determined as follows:
	- If *EFER.LMA = 1* and *PDPE.PS = 1*, the physical-page size is 1GB.
	- If *CR4.PAE = 0* and *PDE.PSE = 1*, the physical-page size 4MB.
	- If *CR4.PAE = 1* and *PDE.PSE = 1*, the physical-page size is 2MB.

See [[chap-05-Page Translation and Protection#^3e7506|Table 5-1]] for description of the relationship between the *PS*, *PAE*, physical-page sizes, and page-translation hierarchy.

#### Global(G) Bit
*Bit 8*. This bit is only present in the lowest level of the page-translation hierarchy. <span style="color:#FFD60A">It indicates the physical page is a global page</span>.
>[!tip]
> The *TLB* entry for a global page(G=1) is not invalidated when *CR3* is loaded either explicitly by a *MOV CRn* instruction / implicitly during a task switch.

>[!note]
> Use of the *G* bit requires the *page-global enable bit* in *CR4* to be set to 1(*CR4.PGE = 1*).

#### Available to Software(AVL) Bit
*Bits \[11:9\]*. <span style="color:#FFD60A">These bits are not interpreted by the processor and are available for use by the system software</span>.

#### Page-Attribute Table(PAT) Bit
This bit is only present in the lowest level of the page-translation hierarchy, as follows:
- If the lowest level is a *PTE(PDE.PS = 0)*, *PAT* occupies bit 7.
- If the lowest level is a *PDE(PDE.PS = 1)*, *PAT* occupies bit 12.

The *PAT* bit is the high-order bit of a 3-bit index into the *PAT register*. The other 2 bits involved in forming the index are the *PCD* and *PWT* bits. Not all processors support the *PAT* bit by implementing the *PAT* register.

#### Memory Protection Key(MPK) Bits
*Bits \[62:59\]*. When Memory Protection Keys are enabled(*CR4.PKE=1*), this 4-bit field selects the memory protection key for the physical page mapped by this entry. Ignored if memory protection keys are disabled(*CR4.PKE=0*).

#### No Execute(NX) Bit
*Bit 63*. This bit is present in the translation-table entries defined for *PAE* paging, with the exception that the *legacy* mode *PDPE* does not contain this bit. This bit is not supported by *non-PAE* paging.

>[!warning]
> The *NX* bit can only be set when no-execute page-protection feature is enabled by setting *EFER.NXE* to 1(see [[chap-03-System Resources#Extended Feature Enable Register(EFER)|"Extended Feature Enable Register(EFER)"]])

>[!exception]
> If *EFER.NXE = 0*, the *NX* bit is treated as reserved. In this case, a *page-fault exception(\#PF)* if the NX is not cleared to 0. 

This bit controls the ability to execute code from all physical pages mapped by the table entry. *e.g.*, a page-map level-4 *NX* bit controls the ability to execute code from all 128M(512 x 512 x 512) physical pages it maps through the low-level translation tables.
- When the *NX* bit is cleared to 0, code can be executed from the mapped physical pages.
- When the *NX* bit is set to 1, code cannot be executed from the mapped physical pages.

#### Reserved Bits
>[!exception]
> Software should clear all reserved bits to 0. If the processor is *long* mode, or if page-size and physical-address extensions are enabled in *legacy* mode, a page-fault exception(\#PF) occurs if reserved bits are not cleared to 0.


### Notes on Access and Dirty Bits

The processor never sets the Accessed bit / the Dirty bit for a not present page(*P = 0*). The ordering of Accessed and Dirty bit updates with respect to surrounding loads and stores is discussed below.

#### Accessed(A) Bit
The Accessed bit can be set for instructions that are specularity executed by the processor.

*e.g.*, the Accessed bit may be set by instructions in a mispredicted branch path even though those instructions are never retired. Thus, software must not assume that the *TLB* entry has not been cached in the *TLB*, just because no instruction that accessed the page was successfully retired. 

>[!tip]
> Nevertheless, a table entry is never cached in the *TLB* without its Accessed bit being set at the same time. 

>[!tip]
> Processor does not order Accessed bit updates with respect to loads done by other instructions.

#### Dirty(D) Bit
The Dirty bit is not updated speculatively. For instructions with multiple writes, the *D* bit may be set for any writes completed up to the point of a fault. <span style="color:#FFD60A">In rare cases, the Dirty bit may be set even if a write was not actually performed, including MASKMOVQ with a mask of 0 and certain x87 floating point instructions that cause an exception</span>. Thus softwares can not assume that the page has actually been written even where *PTE\[D\]* is set to 1.

>[!tip]
> If *PTE\[D\]* is cleared to 0, software can rely on the fact that the page has not been written.

In general, Dirty bit updates are ordered with respect to other loads and stores, although not necessarily with respect to accesses to *WC* memory; in particular, they may not cause WC buffers to be flushed. However, to ensure compatibility with future processors, a serializing operation should be inserted before reading the *D* bit.


## Translation-Lookaside Buffer(TLB)

When paging is enabled, every memory access has its virtual address automatically translated into a physical address using page-translation hierarchy.

>[!definition]
> *Translation-lookaside buffers(TLBs)*, also known as *page-translation caches*, nearly eliminate the performance penalty associated with page translation. 
> - <span style="color:#D0F4DE">TLBs are special on-chip caches that hold the most-recently used virtual-to-physical address translations.</span>
> - Each memory reference(instruction and data) is checked by the *TLB*. If the translation is presented in the *TLB*, it is immediately provided to the processor, thus avoiding the external memory reference for accessing *page-tables*.

>[!definition]
> *TLBs* take advantage of the *principle of locality*. That is, if a memory address is referenced, it is likely that nearby memory address will be referenced in the near future.

In the context of paging, the proximity of memory addresses required for locality can be broad -- it is equal to the page size. Thus, it is possible for a large number of addresses to be translated by a small number of page translations. This high degree of locality means that almost all translations are performed using the on-chip *TLBs*.

>[!caution]
> System software is responsible for managing the *TLBs* when updates are made to the linear-to-physical mapping of addresses.
> - A change to any paging data-structure entry is not automatically reflected in the *TLB*.
> - Hardware snooping of *TLBs* during memory references cycles is not performed.
> - Software must invalidate the *TLB* entry of a modified translation-table entry so that the change is reflected in subsequent address translation. <span style="color:#EDAFB8">Only privileged software running at *CPL = 0* can manage the TLBs</span>.


### Process Context Identifier
The Process Context Identifier(*PCID*) feature allows a logical processor to cache *TLB* mappings concurrently for multiple virtual address space. <span style="color:#FFD60A">When enabled(*CR4.PCIDE=1*), the processor associated the current 12-bit PCID with each TLB mapping it creates. Only entries matching the current PCID are used when performing address translation</span>. In this way, the processor may retain cached *TLB* mappings for multiple contexts.

>[!note]
> - The current *PCID* is the value in *CR3\[11:0\]*. When *PCIDs* are enabled the system software can store 12-bit Process Context Identifiers in *CR3* for different address spaces.
> - Subsequently, when system software switches address spaces(by writing the page table base pointer in *CR3\[62:12\]*), the processor may use *TLB* mappings previously stored for that address space and PCID, providing that bit 63 of the source operand is set to 1.  <span style="color:#D0F4DE">If bit 63 is set to 0, the legacy behavior of a move to *CR3* is maintained, invalidating *TLB* entries but only non-global entries for the specified PCID</span>. *Note that this bit is not stored in the CR3 register itself*.

- *PCID-tagged TLB* contents may also be managed using the *INVPCID* instruction; see the *INVPCID* description in \#volume-3 for detail.
- A *MOV* to *CR4* that clears *CR4.PCIDE* causes all cached entries in the *TLB* for the logical processor to be invalidated. <span style="color:#FFD60A">When PCIDs are not enabled, the current PCID is always zero and all TLB mappings are associated with PCID=0</span>.

>[!exception]
> - Attempting to set *CR4.PCIDE* with a *MOV* to *CR4* if *EFER.LMA=0* / *CR3\[11:0\]* :LiEqualNot: 0 causes a *\#GP* exception.
> - Attempting to clear *CR0.PG* with a *MOV* to *CR0* if *CR4.PCIDE* is set also causes a \#GP exception.
> - The presence of *PCID* functionality is indicated by *CPUID* Function 1, *ECX\[PCID\]=1*.


### Global Pages

>[!definition]
> 1. The processor invalidates the *TLB* whenever *CR3* is loaded either explicitly / implicitly. After the *TLB* is invalidated, subsequent address references can consume many clock cycles until their translations are cached as new entries in the *TLB*.
> 2. Invalidation of *TLB* entries for frequently-used / critical pages can be avoided by specifying the translations for those pages as *global*. <span style="color:#FB8B24">TLB entries for global pages are not invalidated as a result of a CR3 load. Global pages are invalidated using the *INVLPG* instruction</span>.

Global-page extensions are controlled by setting and clearing the *PGE* bit in [[chap-03-System Resources#CR4 Register|CR4]](*bit 7*).
- When *CR4.PGE = 1*, global-page extensions are enabled, setting the global(*G*) bit in the translation-table entry marks the page as global.
- When *CR4.PGE = 0*, global-page extensions are disabled.

>[!tip]
> The *INVLPG* instruction ignores the *G* bit and can be used to invalid individual global-page entries in *TLB*. <span style="color:#FB8B24">To invalidate all entries, including global-page entries, disable global-page extensions(CR4.PGE=0)</span>.



### TLB Management

>[!note]
> Generally, unless system software modifies the linear-to-physical address mapping, the processor manages the *TLB* transparently to software. This includes allocating entries and replacing old entries with new entries.

In general, software changes made to paging-data structures are not automatically reflected in the *TLB*. <span style="color:#FFD60A">In these situations, it is necessary for software to invalidate TLB entries so that these changes are immediately propagated to the page-translation mechanism</span>.

*TLB* entries can be explicitly invalidated using operations intended for that purpose / implicitly invalidated as a result of another operation. <span style="color:#FFD60A">TLB invalidation has no effect on the associated page-translation tables in memory</span>.

#### Explicit Invalidations
3 mechanisms are provided to explicitly invalidate the *TLB*.
- The *invalidate TLB entry* instruction (*INVLPG*) can be used to invalidate specific entries within the *TLB*. This instruction invalidates a page, regardless of whether it is marked as global or not. The invalidate *TLB* entry in Specified ASID(INVLPGA) operates similarly, but operates on the specified ASID.

- Updates to the *CR3* register cause the entire *TLB* to be invalidated <span style="color:#FFD60A">except for global pages</span>. the *CR3* register can be updated with the *MOV CR3* instruction. *CR3* is also updated during a task switch, with the updated *CR3* value read from the <span style="color:#FB8500">TSS</span> of the new task.

- The *TLB_CONTROL* field of a *VMCB* can request specific flushes of the *TLB* to occur when the *VMRUN* instruction is executed on that *VMCB*.

#### Implicit Invalidations
The following operations cause the entire *TLB* to be invalidated, including global pages:
- Modifying the [[chap-03-System Resources#CR0 register|CR0.PG]] bit (paging enable).
- Modifying the [[chap-03-System Resources#CR4 Register|CR4.PAE]] bit(physical-address extensions), the [[chap-03-System Resources#CR4 Register|CR4.PSE]] bit(page-size extensions), [[chap-03-System Resources#CR4 Register|CR4.PGE]] bit(page-global enable).
- Entering [[chap-01-Overview#^aee8ff|SMM]] as a result of an *SMI* interrupt.
- Executing the *RSM* instruction to return from [[chap-01-Overview#^aee8ff|SMM]].
- Updating a memory-type range register(*MTRR*) with the *WRMSR* instruction.
- External initialization of the processor.
- External masking of the *A20* address bit(asserting the *A20M#* input signal).
- Writes to certain model-specific registers with *WRMSR* instruction.


#### Invalidation of Table Entry Upgrades

>[!tip]
> If a table entry is updated to remove a *permission violation*, such as removing supervisor, read-only, and/or no-execute restrictions, an invalidation is not required, because the hardware will automatically detect the changes.

>[!warning]
> If a table entry is updated and does not remove a permission violation, it is unpredictable whether the old / updated entry will be used until an invalidation is performed.


#### Speculative Caching of Address Translations
>[!tip]
> For performance reasons, AMD64 processors may speculatively load valid address translations into the *TLB* on false execution paths.

Such translations are not based on references that a program makes from an "architecture state" perspective, but which the processor may make in speculatively following an instruction path which turns out to be unpredictable. <span style="color:#FFD60A">In general, the processor may create a TLB entry for any linear address for which valid entries exist in the page table structures currently pointed to by CR3. This may occur for both instruction fetches and data references</span>. Such entries remain cached in the *TLBs* and may be used in subsequent translations.

>[!note]
> Loading a translation entry speculatively will set the *Accessed* bit, if not already set.

>[!warning]
> A translation will not be loaded speculatively if the *Dirty* bit needs to be set.

#### Caching of Upper Level Translation Table Entries
<span style="color:#FFD60A">Similarly, to improve the performance of table walks on TLB misses, AMD64 processors may save upper level translation table entries in special table walk caching structures which are kept coherent with the tables in memory via the same mechanisms as the TLBs -- by means of the INVLPG instruction, moves to CR3, and the modification of paging control bits in CR0 and CR4</span>. Like address translation in the *TLB*, these upper level entries may also be cached speculatively and by false-path execution. These entries are never cached if their *P* (present) bits are set to 0.

Under certain circumstances, an upper-level table entry that cannot ultimately lead to a valid translation(because there are no valid entries in the lower table to which it points) may also be cached. This can happen while executing down a false path, when an in-progress table walk gets cancelled by the branch mispredict before the low level table entry that would cause a fault is encountered.

>[!note]
> Said another way, the fact that a page table has no valid entries does not guarantee that upper level table entries won't accessed and cached in the processor, as long as those upper level entries are marked as *present*.

>[!tip]
> For this reason, it is not safe to modify an upper level entry, even if no valid lower-level entries exist, without first clearing its present bit, following by an *INVLPG* instruction.

#### Use of Cached Entries When Reporting a Page Fault Exception

>[!exception]
> On current AMD64 processors, when any type of page fault exception is encountered by the *MMU*, <span style="color:#95D5B2">any cached upper-level entries that leads to the faulting entry are flushed (along with the *TLB* entry, if already cached) and the table walk is repeated to confirm the page fault using the table entries in memory.</span>

This is done because a table entry is allowed to be upgraded(*by marking it as present, or by removing its write, execute or supervisor restrictions*) without explicitly maintaining *TLB* coherency. Such an upgrade will be found when the table is re-walked, which resolves the fault.

>[!exception]
> If the fault is confirmed on the re-walk however, a page fault exception is reported, and upper level entries that may have been cached on the re-walk are flushed.

#### Handling of D-Bit Updates
When the processor needs to set the *D* bit in the *PTE* for a *TLB* entry that is already marked as writable at all cached TLB levels, the table walk that is performed to access the *PTE* is memory may use cached upper level table entries. <span style="color:#FFD60A">This differs from the fault situation previously described, in which cached entries aren't used to confirm the fault during the table walk</span>.

#### Invalidation of Cached Upper-level Entries by INVLPG
The effect of *INVLPG* on *TLB* caching of upper-level page table entries is controlled by [[chap-03-System Resources#Extended Feature Enable Register(EFER)|EFER[TCE] ]] on processor that support the translation cache extension feature.
- If *EFER\[TCE\] = 0*, or if the processor does not support the translation cache extension feature, and *INVLPG* will flush *all* upper-level page table entries in the *TLB* as well as the target *PTE*.
- If *EFER\[TCE\] = 1*, *INVLPG* will flush only those upper-level entries that lead to the target *PTE*, along with the target *PTE* itself. 

>[!note]
> *INVLPGA* may flush all upper-level entries regardless of the state of TCE.

#### Handling of PDPT Entries in PAE Mode
When 32-bit *PAE* mode is enabled on AMD64 processors(*CR4.PAE = 1*), a third level of the address translation table hierarchy, the page directory pointer table(*PDPT*), is enabled. *This table contains 4 entries*.

On currently AMD64 processors, in native mode, these four entries are unconditionally loaded into the table walk cache whenever *CR3* is written with the *PDPT* base address, and remain locked in.

>[!exception]
> At this point they are also checked for reserved bit violations, and if such violations are present a *general protection fault* occurs.

Under SVM, however, when the processor is in guest mode with *PAE* enabled, the guest *PDPT* entries are not cached or validated at this point, but instead are loaded and checked on demand in the normal course of address translation, just like page directory and page table entries.

>[!exception]
> Any reserved bit violation are detected at the point of use, and result in  a *page fault(\#PF)* exception rather than a *general protection(\#GP) fault*.
> 

The cached *PDPT* entries are subject to displacement from the table walk cache and reloading from the *PDPT*, hence software must assume that the *PDPT* entries may be read by the processor at any point while those table are active. Future AMD processors may implement this same behavior in native mode as well, rather than pre-loading the *PDPT* entries.

## Page-Protection Checks

The AMD64 arch provides the following forms of page-level memory protection:
- **Supervised pages**: This form of protection prevents non-privileged(user) code from accessing privileged(supervisor) code and data.
- **Read-only pages**: This form of protection prevents writes into read-only address spaces.
- **Instruction fetch restrictions**: Two forms of page-level memory protection prevent the processor from fetching instructions from pages that are either known to contain non-executable data or that are accessible by user-mode code.
- **Memory protection keys**: This form of protection allows an application to manage page-based data access protections from user mode.
- **Shadow stack pages**: The processor restricts the types of memory accesses that are allowed to read/write a shadow stack page and prohibits the shadow stack mechanism from accessing non-shadow stack pages.

Access protection checks are performed when a virtual address is translated into a physical address. For these checks, the processor examines the page-level memory-protection bits in the translation tables to determine if the access is allowed. The page table bits involved in these checks are:
- [[chap-05-Page Translation and Protection#User/Supervisor (U/S) Bit|User/Supervisor(U/S)]]
- [[chap-05-Page Translation and Protection#Read/Write (R/W) Bit|Read/Write(R/W)]]
- [[chap-05-Page Translation and Protection#No Execute(NX) Bit|NX]]
- [[chap-05-Page Translation and Protection#Memory Protection Key(MPK) Bits|Memory Protection Key(MPK)]]

Access protection actions taken by the processor are controlled by the following bits:
- Write-Protect enable([[chap-03-System Resources#CR0 register|CR0.WP]])
- No-Execute Enable([[chap-03-System Resources#Extended Feature Enable Register(EFER)|EFER.NXE]])
- Supervisor-mode Execution Prevention enable([[chap-03-System Resources#CR4 Register|CR4.SMEP]])
- Supervisor-mode Access Prevention enable([[chap-03-System Resources#CR4 Register|CR4.SMAP]])
- Alignment Check bit([[chap-03-System Resources#RFLAGS REGISTER|RFLAGS.AC]])
- Protection Key Enable([[chap-03-System Resources#CR4 Register|CR4.PKE]])
- Control-flow Enforcement Technology([[chap-03-System Resources#CR4 Register|CR4.CET]])

>[!note]
> These protection checks are available at all levels of the page translation hierarchy.

### User/Supervisor (U/S) Bit

>[!definition]
> The *U/S* bit in the page-translation tables determines the privilege level required to access the page. 

Conceptually, user(non-privileged) pages correspond to a current privilege-level(*CPL*) of 3, or least-privileged. Supervisor(privileged) pages correspond to a *CPL* of 0, 1, or 2, all of which are jointly regarded as most-privileged.

- When the processor is running at *CPL* of 0/1/2, it can access both user and supervisor pages  <span style="color:#FFD60A">unless restricted by SMEP/SMAP</span>.
- When the processor is running at *CPL* of 3, it can only access user pages.

>[!exception]
> If an attempt is made to access a supervisor page while the processor is running at *CPL = 3*, a page-fault exception(*\#PF*) occurs.

### Read/Write(R/W) Bit

>[!definition]
> The *R/W* bit in the page-translation tables specifies the access type allowed for the page. 

- If *R/W = 1*, the page is read/write.
- If *R/W = 0*, the page is read-only.

>[!exception]
> A page-fault exception(*\#PF*) occurs if an attempt is made by user software to write to a read-only page. If supervisor software attempts to write a read-only page, the outcome depends on the value of *CR0.WP* bit.


### No Execute(NX) Bit

>[!definition]
> The *NX* bit in the page-translation tables specifies whether instructions can be executed from the page. 

This bit is not checking during every instruction fetch. <span style="color:#FFD60A">Instead, the NX bits in the page-translation-table entries are checked by the processor when the instruction TLB is loaded with a page translation</span>. The processor attempts to load the translation into the instruction *TLB* when an instruction fetch misses the *TLB*.
>[!exception]
> If a set *NX* bit is detected(indicating the page is not executable), a *page-fault exception(\#PF)* occurs.

>[!note]
> The no-execute protection check applies to all privilege levels. It does not distinguish between supervisor and user-level accesses.

>[!note]
> The no-execute protection feature is supported only in *PAE-paging* mode. It is enabled by setting the *NXE* in the [[chap-03-System Resources#Extended Feature Enable Register(EFER)|EFER]] register to 1. Before setting this bit, system software must verify the processor supports the *NX* feature by checking *CPUID NX* feature flag (<span style="color:#D0F4DE">CPUIDFn8000_0001_EDX[FFXSR]</span>).

### Write Protect(CR0.WP) Bit

>[!definition]
> The ability to write to read-only pages is governed by the processor mode and whether write protection is enabled.

- If write-protection is not enabled, a processor running at *CPL* 0/1/2 can write to any physical page, even if it is marked as *read-only*.
- If write-protection is enabled, a processor running in supervised code is prevented from writing into read-only pages, including read-only user-level pages.

>[!exception]
> A page-fault exception(#PF) occurs if software attempts to write(at any privilege level) into a read-only page while write-protection is enabled.

### Supervisor-Mode Execution Prevention(CR4.SMEP) Bit

>[!exception]
> When supported and enabled, a *page-fault exception(#PF)* is generated if the processor attempts to fetch an instruction from a user page running at *CPL* 0/1/2.

Supervisor-mode execution prevention is enabled by setting the *SMEP* bit(bit 20) in the *CR4* register to 1.

>[!attention]
> Before setting this bit, system software must verify the processor supports the *SMEP* feature by checking the *SMEP* feature flag(*CPUID Fn0000_0007EBX\[SMEP\]_x0=1*).

For more information using the *CPUID* instruction see [[chap-03-System Resources#Processor Feature Identification|chapter 3-Processor Feature Identification]].

### Supervisor-Mode Access Prevention(CR4.SMAP) Bit

>[!exception]
> When *SMAP* is supported and enabled, a *page-fault exception(#PF)* is generated if the processor attempts to read/write data from a user page and one of the following is true:
> - The access is an implicit supervisor-mode access
> - The access is made while running at *CPL* 0/1/2 and *RFLAGS.AC=0*


Some accesses are considered *implicit supervisor-mode access*. Implicit supervisor-mode accesses are subject to the *SMAP* check regardless of the value of *RFLAG.AC*.

>[!definition]
> An implicit supervisor-mode access is one that is considered a supervisor access regardless of the value of *CPL*.

Supervisor-mode access prevention is enabled by setting the *SMAP* bit(bit 21) in the *CR4* register to 1.

>[!attention]
> Before setting this bit, system software must verify the processor supports the *SMEP* feature by checking the *SMEP* feature flag(*CPUID Fn0000_0007EBX\[SMAP\]_x0=1*).

For more information using the *CPUID* instruction see [[chap-03-System Resources#Processor Feature Identification|chapter 3-Processor Feature Identification]].

### Memory Protection Keys(MPK) Bit

>[!summary]
> The Memory Protection Key(MPK) feature provides a way for applications to impose page-based data access protections(*read/write, read-only or no access*), without requiring modification of *page tables* and subsequent *TLB* invalidations when the application changes protection domains.

>[!important]
> When *MPK* is enabled(*CR4.PKE=1*), a protection key is located in bits 62:59 of final page table entry mapping each virtual address. This 4-bit protection key is used as an index(i) into the user-accessible *PKPU* register which contains 16 access-disable/write-disable(WDi/ADi) pairs.

![[image/amd64/vol2/chap-05/pkru_register.png]]

The *WDi/ADi* pairs operate as follows:

- if *ADi=0*, data access is permitted
- if *ADi=1*, no data access is permitted(regardless of *CPL*).
- if *WDi == 0*, write access is allowed.
- if *WDi == 1*: User-mode write access is not allowed. Supervisor access is controlled by *CR0.WP*:
	- if *CR0.WP=1*, supervisor-mode writes are not allowed.
	- if *CR0.WP=0*, supervisor-mode writes are allowed.

Software can use the *RDPKRU* and *WRPKRU* instructions to read and write the *PKRU* register. 

>[!info]
> These instructions are not privileged and can be used in user mode/in supervisor mode.

The *MPK* mechanism is ignored in the following cases:
- if *CR4.PKE=0*
- if *long* mode is disabled(*EFER.LMA=0*)
- for instruction fetches
- for page marked in the paging structures as supervisor addresses(*U/S=0*)



## Shadow Stack Protection

When the shadow stack feature is enabled(*CR4.CET=1*), certain combination of page-table protection bits are used to distinguish pages containing shadow stacks from ordinary pages.

>[!definition]
> As described in the following sections, the processor restricts the types of memory accesses that can be made to shadow stack pages and prohibits the shadow stack mechanism from accessing non-shadow stack pages.


### Shadow Stack Access

The processor treats certain memory access as shadow stack accesses.

>[!definition]
> Shadow stack accesses are generated only by the shadow stack instructions/by the shadow stack mechanism.

As with ordinary data accesses, a shadow stack accesses can be either a supervisor access/a user access depending on the *CPL* when the access is made. 
- Shadow stack accesses made when the processor is at *CPL* 0/1/2 are supervisor-shadow stack accesses.
- Shadow stack accesses made when the processor is at *CPL* 3 are user-shadow stack accesses.
- 
>[!note]
> An exception is the *WRUSS* instruction, whose access are always treated as user-shadow accesses.


### Shadow Stack Pages

Shadow stack accesses are allowed only to linear address that are mapped to shadow stack pages. A shadow stack is described by the following combination of page-table protection bits:
- *R/W(Read/Write)=0* and *D(dirty)=1* in the final page-table entry that maps the linear address.
- *R/W(Read/Write)=0* in all other page-mapping structures leading to the final page-table entry.

The *U/S(User/Supervisor)* bit in the page-translation tables determines the privilege level required to access a given stack page.
- If *U/S=0*, the page is considered a supervisor-shadow stack page.
- If *U/S=1*, the page is considered a user-shadow stack page.



### Shadow Stack Protection Checks

The processor restricts the types of memory accesses that are allowed to read/write a shadow stack page. The page-level protection bits and the type of memory access are examined to determine if the access is allowed.

The following section assumes the memory protection key field allows access to the given page, if memory protection keys are enabled, and that *CR0.WP=1*(which is prerequisite for enabling the shadow stack feature).

The following memory accesses are allowed to shadow stack pages:
- User-shadow stack accesses can read/write user-shadow stack pages.
- Supervisor-shadow stack accesses can read/write supervisor-shadow stack pages.

>[!note]
> Shadow stack write accesses are allowed to complete, even though the *R/W* bit is 0.

- Non-shadow stack reads can read any shadow stack page(subject to *U/S* page protections).

The following memory accesses are not allowed:
- User-shadow stack access to supervisor-shadow stack pages.
- Supervisor-shadow stack access to user-shadow stack pages.
- Any shadow stack access to a non-shadow stack page.
- Non-shadow stack writes to a shadow stack page.

>[!exception]
> If the memory access is not allowed, a *page-fault exception(\#PF)* is generated with the paging-protection violation bits(*user/supervisor, read/write, or both*) set in the code as appropriate. <span style="color:#95D5B2">The *SS* bit is set in the *\#PF* error code if the page fault was caused by a shadow stack accesses</span>.


## Protection Across Paging Hierarchy

>[!abstract]
> The privilege level and access type specified at each level of the page-translation hierarchy have a combined effect on the protection of the translated physical page. Enabling and disabling write protection further qualifies the protection effect on the physical page.

[[chap-05-Page Translation and Protection#^cb2791|Table 5-2]] shows the overall effect that privilege level and access type have on physical-page protection When write protection is disabled(*CR0.WP=0*). <span style="color:#FFD60A">In this case, when any translation-table entry is specified as supervisor level, the physical page is a supervisor page and can only be accessed by software running at CPL 0/1/2. Such a page allows read/write access even if all levels of the page-translation hierarchy specify read-only access</span>.

![[image/amd64/vol2/chap-05/physical-page-protection.cr0-wp=0.png]] ^cb2791

If *all* table entries in the translation hierarchy are specified as user level the physical page is a user page, and both supervisor and user software can access it. <span style="color:#FFD60A">In this case the physical page is read-only if any table entry in the translation hierarchy specifies read-only access. All table entries in the translation hierarchy must specify read/write access for the physical page to be read/write</span>.

[[chap-05-Page Translation and Protection#^42aa10|Table 5-3]] shows the overall effect that privilege level and access type have on physical-page access when write protection is enabled(*CR0.WP = 1*).When any translation-table entry is specified as supervisor level, the physical page is a supervisor page and can only be accessed by supervisor software. <span style="color:#FFD60A">In this case, the physical page is read-only if any table entry in the translation hierarchy specifies read-only access. All table entries in the translation hierarchy must specify read/write access for the supervisor page to be read/write</span>.
![[image/amd64/vol2/chap-05/physical-page-protection.cr0-wp=1.png]] ^42aa10

### Access to User Pages when CR0.WP=1
As shown in [[chap-05-Page Translation and Protection#^cb2791|Table 5-2]], read/write access to user-level pages behaves the same as when write protection is disabled(*CR0.WP = 0*), with one critical difference. <span style="color:#FFD60A">When write protection is enabled, supervisor programs cannot write into read-only user pages</span>.


## Effects of Segment Protection

Segmentation protection and page protection checks are performed serially by the processor, with segment-privilege checks performed first, followed by page-protection checks. Page protection checks are not performed if a segment-protection violation is found. If a violation is found during either segment-protection / page-protection checking, an exception occurs and no memory access is performed.

>[!exception]
> - Segmentation-protection violations cause either a general-protection exception(*\#GP*) or a stack exception(*\#SS*) to occur.
> - Page-protection violations cause a page-fault exception(*\#PF*) to occur.


## Upper Address Ignore

The Upper Address Ignore feature provides a way for software to use bits 63:57 of address as an arbitrary software-assigned and software-interpreted tag. When this feature is enabled, these address bits are excluded from the canonically check that's done when the address is used for certain memory references.

### Detecting and Enabling Upper Address Ignore

Support for the *Upper Address Ignore* feature is indicated by *CPUID_Fn8000_0021_EAX\[UpperAddressIgnore\](bit 7)=1*. The Upper Address Ignore feature is enabled by setting *EFER.UAIE(bit 20)* in *64-bit* mode(*EFER.LMA=CS.L=1*). 

>[!note]
> *EFER.UAIE* is ignored outside of *64-bit* mode.


### Upper Address Ignore Operation

>[!important]
> When *Upper Address Ignore* is active the processor no longer performs a *canonical address* check on bits 63:57 of the logical address for memory references that either the *DS*/*ES* segment, it checks only bis 56:48 of the logical address when 4-level paging is enabled. No *canonical* checks are performed for *ES*/*DS* segment memory references when 5-level paging is enabled.

Any memory reference made using the segment registers *CS*, *SS*, *FS*, or *GS* still performs the normal canonical address check. This include <span style="color:#FFD60A">indirect jump, call, and return target addresses since they are CS based. Canonical checks for implicit references to IDT, GDT, LDT and TSS are not supported when Upper Address Ignore is active</span>.


### Address Tag Storage

The following registers, which hold virtual addresses for communication to software, are not guaranteed to hold the address tag in the upper 7 bits:
- *CR2*
- *x87 DP*
- *IBS Data Cache Linear Address Register*



### Debug Breakpoint Behavior with Upper Address Ignore

The Debug Breakpoint Address Register(*DR0-3*) hold full *64-bit* addresses and Upper Address Ignore changes how the address match is performed for data address breakpoints. When Upper Address Ignore is active the value in *DR0-3\[63:57\]* is ignored and the linear address of the memory access is only compared against *DR0-3\[56:0\]*.

