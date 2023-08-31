	#+ BITTE NICHT MODIFIZIEREN: Vorgabeabschnitt
	#+ ------------------------------------------

.data

	# Beispiel-Irrgarten-Arrays maze1, maze2, maze3:
maze1:
	.byte 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
	.byte 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0xFF, 0x00
	.byte 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0xFF, 0x00
	.byte 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0x00, 0xFF, 0x00
	.byte 0x00, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0x00
	.byte 0x00, 0x00, 0xFF, 0x00, 0xFF, 0x00, 0x00, 0x00
	.byte 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00
	.byte 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
maze2:
	.byte 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0x00, 0x00
	.byte 0x00, 0xFF, 0x00, 0xFF, 0x00, 0xFF, 0xFF, 0xFF
	.byte 0x00, 0xFF, 0x00, 0xFF, 0x00, 0xFF, 0x00, 0x00
	.byte 0x00, 0xFF, 0xFF, 0xFF, 0x00, 0xFF, 0x00, 0x00
	.byte 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0xFF
	.byte 0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00
	.byte 0x00, 0xFF, 0x00, 0xFF, 0x00, 0xFF, 0x00, 0x00
	.byte 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
maze3:
	.byte 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
	.byte 0x00, 0xFF, 0xFF, 0xFF, 0x00, 0xFF, 0xFF, 0x00
	.byte 0x00, 0x00, 0xFF, 0x00, 0x00, 0x00, 0xFF, 0x00
	.byte 0x00, 0x00, 0xFF, 0x00, 0xFF, 0x00, 0x00, 0x00
	.byte 0x00, 0xFF, 0xFF, 0x00, 0xFF, 0x00, 0xFF, 0x00
	.byte 0x00, 0x00, 0xFF, 0x00, 0x00, 0x00, 0xFF, 0x00
	.byte 0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0xFF, 0x00
	.byte 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0x00

	# Lookup-Tabelle fuer Hilfsfunktion neighbor (siehe unten):
test_neighbor_lut:
	.word 0x0000f7fe, 0x00fff6fd, 0x00fef5fc, 0x00fdf4fb, 0x00fcf3fa, 0x00fbf2f9, 0x00faf1f8, 0x00f9f000
	.word 0xff00eff6, 0xfef7eef5, 0xfdf6edf4, 0xfcf5ecf3, 0xfbf4ebf2, 0xfaf3eaf1, 0xf9f2e9f0, 0xf8f1e800
	.word 0xf700e7ee, 0xf6efe6ed, 0xf5eee5ec, 0xf4ede4eb, 0xf3ece3ea, 0xf2ebe2e9, 0xf1eae1e8, 0xf0e9e000
	.word 0xef00dfe6, 0xeee7dee5, 0xede6dde4, 0xece5dce3, 0xebe4dbe2, 0xeae3dae1, 0xe9e2d9e0, 0xe8e1d800
	.word 0xe700d7de, 0xe6dfd6dd, 0xe5ded5dc, 0xe4ddd4db, 0xe3dcd3da, 0xe2dbd2d9, 0xe1dad1d8, 0xe0d9d000
	.word 0xdf00cfd6, 0xded7ced5, 0xddd6cdd4, 0xdcd5ccd3, 0xdbd4cbd2, 0xdad3cad1, 0xd9d2c9d0, 0xd8d1c800
	.word 0xd700c7ce, 0xd6cfc6cd, 0xd5cec5cc, 0xd4cdc4cb, 0xd3ccc3ca, 0xd2cbc2c9, 0xd1cac1c8, 0xd0c9c000
	.word 0xcf0000c6, 0xcec700c5, 0xcdc600c4, 0xccc500c3, 0xcbc400c2, 0xcac300c1, 0xc9c200c0, 0xc8c10000

print_maze_str_header: .asciiz "Result:\n    0  1  2  3  4  5  6  7\n   -------------------------\n0 | "

.text

.eqv SYS_PUTSTR 4
.eqv SYS_PUTCHAR 11
.eqv SYS_PUTINT 1
.eqv SYS_EXIT 10

main:
	la $t0, test_maze_select
	lw $a0, 0($t0)
	la $t0, test_maze_start
	lw $a1, 0($t0)
	li $a2, 1
	jal prop_wave

	la $t0, test_maze_select
	lw $a0, 0($t0)
	jal print_maze
	
	li $v0, SYS_EXIT
	syscall

	# Hilfsfunktion neighbor, arbeitet mittels Lookup-Tabelle:
	# Parameter $a0: Ausgangsfeld-Index
	#           $a1: Richtung (0=oben, 1=links, 2=unten, 3=rechts)
	# Rueckgabewert $v0: Nachbarfeld-Index
neighbor: # $a0: position, $a1: direction
	sll $a0, $a0, 2
	andi $a1, $a1, 3
	xori $a1, $a1, 3
	or $a0, $a0, $a1
	andi $a0, $a0, 255
	la $t0, test_neighbor_lut
	add $t0, $a0, $t0
	lbu $t0, 0($t0)
	xori $t0, $t0, 255
	sll $t0, $t0, 24
	sra $v0, $t0, 24
	jr $ra

	# Funktion print_maze: wird von dem Vorgabecode aus aufgerufen und gibt den in $a0
	# uebergebene Irrgarten als Text aus.
	# Parameter $a0: Irrgarten-Array
	# Rueckgabewert: keiner
