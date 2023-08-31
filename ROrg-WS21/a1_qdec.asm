	#+ BITTE NICHT MODIFIZIEREN: Vorgabeabschnitt
	#+ ------------------------------------------

.data

str_Rueckgabewert: .asciiz "\nRueckgabewert: "

.text

.eqv SYS_PUTSTR 4
.eqv SYS_PUTCHAR 11
.eqv SYS_PUTINT 1
.eqv SYS_EXIT 10

main:

	la $a0, signal_A
	la $a1, signal_B
	jal qdec
	
	move $t0, $v0
	
	li $v0, SYS_PUTSTR
	la $a0, str_Rueckgabewert
	syscall
	
	li $v0, SYS_PUTINT
	move $a0, $t0
	syscall

	li $v0, SYS_EXIT
	syscall

	#+ BITTE VERVOLLSTAENDIGEN: Persoenliche Angaben zur Hausaufgabe 
	#+ -------------------------------------------------------------

	# Vorname: Jannik 
	# Nachname: Novak
	# Matrikelnummer: 392210
	
	#+ Loesungsabschnitt
	#+ -----------------

.data

signal_A: .byte 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1
signal_B: .byte 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0

.text

qdec:   
	li $t0,0
	li $t1,0
	li $t2,0
	la $s6,($a0)
	la $s7,($a1)
	
while_start: 
	bge $t2,15,while_end
			
	beq $t1,0,one
	beq $t1,1,two
			
one:
	lb $t4,($s6)
	lb $t5,1($s6)
	xor $s0,$t4,$t5
	lb $t4,($s7)
	lb $t5,1($s7)
	xor $s1,$t4,$t5
	and $s2,$s0,$s1
	beq $s2,1,if_1
	beq $s0,1,if_2
	beq $s1,1,if_3
	b no_move
								
if_1:
	li $t0,-1
	b while_end
				
if_2:
	addi $t0,$t0,-90
	addi $s6, $s6,1
	addi $s7, $s7,1
	addi $t2,$t2,1
	li $t1,1
	b while_start
				
if_3:
	addi $t0,$t0,90
	addi $s6, $s6,1
	addi $s7, $s7,1
	addi $t2,$t2,1
	li $t1,1
	b while_start
			
two:
	lb $t4,($s6)
	lb $t5,1($s6)
	xor $s0,$t4,$t5
	lb $t4,($s7)
	lb $t5,1($s7)
	xor $s1,$t4,$t5
	and $s2,$s0,$s1
	beq $s2,1,if_4
	beq $s0,1,if_5
	beq $s1,1,if_6
			
		
if_4:
	li $t0,-1
	b while_end
		
if_5:
	addi $t0,$t0,90
	addi $s6, $s6,1
	addi $s7, $s7,1
	addi $t2,$t2,1
	li $t1,0
	b while_start
			
if_6:
	addi $t0,$t0,-90
	addi $s6, $s6,1
	addi $s7, $s7,1
	addi $t2,$t2,1
	li $t1,0
	b while_start

no_move:
	addi $s6, $s6,1
	addi $s7, $s7,1
	addi $t2,$t2,1
	b while_start
		
while_end:

	add $v0,$v0,$t0
		
	jr $ra
