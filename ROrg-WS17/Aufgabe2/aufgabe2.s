# v180105

#########################################
# Vorgabe: find_str
#########################################
# $a0: haystack
# $a1: len of haystack
# $a2: needle
# $a3: len of needle
# $v0: relative position of needle, -1 if not found

find_str:
    # save $ra on stack
    addi $sp, $sp, -4
    sw $ra, 0($sp)

    # save beginning of haystack
    move $t5, $a0
    # save len of needle
    move $t4, $a3

    # calc end address of haystick and needle
    add $a1, $a1, $a0
    add $a3, $a3, $a2

haystick_loop:
    bge $a0, $a1, haystick_loop_end

    move $t6, $a0
    move $t7, $a2
needle_loop:
    # load char from haystick
    lbu $t0, 0($t6)
    # load char from needle
    lbu $t1, 0($t7)

    bne $t0, $t1, needle_loop_end

    addi $t6, $t6, 1
    addi $t7, $t7, 1

    # reached end of needle
    bge $t7, $a3, found_str

    # reached end of haystick
    bge $t6, $a1, found_nostr

    j needle_loop
needle_loop_end:

    addi $a0, $a0, 1
    j haystick_loop
haystick_loop_end:

found_nostr:
    # prepare registers so found_str: produces -1
    li $t6, 0
    li $t5, 0
    li $t4, 1

found_str:
    sub $v0, $t6, $t5
    sub $v0, $v0, $t4


    # restore $ra from stack
    lw $ra, 0($sp)
    addi $sp, $sp, 4
    jr $ra

#########################################
# Aufgabe 2: Spamfilter
#########################################
# $v0: Spamscore

spamfilter:
	addi 	$sp, $sp, -28	
	sw 	$ra, 0($sp)
	sw 	$s0, 4($sp)
	sw 	$s1, 8($sp)
	sw	$s2, 12($sp)
	sw	$s3, 16($sp)
	sw 	$s4, 20($sp)
	sw	$s5, 24($sp)

	add	$s5, $zero, $zero	#$s5 = 0, index
outerloop:
	li	$t2, 44			#$t2 = ","
	lw	$t8, badwords_size	#$t8 = bw_size, max index
	bgt	$s5, $t8, outerloop_end	#if index > bw_size goto outerloop_end
	la	$s0, badwords_buffer	#$s0 = address of bw
	add	$s0, $s0, $s5		#$s0 = address of bw+index
	add	$s2, $zero, $zero	#set $s2 to 0

badword_sch:
	beq	$t1, $t2, badword_end	#if $t1 = comma then goto badword_end
	lbu	$t1, 0($s0)		#$t1 = bw
	addi	$s0, $s0, 1		
	addi	$s2, $s2, 1		
	j 	badword_sch		
badword_end:
	add	$s5, $s5, $s2		#$s5 = index
	la	$t0, badwords_buffer	#$t0 = address of bw
	add	$t0, $t0, $s5		#$t0 = address of bw+index
	add	$s4, $zero, $zero	#set $s4 to 0
	li	$t3, 10			

weight_sch: 
	li	$t2, 44			#$t2 = ","
	lb	$t1, 0($t0)		#$t1 = bw
	addi	$t0, $t0, 1		
	addi	$s5, $s5, 1		
	beq	$t1, $t2, weight_sch_end#if char = "," goto weight_sch_end

	lw	$t2, badwords_size	#$t2 = bw_sze
	bgt	$s5, $t2, weight_sch_end#if index > bw_size goto weight_sch_end

	mult	$s4, $t3		#$s4 = $s4 * 10
	mflo	$s4

	addi 	$t1, $t1, -48		#convert ascii to int
	move 	$s4, $t1		#$s4 = integer value 

	j 	weight_sch		  
weight_sch_end:
	sub	$s0, $s0, $s2		
	addi	$s2, $s2, -1		
	move	$s1, $zero		#$s1 = 0

	la	$a0, email_buffer	#$a0 = address of email
	lw	$a1, size		#$a1 = size of email

occurence_sch:
	move	$a2, $s0		#$a2 = address of bw
	move	$a3, $s2		#$a3 = length of bw
	jal	find_str		#goto find_str

	move	$t8, $v0		#$t8 = position of bw if found
	lw	$a1, size		#$a1 = size of email
	beq	$t8, -1, outerloop	#if bw not found then goto outerloop
	add	$s3, $s3, $s4		#increase spamscore 
	add	$s1, $s1, $t8		#$s1 = position of found bw
	la	$a0, email_buffer	#$a0 = address of email
	add	$s1, $s1, $s2		#$s1 = position of found bw + size of bw
	add	$a0, $a0, $s1		#chars before bw_end + address of haystack => not if found 

	sub	$a1, $a1, $s1		#$a1 = size of email-chars before bw_end
	j	occurence_sch		#loop

outerloop_end:
	add 	$v0, $zero, $s3		#$v0 = spamscore

	lw 	$ra, 0($sp)		
	lw 	$s0, 4($sp)
	lw 	$s1, 8($sp)
	lw	$s2, 12($sp)
	lw	$s3, 16($sp)
	lw	$s4, 20($sp)
	lw	$s5, 24($sp)
	addi 	$sp, $sp, 28

	jr 	$ra
#########################################
#

#
# data
#

.data

email_buffer: .asciiz "Hochverehrte Empfaenger,\n\nbei dieser E-Mail handelt es sich nicht um Spam sondern ich moechte Ihnen\nvielmehr ein lukratives Angebot machen: Mein entfernter Onkel hat mir mehr Geld\nhinterlassen als in meine Geldboerse passt. Ich muss Ihnen also etwas abgeben.\nVorher muss ich nur noch einen Spezialumschlag kaufen. Senden Sie mir noch\nheute BTC 1,000 per Western-Union und ich verspreche hoch und heilig Ihnen\nalsbald den gerechten Teil des Vermoegens zu vermachen.\n\nHochachtungsvoll\nAchim Mueller\nSekretaer fuer Vermoegensangelegenheiten\n"

size: .word 538

badwords_buffer: .asciiz "Spam,5,Geld,1,ROrg,0,lukrativ,3,Kohlrabi,10,Weihnachten,3,Onkel,7,Vermoegen,2,Brief,4,Lotto,3"
badwords_size: .word 93

spamscore_text: .asciiz "Der Spamscore betraegt: "


#
# main
#

.text
.globl main

main:
    # Register sichern
    addi $sp, $sp, -8
    sw $ra, 0($sp)
    sw $s0, 4($sp)


    jal spamfilter
    move $s0, $v0


    li $v0, 4
    la $a0, spamscore_text
    syscall
    move $a0, $s0
    li $v0, 1
    syscall

    li $v0, 11
    li $a0, 10
    syscall


    # Register wieder herstellen
    lw $ra, 0($sp)
    lw $s0, 4($sp)
    addi $sp, $sp, 8
    jr $ra

#
# end main
#