print_maze: # $a0: maze
	# $t0: position, $t1: index
	move $t0, $a0
	move $t1, $zero

	li $v0, SYS_PUTSTR
	la $a0, print_maze_str_header
	syscall
	
print_maze_loop:
	# $t2: zero if end of line
	and $t2, $t1, 7
	xor $t2, $t2, 7

	# $t3: current field, $t4: next field (or zero, if end of line)
	lbu $t3, 0($t0)
	move $t4, $zero
	beq $t2, $zero, print_maze_dont_read_next
	lbu $t4, 1($t0)
print_maze_dont_read_next:
	
	beq $t3, 0, print_maze_empty
	beq $t3, 255, print_maze_barr
	beq $t3, 254, print_maze_route
	
	ble $t3, 99, print_maze_not_too_big
	li $t3, 99
print_maze_not_too_big:
	
	li $v0, SYS_PUTINT
	move $a0, $t3
	syscall
	
	li $v0, SYS_PUTCHAR
	li $a0, ' '
	syscall
	bge $t3, 10, print_maze_single_space
	syscall
print_maze_single_space:
	j print_maze_entry_end

print_maze_empty:
	li $v0, SYS_PUTCHAR
	la $a0, ' '
	syscall
	syscall
	syscall
	j print_maze_entry_end

print_maze_route:
	la $a0, '+'
	j print_maze_barr_or_route
print_maze_barr:
	la $a0, 'X'
print_maze_barr_or_route:
	li $v0, SYS_PUTCHAR
	syscall
	syscall
	beq $t4, $t3, print_maze_long
	la $a0, ' '
print_maze_long:
	syscall
	j print_maze_entry_end

print_maze_entry_end:   
	# print newline at end of row
	bne $t2, $zero, print_maze_no_nl
	li $v0, SYS_PUTCHAR
	li $a0, '\n'
	syscall

	bge $t1, 63, print_maze_loop_end
			
	li $v0, SYS_PUTINT
	srl $a0, $t1, 3
	addi $a0, $a0, 1
	syscall
	
	li $v0, SYS_PUTCHAR
	li $a0, ' '
	syscall 
	li $a0, '|'
	syscall 
	li $a0, ' '
	syscall 
print_maze_no_nl:

	addi $t0, $t0, 1
	addi $t1, $t1, 1
	j print_maze_loop

print_maze_loop_end:
	li $v0, SYS_PUTCHAR
	li $a0, '\n'
	syscall     

	jr $ra

	#+ BITTE VERVOLLSTAENDIGEN: Persoenliche Angaben zur Hausaufgabe 
	#+ -------------------------------------------------------------

	# Vorname: Jsnnik	
	# Nachname: Novak
	# Matrikelnummer: 392210
	
	#+ Loesungsabschnitt
	#+ -----------------

.data
   
   test_maze_select: .word maze1
   test_maze_start: .word 19

.text

prop_wave:
	addi $sp,$sp,-4
	sw $ra,0($sp)
	
	move $t5,$a0	#maze
	move $t6,$a1	#pos
	move $t7,$a2	#dist

start:
	add $s5,$t5,$t6
	lbu  $s6,($s5)
	seq $s0,$s6,255
	sle $s1,$s6,$t7
	sne $s2,$s6,0
	and $s3,$s1,$s2
	or $s4,$s0,$s3	#s4 = 1 abbruchbedingung erreicht
	seq $t0,$t8,3	
	and $t1,$t0,$s4	#t1 = 1 zuletzt rechts + abbruchbedingung -> goto prev field and visit neighbors of prev field
	beq $t1,1,prev_field
	beq $s4,1,hindernis
frei:
	addi $sp,$sp,-4
	sw $t6,0($sp)
	add $s5,$t5,$t6
	sb $t7,($s5)
	b n_up
hindernis:
	move $t6,$s7	#reseting to previous postion
	addi $t7,$t7,-1
	jr $ra 
prev_field:
	beq $sp,0x7fffeff4,end
	lw $t6,4($sp)
	addi $sp,$sp,4
	addi $t7,$t7,-2
	b n_up
prev_field_sonderfall:
	beq $sp,0x7fffeff8,end
	lw $t6,4($sp)
	addi $sp,$sp,4
	addi $t7,$t7,-1
	b n_up
n_up:
	move $s7,$t6	#saving the previous postion
	move $a0,$t6
	li $a1,0
	move $t8,$a1	#save previous direction
	jal neighbor
	beq $v0,-1,n_left
	addi $t7,$t7,1
	move $t6,$v0
	jal start
n_left:
	move $s7,$t6
	move $a0,$t6
	li $a1,1
	move $t8,$a1	#save previous direction
	jal neighbor
	beq $v0,-1,n_down
	addi $t7,$t7,1
	move $t6,$v0
	jal start
n_down:
	move $s7,$t6
	move $a0,$t6
	li $a1,2
	move $t8,$a1	#save previous direction
	jal neighbor
	beq $v0,-1,n_right
	addi $t7,$t7,1
	move $t6,$v0
	jal start
n_right:
	move $s7,$t6
	move $a0,$t6
	li $a1,3
	move $t8,$a1	#save previous direction
	jal neighbor
	beq $v0,-1,prev_field_sonderfall
	addi $t7,$t7,1
	move $t6,$v0
	jal start
end:
	lw $ra,4($sp)
	addi $sp,$sp,8
	
	jr $ra
